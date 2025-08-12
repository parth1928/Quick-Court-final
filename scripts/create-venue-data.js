// Script to create comprehensive venue data for QuickCourt
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

// User Schema
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

// Enhanced Venue Schema matching your requirements
const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    minlength: 3
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sportsOffered: {
    type: [String],
    required: true,
    enum: ['badminton', 'tennis', 'basketball', 'cricket', 'football', 'volleyball', 'table-tennis', 'squash', 'swimming']
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  geoLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  amenities: {
    type: [String],
    enum: ['lights', 'parking', 'showers', 'lockers', 'cafeteria', 'first-aid', 'ac', 'wifi', 'equipment-rental', 'pro-shop'],
    default: []
  },
  pricePerHour: {
    type: Number,
    required: true,
    min: 1,
    max: 10000
  },
  images: {
    type: [String],
    default: []
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  operatingHours: {
    open: { type: String, default: '06:00' },
    close: { type: String, default: '22:00' }
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Venue = mongoose.model('Venue', venueSchema);

// Sample venue data with real Indian locations
const venueData = [
  {
    name: "Elite Sports Complex Mumbai",
    description: "Premier multi-sport facility in the heart of Mumbai with state-of-the-art infrastructure and professional coaching staff.",
    sportsOffered: ["badminton", "tennis", "basketball"],
    address: {
      street: "Plot 123, Sector 18, Vashi",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400703",
      country: "India"
    },
    geoLocation: { lat: 19.0760, lng: 72.8777 },
    amenities: ["lights", "parking", "showers", "lockers", "cafeteria", "ac", "pro-shop"],
    pricePerHour: 800,
    images: ["/venues/elite-mumbai-1.jpg", "/venues/elite-mumbai-2.jpg"],
    approvalStatus: "approved",
    operatingHours: { open: "06:00", close: "23:00" },
    rating: 4.5,
    totalReviews: 128
  },
  {
    name: "Delhi Sports Arena",
    description: "Modern sports facility with multiple courts and excellent amenities. Perfect for tournaments and regular practice sessions.",
    sportsOffered: ["cricket", "football", "volleyball"],
    address: {
      street: "45, Ring Road, Lajpat Nagar",
      city: "Delhi",
      state: "Delhi",
      pincode: "110024",
      country: "India"
    },
    geoLocation: { lat: 28.7041, lng: 77.1025 },
    amenities: ["lights", "parking", "first-aid", "equipment-rental", "wifi"],
    pricePerHour: 600,
    images: ["/venues/delhi-arena-1.jpg"],
    approvalStatus: "approved",
    operatingHours: { open: "05:30", close: "22:30" },
    rating: 4.2,
    totalReviews: 89
  },
  {
    name: "Bangalore Sports Club",
    description: "Premium sports club offering world-class facilities for badminton and table tennis with air-conditioned courts.",
    sportsOffered: ["badminton", "table-tennis", "squash"],
    address: {
      street: "78, MG Road, Brigade Road",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      country: "India"
    },
    geoLocation: { lat: 12.9716, lng: 77.5946 },
    amenities: ["ac", "parking", "showers", "lockers", "pro-shop", "wifi"],
    pricePerHour: 750,
    images: ["/venues/bangalore-club-1.jpg", "/venues/bangalore-club-2.jpg"],
    approvalStatus: "approved",
    operatingHours: { open: "06:00", close: "22:00" },
    rating: 4.7,
    totalReviews: 156
  },
  {
    name: "Hyderabad Tennis Academy",
    description: "Professional tennis facility with clay and hard courts. Coaching available for all skill levels.",
    sportsOffered: ["tennis"],
    address: {
      street: "Road No. 36, Jubilee Hills",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500033",
      country: "India"
    },
    geoLocation: { lat: 17.3850, lng: 78.4867 },
    amenities: ["lights", "parking", "pro-shop", "equipment-rental"],
    pricePerHour: 900,
    images: ["/venues/hyderabad-tennis-1.jpg"],
    approvalStatus: "approved",
    operatingHours: { open: "06:00", close: "21:00" },
    rating: 4.3,
    totalReviews: 67
  },
  {
    name: "Chennai Cricket Ground",
    description: "Well-maintained cricket ground with nets and practice facilities. Ideal for team practices and matches.",
    sportsOffered: ["cricket"],
    address: {
      street: "Anna Salai, Near Spencer Plaza",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600002",
      country: "India"
    },
    geoLocation: { lat: 13.0827, lng: 80.2707 },
    amenities: ["lights", "parking", "equipment-rental", "first-aid"],
    pricePerHour: 500,
    images: ["/venues/chennai-cricket-1.jpg"],
    approvalStatus: "approved",
    operatingHours: { open: "05:00", close: "20:00" },
    rating: 4.0,
    totalReviews: 45
  },
  {
    name: "Pune Multi-Sport Center",
    description: "Comprehensive sports facility offering multiple indoor and outdoor sports with modern equipment.",
    sportsOffered: ["badminton", "basketball", "volleyball", "table-tennis"],
    address: {
      street: "123, FC Road, Shivajinagar",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411005",
      country: "India"
    },
    geoLocation: { lat: 18.5204, lng: 73.8567 },
    amenities: ["ac", "parking", "showers", "lockers", "cafeteria", "wifi"],
    pricePerHour: 650,
    images: ["/venues/pune-multi-1.jpg", "/venues/pune-multi-2.jpg"],
    approvalStatus: "approved",
    operatingHours: { open: "06:00", close: "22:30" },
    rating: 4.4,
    totalReviews: 102
  },
  {
    name: "Kolkata Swimming & Sports Complex",
    description: "Premium facility with Olympic-size swimming pool and multiple sports courts. Professional coaching available.",
    sportsOffered: ["swimming", "badminton", "tennis"],
    address: {
      street: "Park Street, Near Quest Mall",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700016",
      country: "India"
    },
    geoLocation: { lat: 22.5726, lng: 88.3639 },
    amenities: ["showers", "lockers", "parking", "cafeteria", "pro-shop", "first-aid"],
    pricePerHour: 1000,
    images: ["/venues/kolkata-swim-1.jpg"],
    approvalStatus: "approved",
    operatingHours: { open: "05:30", close: "22:00" },
    rating: 4.6,
    totalReviews: 134
  },
  {
    name: "Ahmedabad Sports Hub",
    description: "Modern sports facility with synthetic courts and excellent lighting. Popular among local sports enthusiasts.",
    sportsOffered: ["badminton", "squash", "table-tennis"],
    address: {
      street: "CG Road, Navrangpura",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380009",
      country: "India"
    },
    geoLocation: { lat: 23.0225, lng: 72.5714 },
    amenities: ["lights", "ac", "parking", "equipment-rental", "wifi"],
    pricePerHour: 550,
    images: ["/venues/ahmedabad-hub-1.jpg"],
    approvalStatus: "approved",
    operatingHours: { open: "06:00", close: "22:00" },
    rating: 4.1,
    totalReviews: 78
  },
  {
    name: "Jaipur Royal Courts",
    description: "Heritage-style sports facility with traditional architecture and modern amenities. Perfect for corporate events.",
    sportsOffered: ["badminton", "tennis", "cricket"],
    address: {
      street: "MI Road, C-Scheme",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302001",
      country: "India"
    },
    geoLocation: { lat: 26.9124, lng: 75.7873 },
    amenities: ["parking", "cafeteria", "pro-shop", "equipment-rental"],
    pricePerHour: 700,
    images: ["/venues/jaipur-royal-1.jpg", "/venues/jaipur-royal-2.jpg"],
    approvalStatus: "pending",
    operatingHours: { open: "06:30", close: "21:30" },
    rating: 0,
    totalReviews: 0
  },
  {
    name: "Kochi Marine Drive Sports",
    description: "Waterfront sports facility with scenic views and excellent ventilation. Popular for evening matches.",
    sportsOffered: ["football", "volleyball", "basketball"],
    address: {
      street: "Marine Drive, Ernakulam",
      city: "Kochi",
      state: "Kerala",
      pincode: "682031",
      country: "India"
    },
    geoLocation: { lat: 9.9312, lng: 76.2673 },
    amenities: ["lights", "parking", "first-aid", "equipment-rental"],
    pricePerHour: 450,
    images: ["/venues/kochi-marine-1.jpg"],
    approvalStatus: "approved",
    operatingHours: { open: "06:00", close: "21:00" },
    rating: 4.2,
    totalReviews: 56
  }
];

async function createVenueData() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Get existing users to assign as owners
    console.log('\n👥 Fetching existing users...');
    const users = await User.find({ role: { $in: ['owner', 'admin'] } });
    
    if (users.length === 0) {
      console.log('❌ No owners or admins found. Creating sample owners first...');
      
      // Create sample owners
      const sampleOwners = [
        {
          name: 'Rajesh Kumar',
          email: 'rajesh.owner@quickcourt.test',
          password: await bcrypt.hash('Owner@123', 10),
          role: 'owner',
          phone: '+919876543220'
        },
        {
          name: 'Priya Sharma',
          email: 'priya.owner@quickcourt.test', 
          password: await bcrypt.hash('Owner@123', 10),
          role: 'owner',
          phone: '+919876543221'
        },
        {
          name: 'Amit Patel',
          email: 'amit.owner@quickcourt.test',
          password: await bcrypt.hash('Owner@123', 10),
          role: 'owner', 
          phone: '+919876543222'
        }
      ];
      
      for (const ownerData of sampleOwners) {
        const owner = new User(ownerData);
        await owner.save();
        users.push(owner);
      }
      
      console.log(`✅ Created ${sampleOwners.length} sample owners`);
    }

    console.log(`👤 Found ${users.length} potential venue owners`);

    // Clear existing venues (optional)
    const existingVenues = await Venue.countDocuments();
    if (existingVenues > 0) {
      console.log(`\n🗑️ Found ${existingVenues} existing venues. Removing them...`);
      await Venue.deleteMany({});
      console.log('✅ Cleared existing venues');
    }

    // Create venues
    console.log('\n🏟️ Creating venues...');
    const createdVenues = [];
    
    for (let i = 0; i < venueData.length; i++) {
      const data = venueData[i];
      
      // Assign random owner
      const randomOwner = users[Math.floor(Math.random() * users.length)];
      
      const venue = new Venue({
        ...data,
        owner: randomOwner._id
      });
      
      await venue.save();
      createdVenues.push(venue);
      
      console.log(`   ✅ Created: ${venue.name}`);
    }

    console.log(`\n🎉 Successfully created ${createdVenues.length} venues!`);

    // Display summary
    console.log('\n📊 VENUE CREATION SUMMARY:');
    console.log('=' .repeat(80));
    
    const stats = {
      total: createdVenues.length,
      approved: createdVenues.filter(v => v.approvalStatus === 'approved').length,
      pending: createdVenues.filter(v => v.approvalStatus === 'pending').length,
      cities: [...new Set(createdVenues.map(v => v.address.city))].length,
      sports: [...new Set(createdVenues.flatMap(v => v.sportsOffered))].length
    };
    
    console.log(`🏟️ Total Venues Created: ${stats.total}`);
    console.log(`✅ Approved Venues: ${stats.approved}`);
    console.log(`⏳ Pending Approval: ${stats.pending}`);
    console.log(`🏙️ Cities Covered: ${stats.cities}`);
    console.log(`🏈 Sports Available: ${stats.sports}`);

    // List all venues
    console.log('\n🏟️ VENUE LIST:');
    console.log('=' .repeat(100));
    console.log('| Name                        | City          | Sports          | Price/Hr | Status    |');
    console.log('=' .repeat(100));
    
    createdVenues.forEach(venue => {
      const name = venue.name.padEnd(26, ' ').substring(0, 26);
      const city = venue.address.city.padEnd(12, ' ').substring(0, 12);
      const sports = venue.sportsOffered.join(', ').padEnd(14, ' ').substring(0, 14);
      const price = `₹${venue.pricePerHour}`.padEnd(7, ' ').substring(0, 7);
      const status = venue.approvalStatus.padEnd(8, ' ').substring(0, 8);
      
      console.log(`| ${name} | ${city} | ${sports} | ${price} | ${status} |`);
    });
    
    console.log('=' .repeat(100));

    // API Testing Information
    console.log('\n🔧 API TESTING ENDPOINTS:');
    console.log('GET /api/venues/new - Fetch all venues');
    console.log('GET /api/venues/new?city=Mumbai - Filter by city');
    console.log('GET /api/venues/new?sport=badminton - Filter by sport');
    console.log('GET /api/venues/new?minPrice=500&maxPrice=800 - Filter by price range');
    console.log('POST /api/venues/new - Create new venue (requires auth)');

    console.log('\n🔑 OWNER LOGIN CREDENTIALS:');
    users.forEach(user => {
      console.log(`👤 ${user.name}: ${user.email} / Owner@123`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating venue data:', error);
    process.exit(1);
  }
}

createVenueData();
