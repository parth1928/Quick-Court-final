// Script to fetch and display venue data from MongoDB Atlas
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Venue Schema
const venueSchema = new mongoose.Schema({
  name: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
  description: String,
  amenities: [String],
  approvalStatus: String,
  images: [String],
  createdAt: Date,
  updatedAt: Date
}, { strict: false });

// User Schema for owner details
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  phone: String
}, { strict: false });

const Venue = mongoose.model('Venue', venueSchema);
const User = mongoose.model('User', userSchema);

async function fetchVenueData() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    console.log('📊 Database:', mongoose.connection.db?.databaseName);

    // Fetch all venues from the database with owner details
    console.log('\n🏢 Fetching all venues from database...');
    const venues = await Venue.find({}).populate('owner', 'name email phone').sort({ createdAt: -1 });

    if (venues.length === 0) {
      console.log('❌ No venues found in database');
      console.log('\n💡 Run the seed script first: node scripts/seed-indian.js');
      process.exit(0);
    }

    console.log(`\n🏟️ Found ${venues.length} venues in database:\n`);
    
    // Display venues in detail
    venues.forEach((venue, index) => {
      console.log('=' .repeat(80));
      console.log(`🏢 VENUE ${index + 1}: ${venue.name}`);
      console.log('=' .repeat(80));
      console.log(`📍 Address: ${venue.address?.street || 'N/A'}`);
      console.log(`🏙️  City: ${venue.address?.city || 'N/A'}, ${venue.address?.state || 'N/A'}`);
      console.log(`📮 ZIP: ${venue.address?.zipCode || 'N/A'}`);
      console.log(`🌍 Country: ${venue.address?.country || 'N/A'}`);
      
      if (venue.location?.coordinates?.length === 2) {
        console.log(`🗺️  Coordinates: ${venue.location.coordinates[1]}, ${venue.location.coordinates[0]}`);
      }
      
      console.log(`📝 Description: ${venue.description || 'No description'}`);
      
      if (venue.amenities?.length > 0) {
        console.log(`🎯 Amenities: ${venue.amenities.join(', ')}`);
      }
      
      console.log(`✅ Approval Status: ${venue.approvalStatus || 'pending'}`);
      
      if (venue.owner) {
        console.log(`👤 Owner: ${venue.owner.name || 'N/A'} (${venue.owner.email || 'N/A'})`);
        if (venue.owner.phone) {
          console.log(`📞 Owner Phone: ${venue.owner.phone}`);
        }
      } else {
        console.log(`👤 Owner: Not assigned`);
      }
      
      if (venue.images?.length > 0) {
        console.log(`📸 Images: ${venue.images.length} image(s)`);
        venue.images.forEach((img, i) => {
          console.log(`   ${i + 1}. ${img}`);
        });
      }
      
      if (venue.createdAt) {
        console.log(`📅 Created: ${new Date(venue.createdAt).toLocaleString()}`);
      }
      
      console.log('');
    });

    // Display summary statistics
    const stats = {
      total: venues.length,
      approved: venues.filter(v => v.approvalStatus === 'approved').length,
      pending: venues.filter(v => v.approvalStatus === 'pending').length,
      rejected: venues.filter(v => v.approvalStatus === 'rejected').length,
      withOwners: venues.filter(v => v.owner).length,
      withoutOwners: venues.filter(v => !v.owner).length
    };

    console.log('📊 VENUE STATISTICS:');
    console.log('=' .repeat(50));
    console.log(`🏟️  Total Venues: ${stats.total}`);
    console.log(`✅ Approved: ${stats.approved}`);
    console.log(`⏳ Pending: ${stats.pending}`);
    console.log(`❌ Rejected: ${stats.rejected}`);
    console.log(`👤 With Owners: ${stats.withOwners}`);
    console.log(`🚫 Without Owners: ${stats.withoutOwners}`);

    // Display venues by city
    const cities = {};
    venues.forEach(venue => {
      const city = venue.address?.city || 'Unknown';
      if (!cities[city]) cities[city] = 0;
      cities[city]++;
    });

    console.log('\n🏙️  VENUES BY CITY:');
    console.log('=' .repeat(30));
    Object.entries(cities).forEach(([city, count]) => {
      console.log(`${city}: ${count} venue(s)`);
    });

    // Display venues by approval status
    console.log('\n📋 VENUES BY STATUS:');
    console.log('=' .repeat(40));
    
    const approvedVenues = venues.filter(v => v.approvalStatus === 'approved');
    if (approvedVenues.length > 0) {
      console.log(`\n✅ APPROVED VENUES (${approvedVenues.length}):`);
      approvedVenues.forEach((venue, i) => {
        console.log(`${i + 1}. ${venue.name} - ${venue.address?.city}, ${venue.address?.state}`);
      });
    }

    const pendingVenues = venues.filter(v => v.approvalStatus === 'pending');
    if (pendingVenues.length > 0) {
      console.log(`\n⏳ PENDING VENUES (${pendingVenues.length}):`);
      pendingVenues.forEach((venue, i) => {
        console.log(`${i + 1}. ${venue.name} - ${venue.address?.city}, ${venue.address?.state}`);
      });
    }

    const rejectedVenues = venues.filter(v => v.approvalStatus === 'rejected');
    if (rejectedVenues.length > 0) {
      console.log(`\n❌ REJECTED VENUES (${rejectedVenues.length}):`);
      rejectedVenues.forEach((venue, i) => {
        console.log(`${i + 1}. ${venue.name} - ${venue.address?.city}, ${venue.address?.state}`);
      });
    }

    console.log('\n✨ Venue data fetch completed!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fetching venue data:', error);
    process.exit(1);
  }
}

fetchVenueData();
