import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env.local') });

// Define schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  phone: String,
});

const sportSchema = new mongoose.Schema({
  name: String,
  icon: String,
  description: String,
});

const venueSchema = new mongoose.Schema({
  name: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  location: {
    type: { type: String },
    coordinates: [Number],
  },
  description: String,
  amenities: [String],
  approvalStatus: String,
  images: [String],
});

const courtSchema = new mongoose.Schema({
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  name: String,
  sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport' },
  surfaceType: String,
  indoor: Boolean,
  pricing: {
    hourlyRate: Number,
  },
});

const bookingSchema = new mongoose.Schema({
  court: { type: mongoose.Schema.Types.ObjectId, ref: 'Court' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startTime: Date,
  endTime: Date,
  status: String,
  totalPrice: Number,
  paymentStatus: String,
});

const reviewSchema = new mongoose.Schema({
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
  comment: String,
});

// Add password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Create models
const User = mongoose.model('User', userSchema);
const Sport = mongoose.model('Sport', sportSchema);
const Venue = mongoose.model('Venue', venueSchema);
const Court = mongoose.model('Court', courtSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Review = mongoose.model('Review', reviewSchema);

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Sport.deleteMany({}),
      Venue.deleteMany({}),
      Court.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@quickcourt.test',
        password: 'Admin@123',
        role: 'admin',
        phone: '+1234567890',
      },
      {
        name: 'Facility Owner 1',
        email: 'owner1@quickcourt.test',
        password: 'Owner@123',
        role: 'owner',
        phone: '+1234567891',
      },
      {
        name: 'Facility Owner 2',
        email: 'owner2@quickcourt.test',
        password: 'Owner@123',
        role: 'owner',
        phone: '+1234567892',
      },
      {
        name: 'Regular User 1',
        email: 'user1@quickcourt.test',
        password: 'User@123',
        role: 'user',
        phone: '+1234567893',
      },
      {
        name: 'Regular User 2',
        email: 'user2@quickcourt.test',
        password: 'User@123',
        role: 'user',
        phone: '+1234567894',
      },
    ]);
    console.log('Created users');

    // Create sports
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
        name: 'Football',
        icon: '⚽',
        description: 'Football turfs and fields',
      },
      {
        name: 'Table Tennis',
        icon: '🏓',
        description: 'Indoor table tennis facilities',
      },
    ]);
    console.log('Created sports');

    // Create venues
    const venues = await Venue.create([
      {
        name: 'Elite Sports Complex',
        owner: users[1]._id,
        address: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
        },
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760],
        },
        description: 'Premier sports facility in downtown Mumbai',
        amenities: ['Parking', 'Locker Rooms', 'Cafe'],
        approvalStatus: 'approved',
        images: ['/placeholder.jpg'],
      },
      {
        name: 'Community Sports Center',
        owner: users[1]._id,
        address: {
          street: '456 Park Ave',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India',
        },
        location: {
          type: 'Point',
          coordinates: [77.1025, 28.7041],
        },
        description: 'Family-friendly sports facility',
        amenities: ['Parking', 'Pro Shop'],
        approvalStatus: 'approved',
        images: ['/placeholder.jpg'],
      },
    ]);
    console.log('Created venues');

    // Create courts
    const courts = await Court.create([
      {
        venue: venues[0]._id,
        name: 'Court 1',
        sport: sports[0]._id,
        surfaceType: 'Synthetic',
        indoor: true,
        pricing: {
          hourlyRate: 500,
        },
      },
      {
        venue: venues[0]._id,
        name: 'Court 2',
        sport: sports[1]._id,
        surfaceType: 'Hard Court',
        indoor: false,
        pricing: {
          hourlyRate: 800,
        },
      },
      {
        venue: venues[1]._id,
        name: 'Court A',
        sport: sports[2]._id,
        surfaceType: 'Wooden',
        indoor: true,
        pricing: {
          hourlyRate: 1000,
        },
      },
    ]);
    console.log('Created courts');

    // Create sample bookings
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Booking.create([
      {
        court: courts[0]._id,
        user: users[3]._id,
        startTime: new Date(tomorrow.setHours(10, 0, 0)),
        endTime: new Date(tomorrow.setHours(11, 0, 0)),
        status: 'confirmed',
        totalPrice: 500,
        paymentStatus: 'paid',
      },
    ]);
    console.log('Created bookings');

    // Create sample reviews
    await Review.create([
      {
        venue: venues[0]._id,
        user: users[3]._id,
        rating: 5,
        comment: 'Excellent facilities and service!',
      },
    ]);
    console.log('Created reviews');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
