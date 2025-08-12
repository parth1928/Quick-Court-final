// Complete match system test and fix
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const MONGODB_URI = 'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';
const JWT_SECRET = 'your-secret-key';

// Complete schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  phone: String,
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: true }
}, { timestamps: true });

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: String,
  sports: [String],
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  contactPhone: String,
  contactEmail: String,
  approvalStatus: { type: String, default: 'approved' },
  status: { type: String, default: 'approved' },
  isActive: { type: Boolean, default: true },
  startingPrice: { type: Number, default: 300 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  slug: String
}, { timestamps: true });

const matchSchema = new mongoose.Schema({
  sport: { type: String, required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  court: { type: mongoose.Schema.Types.ObjectId, ref: 'Court' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  playersNeeded: { type: Number, required: true, min: 2, max: 50 },
  prizeAmount: { type: Number, default: 0 },
  courtFees: { type: Number, default: 0 },
  description: String,
  rules: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Open', 'Full', 'Cancelled', 'Completed'], default: 'Open' },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

async function setupCompleteMatchSystem() {
  try {
    console.log('🚀 Setting up complete match system...');
    
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Create models
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const Venue = mongoose.models.Venue || mongoose.model('Venue', venueSchema);
    const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);
    
    // Create test user
    let testUser = await User.findOne({ email: 'testuser@example.com' });
    if (!testUser) {
      console.log('👤 Creating test user...');
      const hashedPassword = await bcrypt.hash('testpassword', 10);
      testUser = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: hashedPassword,
        role: 'user',
        phone: '+1234567890'
      });
      console.log('✅ Test user created:', testUser._id);
    } else {
      console.log('✅ Test user found:', testUser._id);
    }
    
    // Create test venues
    const venueData = [
      {
        name: 'Elite Sports Complex',
        sports: ['Basketball', 'Tennis', 'Badminton', 'Volleyball'],
        address: { street: '123 Elite Street', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India' },
        location: { coordinates: [72.8777, 19.0760] },
        contactPhone: '9999999001',
        contactEmail: 'info@elitesports.com'
      },
      {
        name: 'Community Recreation Center',
        sports: ['Basketball', 'Volleyball', 'Football', 'Cricket'],
        address: { street: '789 Community Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560001', country: 'India' },
        location: { coordinates: [77.5946, 12.9716] },
        contactPhone: '9999999003',
        contactEmail: 'info@communityrec.com'
      }
    ];
    
    const venues = [];
    for (const vData of venueData) {
      let venue = await Venue.findOne({ name: vData.name });
      if (!venue) {
        venue = await Venue.create({
          ...vData,
          owner: testUser._id,
          createdBy: testUser._id,
          updatedBy: testUser._id,
          slug: vData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
        });
        console.log('✅ Created venue:', venue.name);
      } else {
        console.log('✅ Found venue:', venue.name);
      }
      venues.push(venue);
    }
    
    // Create test matches
    const matchData = [
      {
        sport: 'Basketball',
        venue: venues[0]._id,
        date: new Date('2025-08-15'),
        time: '6:00 PM - 8:00 PM',
        playersNeeded: 4,
        prizeAmount: 500,
        courtFees: 100,
        description: 'Friendly basketball match at Elite Sports'
      },
      {
        sport: 'Volleyball',
        venue: venues[1]._id,
        date: new Date('2025-08-16'),
        time: '7:00 PM - 9:00 PM',
        playersNeeded: 6,
        prizeAmount: 300,
        courtFees: 80,
        description: 'Volleyball tournament at Community Center'
      }
    ];
    
    for (const mData of matchData) {
      const existingMatch = await Match.findOne({
        sport: mData.sport,
        venue: mData.venue,
        date: mData.date,
        time: mData.time
      });
      
      if (!existingMatch) {
        const match = await Match.create({
          ...mData,
          createdBy: testUser._id,
          participants: [{
            user: testUser._id,
            joinedAt: new Date()
          }]
        });
        console.log('✅ Created match:', match.sport, 'at', match.time);
      } else {
        console.log('✅ Match already exists:', mData.sport, 'at', mData.time);
      }
    }
    
    // Generate JWT token for testing
    const tokenPayload = {
      userId: testUser._id.toString(),
      email: testUser.email,
      role: testUser.role
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
    
    console.log('\n🎫 JWT Token for API testing:');
    console.log(token);
    
    console.log('\n📋 You can now test the API with:');
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/matches`);
    
    // Test API calls
    console.log('\n🧪 Testing API endpoints...');
    
    // Test auth
    const authTest = await fetch('http://localhost:3000/api/debug/auth', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(() => ({ ok: false, status: 'Network Error' }));
    console.log('Auth test:', authTest.ok ? '✅ Success' : `❌ Failed (${authTest.status})`);
    
    // Test GET matches
    const getTest = await fetch('http://localhost:3000/api/matches', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(() => ({ ok: false, status: 'Network Error' }));
    console.log('GET matches:', getTest.ok ? '✅ Success' : `❌ Failed (${getTest.status})`);
    
    // Test POST match
    const postData = {
      sport: 'Tennis',
      venueId: venues[0]._id.toString(),
      date: '2025-08-17',
      time: '5:00 PM - 7:00 PM',
      playersNeeded: 2,
      prizeAmount: 200,
      description: 'Tennis match via API test'
    };
    
    const postTest = await fetch('http://localhost:3000/api/matches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    }).catch(() => ({ ok: false, status: 'Network Error' }));
    console.log('POST match:', postTest.ok ? '✅ Success' : `❌ Failed (${postTest.status})`);
    
    if (postTest.ok) {
      const result = await postTest.json();
      console.log('Created match ID:', result.match?.id);
    }
    
    console.log('\n🎉 Complete match system setup finished!');
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

setupCompleteMatchSystem();
