import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import User from '@/models/User';
import Venue from '@/models/Venue';
import Court from '@/models/Court';
import Booking from '@/models/Booking';

// Test endpoint to verify model imports and basic functionality
export async function GET() {
  try {
    console.log('🧪 Testing database models and connection...');
    
    await dbConnect();
    console.log('✅ Database connected');
    
    // Test model imports
    const modelTests = {
      User: !!User,
      Venue: !!Venue,
      Court: !!Court,
      Booking: !!Booking
    };
    
    console.log('📋 Model imports:', modelTests);
    
    // Test basic operations
    const userCount = await User.countDocuments();
    const venueCount = await Venue.countDocuments();
    const courtCount = await Court.countDocuments();
    const bookingCount = await Booking.countDocuments();
    
    const stats = {
      users: userCount,
      venues: venueCount,
      courts: courtCount,
      bookings: bookingCount
    };
    
    console.log('📊 Database stats:', stats);
    
    // Test creating a simple venue (will be deleted)
    const testVenue = await Venue.create({
      name: 'Test Venue - Will be deleted',
      owner: '507f1f77bcf86cd799439011', // Dummy ObjectId
      shortLocation: 'Test Location',
      fullAddress: 'Test Address',
      description: 'Test venue for model verification',
      sports: ['Test Sport'],
      amenities: ['Test Amenity'],
      images: [],
      location: {
        type: 'Point',
        coordinates: [0, 0]
      },
      approvalStatus: 'approved',
      status: 'approved',
      isActive: true
    });
    
    console.log('✅ Test venue created:', testVenue.name);
    
    // Delete the test venue
    await Venue.deleteOne({ _id: testVenue._id });
    console.log('🗑️ Test venue deleted');
    
    return NextResponse.json({
      success: true,
      data: {
        database: 'connected',
        models: modelTests,
        stats,
        message: 'All models and database operations working correctly'
      }
    });
    
  } catch (error: any) {
    console.error('💥 Model test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Model test failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
