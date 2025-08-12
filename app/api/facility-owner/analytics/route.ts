import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Booking from '@/models/Booking';
import Venue from '@/models/Venue';
import Court from '@/models/Court';

// GET /api/facility-owner/analytics - Get comprehensive analytics for facility owner
export const GET = withAuth(async (request: Request, user: any) => {
  try {
    console.log('🏢 Facility owner analytics request from user:', user.userId);
    
    await dbConnect();
    console.log('✅ Database connected successfully');
    
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));
    
    // Get owner's venues
    const venues = await Venue.find({ 
      owner: user.userId,
      isActive: true 
    }).select('_id name');
    
    const venueIds = venues.map(v => v._id);
    console.log(`📍 Found ${venues.length} venues for owner`);
    
    if (venueIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalBookings: 0,
            monthlyBookings: 0,
            activeCourts: 0,
            maintenanceCourts: 0,
            totalEarnings: 0,
            monthlyEarnings: 0,
            growthRate: 0
          },
          charts: {
            revenueData: [],
            bookingTrends: [],
            peakHours: [],
            courtUtilization: []
          },
          recentBookings: []
        }
      });
    }
    
    // Get courts for these venues
    const courts = await Court.find({ 
      venue: { $in: venueIds } 
    }).select('_id name venue status');
    
    const courtIds = courts.map(c => c._id);
    
    // Get bookings for analytics
    const [
      totalBookingsResult,
      monthlyBookingsResult,
      totalEarningsResult,
      monthlyEarningsResult,
      recentBookings,
      bookingTrends,
      peakHours
    ] = await Promise.all([
      // Total bookings count
      Booking.countDocuments({
        venue: { $in: venueIds },
        status: { $in: ['confirmed', 'completed'] }
      }),
      
      // Monthly bookings
      Booking.countDocuments({
        venue: { $in: venueIds },
        status: { $in: ['confirmed', 'completed'] },
        createdAt: { $gte: startDate }
      }),
      
      // Total earnings
      Booking.aggregate([
        {
          $match: {
            venue: { $in: venueIds },
            status: { $in: ['confirmed', 'completed'] },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPrice' }
          }
        }
      ]),
      
      // Monthly earnings
      Booking.aggregate([
        {
          $match: {
            venue: { $in: venueIds },
            status: { $in: ['confirmed', 'completed'] },
            paymentStatus: 'paid',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPrice' }
          }
        }
      ]),
      
      // Recent bookings
      Booking.find({
        venue: { $in: venueIds }
      })
      .populate('venue', 'name')
      .populate('court', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
      
      // Booking trends by day
      Booking.aggregate([
        {
          $match: {
            venue: { $in: venueIds },
            status: { $in: ['confirmed', 'completed'] },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            },
            bookings: { $sum: 1 },
            revenue: { 
              $sum: {
                $cond: [
                  { $eq: ["$paymentStatus", "paid"] },
                  "$totalPrice",
                  0
                ]
              }
            }
          }
        },
        {
          $sort: { "_id": 1 }
        }
      ]),
      
      // Peak hours analysis
      Booking.aggregate([
        {
          $match: {
            venue: { $in: venueIds },
            status: { $in: ['confirmed', 'completed'] },
            startTime: { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              $hour: "$startTime"
            },
            bookings: { $sum: 1 },
            revenue: { 
              $sum: {
                $cond: [
                  { $eq: ["$paymentStatus", "paid"] },
                  "$totalPrice",
                  0
                ]
              }
            }
          }
        },
        {
          $sort: { "_id": 1 }
        }
      ])
    ]);
    
    // Calculate court statistics
    const activeCourts = courts.filter(c => c.status === 'active').length;
    const maintenanceCourts = courts.filter(c => c.status === 'maintenance').length;
    
    // Calculate growth rate (simplified)
    const currentMonthBookings = monthlyBookingsResult;
    const previousMonthStart = new Date();
    previousMonthStart.setDate(previousMonthStart.getDate() - (parseInt(timeRange) * 2));
    previousMonthStart.setDate(previousMonthStart.getDate() + parseInt(timeRange));
    
    const previousMonthBookings = await Booking.countDocuments({
      venue: { $in: venueIds },
      status: { $in: ['confirmed', 'completed'] },
      createdAt: { 
        $gte: previousMonthStart,
        $lt: startDate 
      }
    });
    
    const growthRate = previousMonthBookings > 0 
      ? ((currentMonthBookings - previousMonthBookings) / previousMonthBookings * 100)
      : 0;
    
    // Format chart data
    const formattedBookingTrends = bookingTrends.map(item => ({
      date: item._id,
      bookings: item.bookings,
      revenue: item.revenue
    }));
    
    const formattedPeakHours = Array.from({ length: 24 }, (_, hour) => {
      const data = peakHours.find(p => p._id === hour);
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        bookings: data?.bookings || 0,
        revenue: data?.revenue || 0
      };
    });
    
    // Court utilization data
    const courtUtilization = await Promise.all(
      courts.map(async (court) => {
        const bookingCount = await Booking.countDocuments({
          court: court._id,
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: startDate }
        });
        
        return {
          court: court.name,
          bookings: bookingCount,
          utilization: Math.min((bookingCount / (parseInt(timeRange) * 2)) * 100, 100) // Simplified utilization
        };
      })
    );
    
    const analyticsData = {
      overview: {
        totalBookings: totalBookingsResult,
        monthlyBookings: monthlyBookingsResult,
        activeCourts,
        maintenanceCourts,
        totalEarnings: totalEarningsResult[0]?.total || 0,
        monthlyEarnings: monthlyEarningsResult[0]?.total || 0,
        growthRate: Math.round(growthRate * 100) / 100
      },
      charts: {
        revenueData: formattedBookingTrends,
        bookingTrends: formattedBookingTrends,
        peakHours: formattedPeakHours,
        courtUtilization
      },
      recentBookings: recentBookings.map(booking => ({
        id: booking._id.toString(),
        venueName: booking.venue?.name || 'Unknown Venue',
        courtName: booking.court?.name || 'Unknown Court',
        customerName: booking.user?.name || 'Unknown Customer',
        date: booking.startTime?.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }) || '',
        amount: booking.totalPrice || 0,
        status: booking.status
      }))
    };
    
    console.log('✅ Analytics data compiled successfully');
    console.log('📊 Stats:', {
      venues: venues.length,
      courts: courts.length,
      totalBookings: totalBookingsResult,
      monthlyBookings: monthlyBookingsResult
    });
    
    return NextResponse.json({
      success: true,
      data: analyticsData
    });
    
  } catch (error: any) {
    console.error('💥 Error fetching facility analytics:', error);
    console.error('💥 Error stack:', error.stack);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch analytics data',
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    }, { status: 500 });
  }
}, []);
