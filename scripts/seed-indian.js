// Updated seed script with Indian locations and INR pricing
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

// User Schema (simplified for seeding)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  phone: String,
  avatar: { type: String, default: '/placeholder-user.jpg' },
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
  isBanned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Sport Schema
const sportSchema = new mongoose.Schema({
  name: String,
  icon: String,
  description: String
});

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
  approvalStatus: { type: String, default: 'pending' },
  images: [String]
});

const User = mongoose.model('User', userSchema);
const Sport = mongoose.model('Sport', sportSchema);
const Venue = mongoose.model('Venue', venueSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Sport.deleteMany({});
    await Venue.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@quickcourt.test',
      password: 'Admin@123',
      role: 'admin',
      phone: '+919876543210',
      status: 'active',
      isBanned: false
    });
    await adminUser.save();
    console.log('✅ Admin user created:');
    console.log('   Email: admin@quickcourt.test');
    console.log('   Password: Admin@123');

    // Create facility owners
    console.log('Creating facility owners...');
    const owner1 = new User({
      name: 'Raj Patel',
      email: 'raj.patel@quickcourt.test',
      password: 'Owner@123',
      role: 'owner',
      phone: '+919876543211',
      status: 'active',
      isBanned: false
    });
    await owner1.save();

    const owner2 = new User({
      name: 'Priya Sharma',
      email: 'priya.sharma@quickcourt.test',
      password: 'Owner@123',
      role: 'owner',
      phone: '+919876543212',
      status: 'active',
      isBanned: false
    });
    await owner2.save();
    console.log('✅ Facility owners created');

    // Create regular users
    console.log('Creating regular users...');
    const users = [
      {
        name: 'Arjun Singh',
        email: 'arjun.singh@quickcourt.test',
        password: 'User@123',
        role: 'user',
        phone: '+919876543213',
        status: 'active',
        isBanned: false
      },
      {
        name: 'Sneha Gupta',
        email: 'sneha.gupta@quickcourt.test',
        password: 'User@123',
        role: 'user',
        phone: '+919876543214',
        status: 'active',
        isBanned: false
      },
      {
        name: 'Vikram Reddy',
        email: 'vikram.reddy@quickcourt.test',
        password: 'User@123',
        role: 'user',
        phone: '+919876543215',
        status: 'inactive',
        isBanned: true
      },
      {
        name: 'Banned User',
        email: 'banned.user@quickcourt.test',
        password: 'User@123',
        role: 'user',
        phone: '+919876543216',
        status: 'banned',
        isBanned: true
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }
    console.log('✅ Regular users created');

    // Create sports
    console.log('Creating sports...');
    const sports = await Sport.create([
      {
        name: 'Badminton',
        icon: '🏸',
        description: 'Indoor badminton courts',
      },
      {
        name: 'Tennis',
        icon: '🎾',
        description: 'Professional tennis courts',
      },
      {
        name: 'Basketball',
        icon: '🏀',
        description: 'Full-size basketball courts',
      },
      {
        name: 'Cricket',
        icon: '🏏',
        description: 'Cricket nets and grounds',
      },
      {
        name: 'Table Tennis',
        icon: '🏓',
        description: 'Indoor table tennis facilities',
      },
    ]);
    console.log('✅ Sports created');

    // Create venues with Indian locations
    console.log('Creating venues...');
    const venues = await Venue.create([
      {
        name: 'Elite Sports Complex',
        owner: owner1._id,
        address: {
          street: 'Plot 123, Sector 18',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400703',
          country: 'India',
        },
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760],
        },
        description: 'Premier sports facility in Mumbai',
        amenities: ['Parking', 'Locker Rooms', 'Cafeteria', 'AC'],
        approvalStatus: 'approved',
        images: ['/placeholder.jpg'],
      },
      {
        name: 'Community Sports Center',
        owner: owner1._id,
        address: {
          street: '45, Ring Road',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India',
        },
        location: {
          type: 'Point',
          coordinates: [77.1025, 28.7041],
        },
        description: 'Family-friendly sports facility in Delhi',
        amenities: ['Parking', 'Pro Shop', 'Water Cooler'],
        approvalStatus: 'approved',
        images: ['/placeholder.jpg'],
      },
      {
        name: 'Bangalore Sports Club',
        owner: owner2._id,
        address: {
          street: '78, MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India',
        },
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716],
        },
        description: 'Professional sports training facility in Bengaluru',
        amenities: ['Parking', 'Pro Shop', 'Training Staff', 'Physiotherapy'],
        approvalStatus: 'approved',
        images: ['/placeholder.jpg'],
      },
    ]);
    console.log('✅ Venues created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('👤 Admin: admin@quickcourt.test / Admin@123');
    console.log('🏢 Owner: raj.patel@quickcourt.test / Owner@123');
    console.log('👥 User (Active): arjun.singh@quickcourt.test / User@123');
    console.log('❌ User (Inactive/Banned): vikram.reddy@quickcourt.test / User@123');
    console.log('🚫 User (Banned): banned.user@quickcourt.test / User@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
