import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Booking from '@/models/Booking';
import Venue from '@/models/Venue';
import Court from '@/models/Court';
import User from '@/models/User';
import { subDays, subMonths } from 'date-fns';

export const GET = withAuth(async (request: Request, user: any) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    const chartType = searchParams.get('type') || 'bookings';
    
    console.log('📊 Fetching admin analytics data - Period:', period, 'Type:', chartType);
    
    if (chartType === 'system-overview') {
      // System-wide overview data
      const overviewData = await getSystemOverview(period);
      return NextResponse.json({
        success: true,
        data: overviewData.data,
        metadata: overviewData.metadata
      });
    }
    
    if (chartType === 'revenue') {
      // System-wide revenue data
      const revenueData = await getSystemRevenue(period);
      return NextResponse.json({
        success: true,
        data: revenueData.data,
        total: revenueData.total,
        metadata: { period, type: 'revenue' }
      });
    }
    
    if (chartType === 'bookings') {
      // System-wide booking trends
      const bookingTrends = await getSystemBookingTrends(period);
      return NextResponse.json({
        success: true,
        data: bookingTrends.data,
        total: bookingTrends.total,
        metadata: { period, type: 'bookings' }
      });
    }
    
    if (chartType === 'users') {
      // User growth and analytics
      const userData = await getUserAnalytics(period);
      return NextResponse.json({
        success: true,
        data: userData.data,
        total: userData.total,
        metadata: { period, type: 'users' }
      });
    }
    
    if (chartType === 'venues') {
      // Venue performance analytics
      const venueData = await getVenueAnalytics(period);
      return NextResponse.json({
        success: true,
        data: venueData.data,
        total: venueData.total,
        metadata: { period, type: 'venues' }
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid chart type'
    }, { status: 400 });
    
  } catch (error: any) {
    console.error('💥 Admin analytics API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch admin analytics data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}, ['admin']);

async function getSystemOverview(period: string) {
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
      startDate = subMonths(now, 12);
      break;
    default:
      startDate = subDays(now, 30);
  }
  
  // Get system-wide counts
  const [
    totalUsers,
    totalVenues,
    totalCourts,
    totalBookings,
    totalRevenue,
    recentUsers,
    recentVenues,
    recentBookings
  ] = await Promise.all([
    User.countDocuments({ deletedAt: null }),
    Venue.countDocuments({ deletedAt: null }),
    Court.countDocuments({ deletedAt: null }),
    Booking.countDocuments({}),
    Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]).then(result => result[0]?.total || 0),
    User.countDocuments({ createdAt: { $gte: startDate } }),
    Venue.countDocuments({ createdAt: { $gte: startDate } }),
    Booking.countDocuments({ createdAt: { $gte: startDate } })
  ]);
  
  return {
    data: {
      totalUsers,
      totalVenues,
      totalCourts,
      totalBookings,
      totalRevenue,
      growth: {
        users: recentUsers,
        venues: recentVenues,
        bookings: recentBookings
      }
    },
    metadata: {
      period,
      type: 'system-overview',
      lastUpdated: new Date().toISOString()
    }
  };
}

