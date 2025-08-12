import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Booking from '@/models/Booking';

// GET /api/users/me/bookings/verify - Quick booking verification endpoint
export const GET = withAuth(async (request: Request, user: any) => {
  try {
    await dbConnect();
    
    console.log('🔍 Verifying bookings for user:', user.userId);
    
    // Get recent bookings
    const recentBookings = await Booking.find({ 
      user: user.userId 
    })
    .populate('court', 'name sportType')
    .populate('venue', 'name shortLocation')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
    
    // Get counts by status
    const statusCounts = await Booking.aggregate([
      { $match: { user: user.userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalCount = await Booking.countDocuments({ user: user.userId });
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.userId,
          email: user.email
        },
        summary: {
          totalBookings: totalCount,
          recentBookings: recentBookings.length,
          statusBreakdown: statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        recentBookings: recentBookings.map(booking => ({
          id: booking._id.toString(),
          venue: booking.venue?.name || 'Unknown Venue',
          court: booking.court?.name || 'Unknown Court',
          sport: booking.court?.sportType || 'Unknown Sport',
          status: booking.status,
          startTime: booking.startTime,
          totalPrice: booking.totalPrice,
          createdAt: booking.createdAt
        }))
      }
    });
    
  } catch (error: any) {
    console.error('💥 Error verifying bookings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to verify bookings',
      details: error.message
    }, { status: 500 });
  }
}, []);
