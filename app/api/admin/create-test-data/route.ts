import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import Venue from '@/models/Venue';
import Court from '@/models/Court';
import Booking from '@/models/Booking';

// Simple API to create test booking data
export async function POST() {
  try {
    await dbConnect();
    
    console.log('🌱 Creating sample booking data...');
    
    // Find or create a test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword123',
        phone: '+1234567890',
        role: 'user'
      });
      console.log('✅ Created test user');
    }
    
    // Find or create a test venue
    let testVenue = await Venue.findOne({ name: 'Test Sports Complex' });
    if (!testVenue) {
      testVenue = await Venue.create({
        name: 'Test Sports Complex',
        owner: testUser._id,
        shortLocation: 'Downtown',
        fullAddress: '123 Test Street',
        description: 'A test sports facility',
        sports: ['Basketball', 'Tennis'],
        amenities: ['Parking', 'Locker Rooms'],
        images: [],
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716]
        },
        approvalStatus: 'approved',
        status: 'approved'
      });
      console.log('✅ Created test venue');
    }
    
    // Find or create a test court
    let testCourt = await Court.findOne({ name: 'Test Basketball Court' });
    if (!testCourt) {
      testCourt = await Court.create({
        venue: testVenue._id,
        name: 'Test Basketball Court',
        sportType: 'Basketball',
        description: 'Test basketball court',
        surfaceType: 'Wooden',
        indoor: true,
        capacity: 10,
        pricing: {
          hourlyRate: 500,
          currency: 'INR'
        },
        availability: {
          monday: { open: '06:00', close: '22:00' },
          tuesday: { open: '06:00', close: '22:00' },
          wednesday: { open: '06:00', close: '22:00' },
          thursday: { open: '06:00', close: '22:00' },
          friday: { open: '06:00', close: '22:00' },
          saturday: { open: '08:00', close: '20:00' },
          sunday: { open: '08:00', close: '20:00' }
        },
        isActive: true,
        status: 'active'
      });
      console.log('✅ Created test court');
    }
    
    // Clear existing test bookings
    await Booking.deleteMany({ user: testUser._id });
    console.log('🗑️ Cleared existing test bookings');
    
    // Create sample bookings
    const bookings = [];
    const now = new Date();
    
    for (let i = 0; i < 5; i++) {
      const daysOffset = Math.floor(Math.random() * 20) - 10; // -10 to +10 days
      const bookingDate = new Date(now);
      bookingDate.setDate(bookingDate.getDate() + daysOffset);
      
      const hour = Math.floor(Math.random() * 12) + 9; // 9 AM to 8 PM
      const startTime = new Date(bookingDate);
      startTime.setHours(hour, 0, 0, 0);
      
      const duration = Math.floor(Math.random() * 2) + 1; // 1-2 hours
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + duration);
      
      let status = 'confirmed';
      let paymentStatus = 'paid';
      
      if (bookingDate < now) {
        status = Math.random() > 0.8 ? 'cancelled' : 'completed';
        if (status === 'cancelled') {
          paymentStatus = 'refunded';
        }
      }
      
      const basePrice = 500 * duration;
      const tax = basePrice * 0.18;
      const total = basePrice + tax;
      
      const booking = {
        user: testUser._id,
        court: testCourt._id,
        venue: testVenue._id,
        startTime,
        endTime,
        status,
        totalPrice: Math.round(total),
        pricingBreakdown: {
          baseRate: basePrice,
          tax: Math.round(tax),
          discount: 0,
          currency: 'INR'
        },
        paymentStatus,
        paymentId: paymentStatus === 'paid' ? `test_txn_${Date.now()}_${i}` : null,
        notes: i === 0 ? 'Test booking for debugging' : null,
        createdAt: new Date(startTime.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      };
      
      bookings.push(booking);
    }
    
    const createdBookings = await Booking.insertMany(bookings);
    console.log(`✅ Created ${createdBookings.length} test bookings`);
    
    // Update user booking count
    const confirmedCount = await Booking.countDocuments({
      user: testUser._id,
      status: { $in: ['confirmed', 'completed'] }
    });
    
    await User.updateOne(
      { _id: testUser._id },
      { bookingCount: confirmedCount }
    );
    
    // Return summary
    const summary = await Booking.aggregate([
      { $match: { user: testUser._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Test booking data created successfully',
      data: {
        user: {
          id: testUser._id,
          name: testUser.name,
          email: testUser.email
        },
        venue: {
          id: testVenue._id,
          name: testVenue.name
        },
        court: {
          id: testCourt._id,
          name: testCourt.name
        },
        bookingsCreated: createdBookings.length,
        summary
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error creating test data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create test data',
        details: error.message
      },
      { status: 500 }
    );
  }
}