async function getSystemRevenue(period: string) {
  const now = new Date();
  let startDate: Date;
  let groupFormat: string;
  
  switch (period) {
    case 'daily':
      startDate = subDays(now, 30);
      groupFormat = '%Y-%m-%d';
      break;
    case 'weekly':
      startDate = subDays(now, 84);
      groupFormat = '%Y-%u';
      break;
    case 'monthly':
      startDate = subMonths(now, 12);
      groupFormat = '%Y-%m';
      break;
    default:
      startDate = subDays(now, 30);
      groupFormat = '%Y-%m-%d';
  }
  
  // Revenue by venue
  const revenueByVenue = await Booking.aggregate([
    {
      $match: {
        startTime: { $gte: startDate },
        status: { $in: ['confirmed', 'completed'] },
        paymentStatus: 'paid'
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
      $unwind: '$venueInfo'
    },
    {
      $group: {
        _id: '$venueInfo.name',
        revenue: { $sum: '$totalPrice' },
        bookings: { $sum: 1 }
      }
    },
    {
      $sort: { revenue: -1 }
    },
    {
      $limit: 10
    }
  ]);
  
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#14B8A6'];
  
  const formattedData = revenueByVenue.map((item, index) => ({
    category: item._id,
    amount: item.revenue,
    bookings: item.bookings,
    color: colors[index % colors.length]
  }));
  
  const total = formattedData.reduce((sum, item) => sum + item.amount, 0);
  
  return { data: formattedData, total };
}

async function getSystemBookingTrends(period: string) {
  const now = new Date();
  let startDate: Date;
  let groupFormat: string;
  
  switch (period) {
    case 'daily':
      startDate = subDays(now, 30);
      groupFormat = '%Y-%m-%d';
      break;
    case 'weekly':
      startDate = subDays(now, 84);
      groupFormat = '%Y-%u';
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
        startTime: { $gte: startDate }
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
        totalBookings: { $sum: 1 },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        revenue: {
          $sum: {
            $cond: [
              { $and: [
                { $in: ['$status', ['confirmed', 'completed']] },
                { $eq: ['$paymentStatus', 'paid'] }
              ]},
              '$totalPrice',
              0
            ]
          }
        }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
  
  const formattedData = bookingTrends.map(item => ({
    period: item._id,
    totalBookings: item.totalBookings,
    confirmedBookings: item.confirmedBookings,
    completedBookings: item.completedBookings,
    cancelledBookings: item.cancelledBookings,
    revenue: item.revenue,
    label: formatPeriodLabel(item._id, period)
  }));
  
  const total = bookingTrends.reduce((sum, item) => sum + item.totalBookings, 0);
  
  return { data: formattedData, total };
}

async function getUserAnalytics(period: string) {
  const now = new Date();
  let startDate: Date;
  let groupFormat: string;
  
  switch (period) {
    case 'daily':
      startDate = subDays(now, 30);
      groupFormat = '%Y-%m-%d';
      break;
    case 'weekly':
      startDate = subDays(now, 84);
      groupFormat = '%Y-%u';
      break;
    case 'monthly':
      startDate = subMonths(now, 12);
      groupFormat = '%Y-%m';
      break;
    default:
      startDate = subDays(now, 30);
      groupFormat = '%Y-%m-%d';
  }
  
  // User registration trends
  const userTrends = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        deletedAt: null
      }
    },
    {
      $group: {
        _id: {
          period: {
            $dateToString: {
              format: groupFormat,
              date: '$createdAt'
            }
          },
          role: '$role'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.period',
        users: { $sum: { $cond: [{ $eq: ['$_id.role', 'user'] }, '$count', 0] } },
        owners: { $sum: { $cond: [{ $eq: ['$_id.role', 'owner'] }, '$count', 0] } },
        admins: { $sum: { $cond: [{ $eq: ['$_id.role', 'admin'] }, '$count', 0] } },
        total: { $sum: '$count' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
  
  const formattedData = userTrends.map(item => ({
    period: item._id,
    users: item.users,
    owners: item.owners,
    admins: item.admins,
    total: item.total,
    label: formatPeriodLabel(item._id, period)
  }));
  
  const total = userTrends.reduce((sum, item) => sum + item.total, 0);
  
  return { data: formattedData, total };
}

async function getVenueAnalytics(period: string) {
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
      startDate = subMonths(now, 6);
      break;
    default:
      startDate = subDays(now, 30);
  }
  
  // Top performing venues
  const venuePerformance = await Booking.aggregate([
    {
      $match: {
        startTime: { $gte: startDate },
        status: { $in: ['confirmed', 'completed'] }
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
      $unwind: '$venueInfo'
    },
    {
      $group: {
        _id: {
          venueId: '$venue',
          venueName: '$venueInfo.name',
          city: '$venueInfo.address.city'
        },
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        avgBookingValue: { $avg: '$totalPrice' }
      }
    },
    {
      $sort: { totalRevenue: -1 }
    },
    {
      $limit: 10
    }
  ]);
  
  const formattedData = venuePerformance.map(item => ({
    venueName: item._id.venueName,
    city: item._id.city,
    totalBookings: item.totalBookings,
    totalRevenue: item.totalRevenue,
    avgBookingValue: Math.round(item.avgBookingValue),
    utilization: Math.min(100, (item.totalBookings / 30) * 100) // Simple utilization calc
  }));
  
  const total = formattedData.reduce((sum, item) => sum + item.totalRevenue, 0);
  
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
