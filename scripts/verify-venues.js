// Quick script to verify created venue data
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';

// User Schema (needed for populate)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  phone: String,
  avatar: { type: String, default: '/placeholder-user.jpg' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Venue Schema (simplified for verification)
const venueSchema = new mongoose.Schema({
  name: String,
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sportsOffered: [String],
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  geoLocation: {
    lat: Number,
    lng: Number
  },
  amenities: [String],
  pricePerHour: Number,
  approvalStatus: String,
  rating: Number,
  totalReviews: Number,
  operatingHours: {
    open: String,
    close: String
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Venue = mongoose.model('Venue', venueSchema);

async function verifyVenues() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Get all venues
    const venues = await Venue.find().populate('owner', 'name email');
    
    console.log(`\n🏟️ VENUE DATA VERIFICATION:`);
    console.log('=' .repeat(80));
    console.log(`📊 Total Venues Found: ${venues.length}`);
    
    if (venues.length > 0) {
      // Statistics
      const stats = {
        approved: venues.filter(v => v.approvalStatus === 'approved').length,
        pending: venues.filter(v => v.approvalStatus === 'pending').length,
        cities: [...new Set(venues.map(v => v.address.city))],
        sports: [...new Set(venues.flatMap(v => v.sportsOffered))]
      };
      
      console.log(`✅ Approved: ${stats.approved}`);
      console.log(`⏳ Pending: ${stats.pending}`);
      console.log(`🏙️ Cities: ${stats.cities.join(', ')}`);
      console.log(`🏈 Sports: ${stats.sports.join(', ')}`);
      
      console.log('\n🏟️ VENUE LIST:');
      console.log('-' .repeat(80));
      
      venues.forEach((venue, index) => {
        console.log(`${index + 1}. ${venue.name}`);
        console.log(`   📍 ${venue.address.city}, ${venue.address.state}`);
        console.log(`   🏈 Sports: ${venue.sportsOffered.join(', ')}`);
        console.log(`   💰 Price: ₹${venue.pricePerHour}/hour`);
        console.log(`   📋 Status: ${venue.approvalStatus}`);
        console.log(`   👤 Owner: ${venue.owner?.name || 'Unknown'}`);
        console.log('');
      });
      
      console.log('✅ Venue data creation completed successfully!');
    } else {
      console.log('❌ No venues found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying venues:', error);
    process.exit(1);
  }
}

verifyVenues();
