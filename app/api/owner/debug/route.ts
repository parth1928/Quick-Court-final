import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Facility from '@/models/Facility';
import Court from '@/models/Court';
import Booking from '@/models/Booking';

// GET /api/owner/debug - Debug endpoint to check owner data
export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();
    
    console.log('🔍 Debug: Owner ID:', user.userId);
    console.log('🔍 Debug: User role:', user.role);

    // Get facilities owned by this user
    const facilities = await Facility.find({ 
      owner: user.userId,
      deletedAt: null 
    }).lean();

    console.log('🏢 Debug: Found facilities:', facilities.length);

    const facilityDetails = facilities.map(f => ({
      id: f._id.toString(),
      name: f.name,
      location: f.shortLocation || f.fullAddress,
      status: f.status,
      createdAt: f.createdAt
    }));

    // Get courts for these facilities
    const facilityIds = facilities.map(f => f._id);
    const courts = await Court.find({
      venue: { $in: facilityIds },
      deletedAt: null
    }).lean();

    console.log('🏟️ Debug: Found courts:', courts.length);

    const courtDetails = courts.map(c => ({
      id: c._id.toString(),
      name: c.name,
      venue: c.venue.toString(),
      sportType: c.sportType,
      status: c.status
    }));

    // Get bookings for these courts
    const courtIds = courts.map(c => c._id);
    const bookings = await Booking.find({
      court: { $in: courtIds },
      deletedAt: null
    }).lean();

    console.log('📅 Debug: Found bookings:', bookings.length);

    const bookingDetails = bookings.map(b => ({
      id: b._id.toString(),
      court: b.court.toString(),
      user: b.user.toString(),
      status: b.status,
      startTime: b.startTime,
      totalPrice: b.totalPrice,
      createdAt: b.createdAt
    }));

    return NextResponse.json({
      success: true,
      debug: {
        userId: user.userId,
        userRole: user.role,
        facilitiesCount: facilities.length,
        courtsCount: courts.length,
        bookingsCount: bookings.length,
        facilities: facilityDetails,
        courts: courtDetails,
        bookings: bookingDetails
      }
    });

  } catch (error: any) {
    console.error('💥 Debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Debug failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}, []);
