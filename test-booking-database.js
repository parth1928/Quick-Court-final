// Test script to check database connection and booking data
import dbConnect from './lib/db/connect.js';
import mongoose from 'mongoose';
import User from './models/User.js';
import Booking from './models/Booking.js';
import Court from './models/Court.js';
import Venue from './models/Venue.js';

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    await dbConnect();
    console.log('✅ Database connected successfully');
    
    // Check collections
    const userCount = await User.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const courtCount = await Court.countDocuments();
    const venueCount = await Venue.countDocuments();
    
    console.log('\n📊 Database Statistics:');
    console.log(`  Users: ${userCount}`);
    console.log(`  Bookings: ${bookingCount}`);
    console.log(`  Courts: ${courtCount}`);
    console.log(`  Venues: ${venueCount}`);
    
    // Sample a user to check structure
    if (userCount > 0) {
      const sampleUser = await User.findOne().lean();
      console.log('\n👤 Sample User:');
      console.log(`  ID: ${sampleUser._id}`);
      console.log(`  Name: ${sampleUser.name}`);
      console.log(`  Email: ${sampleUser.email}`);
      console.log(`  Role: ${sampleUser.role}`);
    }
    
    // Sample a booking if exists
    if (bookingCount > 0) {
      const sampleBooking = await Booking.findOne()
        .populate('user', 'name email')
        .populate('court', 'name sportType')
        .populate('venue', 'name')
        .lean();
      
      console.log('\n📅 Sample Booking:');
      console.log(`  ID: ${sampleBooking._id}`);
      console.log(`  User: ${sampleBooking.user?.name || 'N/A'}`);
      console.log(`  Court: ${sampleBooking.court?.name || 'N/A'}`);
      console.log(`  Venue: ${sampleBooking.venue?.name || 'N/A'}`);
      console.log(`  Status: ${sampleBooking.status}`);
      console.log(`  Date: ${sampleBooking.startTime}`);
    }
    
    // Test API endpoint structure
    console.log('\n🔧 Testing API simulation...');
    if (userCount > 0) {
      const testUser = await User.findOne({ role: 'user' }).lean();
      if (testUser) {
        const userBookings = await Booking.find({ user: testUser._id })
          .populate('court', 'name sportType pricing')
          .populate('venue', 'name shortLocation')
          .sort({ startTime: -1 })
          .limit(5)
          .lean();
        
        console.log(`  Found ${userBookings.length} bookings for user ${testUser.name}`);
        
        if (userBookings.length > 0) {
          console.log('  Sample booking details:');
          const booking = userBookings[0];
          console.log(`    Court: ${booking.court?.name || 'Unknown'}`);
          console.log(`    Venue: ${booking.venue?.name || 'Unknown'}`);
          console.log(`    Status: ${booking.status}`);
          console.log(`    Price: ${booking.totalPrice || 'N/A'}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

testDatabaseConnection();
