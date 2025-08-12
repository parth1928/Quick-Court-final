import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import dbConnect from '@/lib/db/connect';
import Booking from '@/models/Booking';

// GET /api/admin/charts/booking-trends
export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    
    console.log('📊 Fetching booking trends for period:', period);
    
    // Calculate date range based on period
    let startDate: Date;
    const endDate = new Date();
    
    switch (period) {
      case 'weekly':
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'yearly':
        startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
    }
    
    console.log('📅 Date range:', { startDate, endDate });
    
    // Aggregate bookings by date
    const bookings = await Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          },
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
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          venues: {
            $addToSet: {
              $arrayElemAt: ['$venueInfo.name', 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    console.log('📈 Booking trends data points:', bookings.length);
    
    // Format data for charts
    const trends = bookings.map(item => ({
      date: item._id,
      count: item.count,
      revenue: item.totalRevenue || 0,
      venues: item.venues.filter((v: string | null) => v != null)
    }));
    
    // Fill missing dates with zero counts
    const filledTrends = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingData = trends.find(t => t.date === dateStr);
      
      filledTrends.push({
        date: dateStr,
        count: existingData?.count || 0,
        revenue: existingData?.revenue || 0,
        venues: existingData?.venues || []
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        trends: filledTrends,
        summary: {
          totalBookings: bookings.reduce((sum, item) => sum + item.count, 0),
          totalRevenue: bookings.reduce((sum, item) => sum + (item.totalRevenue || 0), 0),
          averageDaily: bookings.length > 0 ? bookings.reduce((sum, item) => sum + item.count, 0) / bookings.length : 0,
          period,
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        }
      }
    });
    
  } catch (error: any) {
    console.error('💥 Error fetching booking trends:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch booking trends',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}, ['admin']);
