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

// Venue Schema (to match existing database structure)
const venueSchema = new mongoose.Schema({
  name: String,
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sportsOffered: [String],
  sports: [String], // legacy field
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    zipCode: String, // legacy field
    country: String
  },
  geoLocation: {
    lat: Number,
    lng: Number
  },
  location: {
    type: String,
    coordinates: [Number]
  },
  amenities: [String],
  pricePerHour: Number,
  startingPrice: Number, // legacy field
  images: [String],
  photos: [String], // legacy field
  approvalStatus: String,
  status: String, // legacy field
  isActive: Boolean,
  rating: Number,
  totalReviews: Number,
  reviewCount: Number, // legacy field
  operatingHours: {
    open: String,
    close: String
  },
  fullAddress: String,
  shortLocation: String,
  contactNumber: String,
  contactPhone: String,
  contactEmail: String,
  mapLink: String,
  slug: String,
  createdAt: Date,
  updatedAt: Date
}, { strict: false });

const Venue = mongoose.model('Venue', venueSchema);

async function fetchVenueData() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    console.log('📊 Database:', mongoose.connection.db?.databaseName);

    // Fetch all venues from the database
    console.log('\n📋 Fetching all venues from database...');
    const venues = await Venue.find({}).populate('owner', 'name email role').sort({ createdAt: -1 });

    if (venues.length === 0) {
      console.log('❌ No venues found in database');
      console.log('\n💡 To create sample venues, you can use the venue creation API');
      process.exit(0);
    }

    console.log(`\n🏟️ Found ${venues.length} venues in database:\n`);
    
    // Display venues in a formatted table
    console.log('=' .repeat(140));
    console.log('| Name                     | City           | Sports          | Price/Hr | Status    | Owner               | Created    |');
    console.log('=' .repeat(140));
    
    venues.forEach((venue, index) => {
      const name = (venue.name || 'N/A').padEnd(23, ' ').substring(0, 23);
      const city = (venue.address?.city || venue.shortLocation || 'N/A').padEnd(13, ' ').substring(0, 13);
      const sports = ((venue.sportsOffered || venue.sports || []).join(', ') || 'N/A').padEnd(14, ' ').substring(0, 14);
      const price = `₹${(venue.pricePerHour || venue.startingPrice || 0)}`.padEnd(7, ' ').substring(0, 7);
      const status = (venue.approvalStatus || venue.status || 'unknown').padEnd(8, ' ').substring(0, 8);
      const owner = (venue.owner?.name || 'N/A').padEnd(18, ' ').substring(0, 18);
      const created = venue.createdAt ? 
        new Date(venue.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) : 
        'Unknown';
      
      console.log(`| ${name} | ${city} | ${sports} | ${price} | ${status} | ${owner} | ${created} |`);
    });
    
    console.log('=' .repeat(140));

    // Display statistics
    const stats = {
      total: venues.length,
      approved: venues.filter(v => v.approvalStatus === 'approved' || v.status === 'approved').length,
      pending: venues.filter(v => v.approvalStatus === 'pending' || v.status === 'pending').length,
      rejected: venues.filter(v => v.approvalStatus === 'rejected' || v.status === 'rejected').length,
      active: venues.filter(v => v.isActive !== false).length,
      withOwner: venues.filter(v => v.owner).length
    };

    console.log('\n📊 VENUE STATISTICS:');
    console.log(`🏟️  Total Venues: ${stats.total}`);
    console.log(`✅ Approved: ${stats.approved}`);
    console.log(`⏳ Pending: ${stats.pending}`);
    console.log(`❌ Rejected: ${stats.rejected}`);
    console.log(`🔄 Active: ${stats.active}`);
    console.log(`👤 With Owner: ${stats.withOwner}`);

    // Display sports breakdown
    const allSports = new Set();
    venues.forEach(venue => {
      const sports = venue.sportsOffered || venue.sports || [];
      sports.forEach(sport => allSports.add(sport));
    });

    console.log('\n🏈 SPORTS OFFERED:');
    Array.from(allSports).forEach(sport => {
      const count = venues.filter(v => 
        (v.sportsOffered || v.sports || []).includes(sport)
      ).length;
      console.log(`   ${sport}: ${count} venues`);
    });

    // Display city breakdown
    const cityStats = {};
    venues.forEach(venue => {
      const city = venue.address?.city || 'Unknown';
      cityStats[city] = (cityStats[city] || 0) + 1;
    });

    console.log('\n🏙️ CITY BREAKDOWN:');
    Object.entries(cityStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([city, count]) => {
        console.log(`   ${city}: ${count} venues`);
      });

    // Display price range
    const prices = venues
      .map(v => v.pricePerHour || v.startingPrice || 0)
      .filter(p => p > 0)
      .sort((a, b) => a - b);

    if (prices.length > 0) {
      console.log('\n💰 PRICE RANGE:');
      console.log(`   Minimum: ₹${prices[0]}/hour`);
      console.log(`   Maximum: ₹${prices[prices.length - 1]}/hour`);
      console.log(`   Average: ₹${Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)}/hour`);
    }

    // Display detailed information for first few venues
    console.log('\n🏟️ DETAILED VENUE INFORMATION:');
    const detailedVenues = venues.slice(0, 3);
    
    detailedVenues.forEach((venue, index) => {
      console.log(`\n${index + 1}. ${venue.name}`);
      console.log(`   📧 Owner: ${venue.owner?.name || 'N/A'} (${venue.owner?.email || 'N/A'})`);
      console.log(`   📍 Address: ${venue.address?.street || 'N/A'}, ${venue.address?.city || 'N/A'}`);
      console.log(`   🏈 Sports: ${(venue.sportsOffered || venue.sports || []).join(', ') || 'N/A'}`);
      console.log(`   💰 Price: ₹${venue.pricePerHour || venue.startingPrice || 0}/hour`);
      console.log(`   ⭐ Rating: ${venue.rating || 0}/5 (${venue.totalReviews || venue.reviewCount || 0} reviews)`);
      console.log(`   📊 Status: ${venue.approvalStatus || venue.status || 'unknown'}`);
      console.log(`   🏠 Amenities: ${(venue.amenities || []).join(', ') || 'None listed'}`);
      if (venue.geoLocation) {
        console.log(`   🗺️  Coordinates: ${venue.geoLocation.lat}, ${venue.geoLocation.lng}`);
      }
      if (venue.operatingHours) {
        console.log(`   🕒 Hours: ${venue.operatingHours.open || '06:00'} - ${venue.operatingHours.close || '22:00'}`);
      }
    });

    if (venues.length > 3) {
      console.log(`\n... and ${venues.length - 3} more venues`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fetching venue data:', error);
    process.exit(1);
  }
}

fetchVenueData();
