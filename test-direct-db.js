// Direct database test for match creation
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';

// Simple schemas for testing
const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true },
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
  createdBy: mongoose.Schema.Types.ObjectId,
  updatedBy: mongoose.Schema.Types.ObjectId,
  slug: String
}, { timestamps: true });

const matchSchema = new mongoose.Schema({
  sport: { type: String, required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  playersNeeded: { type: Number, required: true },
  prizeAmount: { type: Number, default: 0 },
  courtFees: { type: Number, default: 0 },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: { type: String, default: 'Open' },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId },
    joinedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

async function testDirectDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB directly...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create models
    const Venue = mongoose.models.Venue || mongoose.model('Venue', venueSchema);
    const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);

    // Create a test user ID
    const testUserId = new mongoose.Types.ObjectId();
    console.log('👤 Test user ID:', testUserId);

    // Create or find a test venue
    console.log('\n🏢 Creating/finding test venue...');
    let venue = await Venue.findOne({ name: 'Direct Test Venue' });
    
    if (!venue) {
      venue = await Venue.create({
        name: 'Direct Test Venue',
        owner: testUserId,
        description: 'Test venue created directly in database',
        sports: ['Basketball', 'Tennis', 'Badminton'],
        address: {
          street: '123 Direct Test Street',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'India'
        },
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139]
        },
        contactPhone: '1234567890',
        contactEmail: 'direct@test.com',
        createdBy: testUserId,
        updatedBy: testUserId,
        slug: `direct-test-venue-${Date.now()}`
      });
      console.log('✅ Created venue:', venue.name, venue._id);
    } else {
      console.log('✅ Found existing venue:', venue.name, venue._id);
    }

    // Create a test match
    console.log('\n🏀 Creating test match...');
    const matchData = {
      sport: 'Basketball',
      venue: venue._id,
      date: new Date('2025-08-15'),
      time: '6:00 PM - 8:00 PM',
      playersNeeded: 4,
      prizeAmount: 100,
      courtFees: 50,
      description: 'Direct database test match',
      createdBy: testUserId,
      participants: [{
        user: testUserId,
        joinedAt: new Date()
      }]
    };

    const match = await Match.create(matchData);
    console.log('✅ Match created successfully!');
    console.log('Match ID:', match._id);
    console.log('Match details:', {
      sport: match.sport,
      venue: match.venue,
      date: match.date,
      time: match.time,
      playersNeeded: match.playersNeeded,
      status: match.status
    });

    // Query matches to verify
    console.log('\n📖 Querying all matches...');
    const matches = await Match.find({})
      .populate('venue', 'name location')
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`Found ${matches.length} matches:`);
    matches.forEach((m, index) => {
      console.log(`${index + 1}. ${m.sport} at ${m.venue?.name || 'Unknown'} on ${m.date.toISOString().split('T')[0]} (${m.time})`);
    });

    console.log('\n🎉 Direct database test completed successfully!');

  } catch (error) {
    console.error('💥 Direct database test failed:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testDirectDatabase();
