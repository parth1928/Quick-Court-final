import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Booking from '@/models/Booking';
import Venue from '@/models/Venue';
import Court from '@/models/Court';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays, subMonths } from 'date-fns';

export const GET = withAuth(async (request: Request, user: any) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly'; // daily, weekly, monthly
    const chartType = searchParams.get('type') || 'bookings'; // bookings, revenue, peak-hours
    
    console.log('📊 Fetching analytics data for owner:', user.userId, 'Period:', period, 'Type:', chartType);
    
    // Get venues owned by the user
    const venues = await Venue.find({ owner: user.userId });
    const venueIds = venues.map(v => v._id);
    
    // Get courts for these venues
    const courts = await Court.find({ venue: { $in: venueIds } });
    const courtIds = courts.map(c => c._id);
    
    if (chartType === 'bookings') {
      // Booking trends data
      const bookingTrends = await getBookingTrends(courtIds, period);
      return NextResponse.json({
        success: true,
        data: bookingTrends.data,
        total: bookingTrends.total,
        metadata: {
          period,
          type: 'bookings',
          venues: venues.length,
          courts: courts.length
        }
      });
    }
    
    if (chartType === 'revenue') {
      // Revenue/Earnings data
      const revenueData = await getRevenueData(courtIds, period);
      return NextResponse.json({
        success: true,
        data: revenueData.data,
        total: revenueData.total,
        metadata: {
          period,
          type: 'revenue',
          venues: venues.length,
          courts: courts.length
        }
      });
    }
    
    if (chartType === 'peak-hours') {
      // Peak hours data
      const peakHoursData = await getPeakHoursData(courtIds, period);
      return NextResponse.json({
        success: true,
        data: peakHoursData.data,
        total: peakHoursData.total,
        metadata: {
          period,
          type: 'peak-hours',
          venues: venues.length,
          courts: courts.length
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid chart type'
    }, { status: 400 });
    
  } catch (error: any) {
    console.error('💥 Analytics API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}, []);

async function getBookingTrends(courtIds: any[], period: string) {
  const now = new Date();
  let startDate: Date;
  let groupFormat: string;
  
  switch (period) {
    case 'daily':
      startDate = subDays(now, 30);
      groupFormat = '%Y-%m-%d';
      break;
    case 'weekly':
      startDate = subDays(now, 84); // 12 weeks
      groupFormat = '%Y-%u'; // Year-Week
      break;
    case 'monthly':
      startDate = subMonths(now, 12);
      groupFormat = '%Y-%m';
      break;
    default:
      startDate = subDays(now, 30);
      groupFormat = '%Y-%m-%d';
  }
  
  const bookingTrends = await Booking.aggregate([
    {
      $match: {
        court: { $in: courtIds },
        startTime: { $gte: startDate },
        status: { $in: ['confirmed', 'completed'] }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupFormat,
            date: '$startTime'
          }
        },
        bookings: { $sum: 1 },
        revenue: { $sum: '$totalPrice' },
        date: { $first: '$startTime' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
  
  // Format data for frontend
  const formattedData = bookingTrends.map(item => ({
    period: item._id,
    bookings: item.bookings,
    revenue: item.revenue,
    date: item.date.toISOString().split('T')[0],
    label: formatPeriodLabel(item._id, period)
  }));
  
  const total = bookingTrends.reduce((sum, item) => sum + item.bookings, 0);
  
  return { data: formattedData, total };
}

async function getRevenueData(courtIds: any[], period: string) {
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'daily':
      startDate = subDays(now, 30);
      break;
    case 'weekly':
      startDate = subDays(now, 84);
      break;
    case 'monthly':
      startDate = subMonths(now, 12);
      break;
    default:
      startDate = subDays(now, 30);
  }
  
  // Revenue by venue/court category
  const revenueData = await Booking.aggregate([
    {
      $match: {
        court: { $in: courtIds },
        startTime: { $gte: startDate },
        status: { $in: ['confirmed', 'completed'] },
        paymentStatus: 'paid'
      }
    },
    {
      $lookup: {
        from: 'courts',
        localField: 'court',
        foreignField: '_id',
        as: 'courtInfo'
      }
    },
    {
      $unwind: '$courtInfo'
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
      $unwind: '$venueInfo'
    },
    {
      $group: {
        _id: {
          sport: '$courtInfo.sportType',
          venue: '$venueInfo.name'
        },
        amount: { $sum: '$totalPrice' },
        bookings: { $sum: 1 }
      }
    },
    {
      $sort: { amount: -1 }
    }
  ]);
  
  // Generate colors for categories
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#84CC16'];
  
  const formattedData = revenueData.map((item, index) => ({
    category: `${item._id.sport} - ${item._id.venue}`,
    amount: item.amount,
    bookings: item.bookings,
    color: colors[index % colors.length],
    percentage: 0 // Will be calculated after we have total
  }));
  
  const total = formattedData.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate percentages
  formattedData.forEach(item => {
    item.percentage = Math.round((item.amount / total) * 100);
  });
  
  return { data: formattedData, total };
}

async function getPeakHoursData(courtIds: any[], period: string) {
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'daily':
      startDate = subDays(now, 7);
      break;
    case 'weekly':
      startDate = subDays(now, 30);
      break;
    case 'monthly':
      startDate = subDays(now, 90);
      break;
    default:
      startDate = subDays(now, 30);
  }
  
  const peakHoursData = await Booking.aggregate([
    {
      $match: {
        court: { $in: courtIds },
        startTime: { $gte: startDate },
        status: { $in: ['confirmed', 'completed'] }
      }
    },
    {
      $project: {
        hour: {
          $dateToString: {
            format: '%H:00',
            date: '$startTime'
          }
        },
        dayOfWeek: {
          $dateToString: {
            format: '%A',
            date: '$startTime'
          }
        },
        totalPrice: 1
      }
    },
    {
      $group: {
        _id: {
          hour: '$hour',
          day: '$dayOfWeek'
        },
        bookings: { $sum: 1 },
        revenue: { $sum: '$totalPrice' }
      }
    },
    {
      $sort: { '_id.hour': 1 }
    }
  ]);
  
  const formattedData = peakHoursData.map(item => ({
    hour: item._id.hour,
    day: item._id.day,
    bookings: item.bookings,
    revenue: item.revenue
  }));
  
  const total = formattedData.reduce((sum, item) => sum + item.bookings, 0);
  
  return { data: formattedData, total };
}

function formatPeriodLabel(period: string, type: string): string {
  switch (type) {
    case 'daily':
      return new Date(period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'weekly':
      return `Week ${period.split('-')[1]}`;
    case 'monthly':
      const [year, month] = period.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    default:
      return period;
  }
}
