import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import User from '@/models/User';
import Venue from '@/models/Venue';
import Court from '@/models/Court';
import Booking from '@/models/Booking';

// Create test bookings for the current logged-in user
export const POST = withAuth(async (request: Request, user: any) => {
  try {
    await dbConnect();
    
    console.log('🎯 Creating bookings for current user:', { id: user.userId, email: user.email });
    
    // Get the current user document
    const currentUser = await User.findById(user.userId);
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        error: 'Current user not found'
      }, { status: 404 });
    }
    
    // Find or create a test venue
    let testVenue = await Venue.findOne({ name: 'Test Sports Complex' });
    if (!testVenue) {
      testVenue = await Venue.create({
        name: 'Test Sports Complex',
        owner: user.userId, // Use current user as owner
        shortLocation: 'Downtown',
        fullAddress: '123 Test Street, Sports District',
        description: 'A comprehensive sports facility with multiple courts',
        sports: ['Basketball', 'Tennis', 'Badminton'],
        amenities: ['Parking', 'Locker Rooms', 'Cafeteria', 'Pro Shop'],
        images: ['/placeholder.jpg'],
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716] // Bangalore coordinates
        },
        contactInfo: {
          phone: '+91-9876543210',
          email: 'contact@testsports.com'
        },
        operatingHours: {
          monday: { open: '06:00', close: '22:00' },
          tuesday: { open: '06:00', close: '22:00' },
          wednesday: { open: '06:00', close: '22:00' },
          thursday: { open: '06:00', close: '22:00' },
          friday: { open: '06:00', close: '22:00' },
          saturday: { open: '08:00', close: '20:00' },
          sunday: { open: '08:00', close: '20:00' }
        },
        approvalStatus: 'approved',
        status: 'approved',
        isActive: true
      });
      console.log('✅ Created test venue');
    }
    
    // Find or create test courts
    const courtTypes = [
      { name: 'Basketball Court A', sportType: 'Basketball', surfaceType: 'Hardcourt' },
      { name: 'Tennis Court 1', sportType: 'Tennis', surfaceType: 'Clay' },
      { name: 'Badminton Court B', sportType: 'Badminton', surfaceType: 'Synthetic' }
    ];
    
    const testCourts = [];
    for (const courtData of courtTypes) {
      let court = await Court.findOne({ 
        name: courtData.name, 
        venue: testVenue._id 
      });
      
      if (!court) {
        court = await Court.create({
          name: courtData.name,
          venue: testVenue._id,
          sportType: courtData.sportType,
          surfaceType: courtData.surfaceType,
          description: `Professional ${courtData.sportType} court with modern facilities`,
          images: ['/placeholder.jpg'],
          pricing: {
            hourlyRate: 500 + Math.floor(Math.random() * 300), // 500-800 INR
            currency: 'INR',
            peakHourMultiplier: 1.5,
            weekendMultiplier: 1.2
          },
          amenities: ['Lighting', 'Sound System', 'Scoreboard'],
          operatingHours: {
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
        console.log(`✅ Created court: ${courtData.name}`);
      }
      testCourts.push(court);
    }
    
    // Clear existing test bookings for this user
    await Booking.deleteMany({ user: user.userId });
    console.log('🗑️ Cleared existing bookings for current user');
    
    // Create sample bookings for the current user
    const bookings = [];
    const now = new Date();
    const statuses = ['confirmed', 'completed', 'pending', 'cancelled'];
    const paymentStatuses = ['paid', 'pending', 'refunded'];
    
    for (let i = 0; i < 10; i++) {
      const court = testCourts[i % testCourts.length];
      const daysOffset = Math.floor(Math.random() * 30) - 15; // -15 to +15 days from now
      const startTime = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
      
      // Set random time between 8 AM and 8 PM
      const hours = 8 + Math.floor(Math.random() * 12);
      startTime.setHours(hours, 0, 0, 0);
      
      const duration = [60, 90, 120][Math.floor(Math.random() * 3)]; // 1, 1.5, or 2 hours
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      
      let status = statuses[Math.floor(Math.random() * statuses.length)];
      let paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      
      // Logical status combinations
      if (startTime < now) {
        status = ['completed', 'cancelled'][Math.floor(Math.random() * 2)];
        if (status === 'completed') {
          paymentStatus = 'paid';
        } else if (status === 'cancelled') {
          paymentStatus = 'refunded';
        }
      } else {
        status = ['confirmed', 'pending'][Math.floor(Math.random() * 2)];
        if (status === 'confirmed') {
          paymentStatus = 'paid';
        }
      }
      
      const basePrice = court.pricing.hourlyRate * (duration / 60);
      const tax = basePrice * 0.18; // 18% GST
      const total = basePrice + tax;
      
      const booking = {
        user: user.userId,
        court: court._id,
        venue: testVenue._id,
        startTime,
        endTime,
        status,
        totalPrice: Math.round(total),
        pricingBreakdown: {
          baseRate: Math.round(basePrice),
          tax: Math.round(tax),
          discount: 0,
          currency: 'INR'
        },
        paymentStatus,
        paymentId: paymentStatus === 'paid' ? `test_txn_${Date.now()}_${i}` : null,
        notes: i === 0 ? 'Test booking created for debugging' : null,
        createdAt: new Date(startTime.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      };
      
      bookings.push(booking);
    }
    
    const createdBookings = await Booking.insertMany(bookings);
    console.log(`✅ Created ${createdBookings.length} bookings for user: ${currentUser.name}`);
    
    // Update user booking count
    const confirmedCount = await Booking.countDocuments({
      user: user.userId,
      status: { $in: ['confirmed', 'completed'] }
    });
    
    await User.updateOne(
      { _id: user.userId },
      { bookingCount: confirmedCount }
    );
    
    // Return summary
    const summary = await Booking.aggregate([
      { $match: { user: user.userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdBookings.length} test bookings for ${currentUser.name}`,
      data: {
        user: {
          id: user.userId,
          name: currentUser.name,
          email: currentUser.email
        },
        bookingsCreated: createdBookings.length,
        venue: {
          id: testVenue._id,
          name: testVenue.name
        },
        courts: testCourts.map(c => ({
          id: c._id,
          name: c.name,
          sport: c.sportType
        })),
        summary: summary.map(s => ({
          status: s._id,
          count: s.count,
          totalAmount: s.totalAmount
        }))
      }
    });
    
  } catch (error: any) {
    console.error('💥 Error creating user bookings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create test bookings',
      details: error.message
    }, { status: 500 });
  }
}, []); // No role restrictions
