import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

import dbConnect from '../lib/db/connect.js';
import User from '../models/User.js';
import Sport from '../models/Sport.js';
import Venue from '../models/Venue.js';
import Court from '../models/Court.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

async function seed() {
  try {
    await dbConnect();
    
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Sport.deleteMany({}),
      Venue.deleteMany({}),
      Court.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
    ]);

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
      {
        name: 'Regular User 3',
        email: 'user3@quickcourt.test',
        password: 'User@123',
        role: 'user',
        phone: '+1234567895',
      },
    ]);

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

    // Create venues
    const venues = await Venue.create([
      {
        name: 'Elite Sports Complex',
        owner: users[1]._id,
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
        },
        description: 'Premier sports facility in downtown',
        amenities: ['Parking', 'Locker Rooms', 'Cafe'],
        approvalStatus: 'approved',
        images: ['/placeholder.jpg'],
      },
      {
        name: 'Community Sports Center',
        owner: users[1]._id,
        address: {
          street: '456 Park Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA',
        },
        location: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522],
        },
        description: 'Family-friendly sports facility',
        amenities: ['Parking', 'Pro Shop'],
        approvalStatus: 'approved',
        images: ['/placeholder.jpg'],
      },
      {
        name: 'Pro Athletics Club',
        owner: users[2]._id,
        address: {
          street: '789 Sports Blvd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA',
        },
        location: {
          type: 'Point',
          coordinates: [-87.6298, 41.8781],
        },
        description: 'Professional sports training facility',
        amenities: ['Parking', 'Pro Shop', 'Training Staff'],
        approvalStatus: 'approved',
        images: ['/placeholder.jpg'],
      },
    ]);

    // Create courts
    const courts = await Court.create([
      {
        venue: venues[0]._id,
        name: 'Court 1',
        sport: sports[0]._id, // Badminton
        surfaceType: 'Synthetic',
        indoor: true,
        pricing: {
          hourlyRate: 30,
        },
      },
      {
        venue: venues[0]._id,
        name: 'Court 2',
        sport: sports[1]._id, // Tennis
        surfaceType: 'Hard Court',
        indoor: false,
        pricing: {
          hourlyRate: 40,
        },
      },
      {
        venue: venues[1]._id,
        name: 'Court A',
        sport: sports[2]._id, // Basketball
        surfaceType: 'Wooden',
        indoor: true,
        pricing: {
          hourlyRate: 50,
        },
      },
      {
        venue: venues[1]._id,
        name: 'Field 1',
        sport: sports[3]._id, // Football
        surfaceType: 'Artificial Turf',
        indoor: false,
        pricing: {
          hourlyRate: 80,
        },
      },
      {
        venue: venues[2]._id,
        name: 'TT Room 1',
        sport: sports[4]._id, // Table Tennis
        surfaceType: 'Indoor',
        indoor: true,
        pricing: {
          hourlyRate: 20,
        },
      },
    ]);

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
        totalPrice: 30,
        paymentStatus: 'paid',
      },
      {
        court: courts[1]._id,
        user: users[4]._id,
        startTime: new Date(tomorrow.setHours(14, 0, 0)),
        endTime: new Date(tomorrow.setHours(16, 0, 0)),
        status: 'confirmed',
        totalPrice: 80,
        paymentStatus: 'paid',
      },
    ]);

    // Create sample reviews
    await Review.create([
      {
        venue: venues[0]._id,
        user: users[3]._id,
        rating: 5,
        comment: 'Excellent facilities and service!',
      },
      {
        venue: venues[1]._id,
        user: users[4]._id,
        rating: 4,
        comment: 'Great location and well-maintained courts.',
      },
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
