import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import dbConnect from '@/lib/db/connect';
import Booking from '@/models/Booking';

// GET /api/admin/charts/venue-bookings
export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();
    
    console.log('📊 Fetching venue bookings distribution...');
    
    // Aggregate bookings by venue
    const venueBookings = await Booking.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' }
        }
      },
      {
        $lookup: {
          from: 'venues',
          localField: 'venue',
          foreignField: '_id',
          as: 'venueInfo'
        }
      },
      {
        $group: {
          _id: '$venue',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          venueName: {
            $first: {
              $arrayElemAt: ['$venueInfo.name', 0]
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10 // Top 10 venues
      }
    ]);
    
    console.log('📈 Venue bookings data points:', venueBookings.length);
    
    // Format data for pie chart
    const venues = venueBookings.map(item => ({
      name: item.venueName || 'Unknown Venue',
      value: item.count,
      revenue: item.totalRevenue || 0,
      venueId: item._id
    }));
    
    // Calculate totals
    const totalBookings = venues.reduce((sum, venue) => sum + venue.value, 0);
    const totalRevenue = venues.reduce((sum, venue) => sum + venue.revenue, 0);
    
    return NextResponse.json({
      success: true,
      data: {
        venues,
        summary: {
          totalVenues: venues.length,
          totalBookings,
          totalRevenue,
          topVenue: venues.length > 0 ? venues[0] : null
        }
      }
    });
    
  } catch (error: any) {
    console.error('💥 Error fetching venue bookings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch venue bookings',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}, ['admin']);
