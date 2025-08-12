import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

// Define schemas for user statistics
const userSchema = new mongoose.Schema({}, { strict: false });
const bookingSchema = new mongoose.Schema({}, { strict: false });
const facilitySchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.models.UserStatsUser || mongoose.model('UserStatsUser', userSchema, 'users');
const Booking = mongoose.models.UserStatsBooking || mongoose.model('UserStatsBooking', bookingSchema, 'bookings');
const Facility = mongoose.models.UserStatsFacility || mongoose.model('UserStatsFacility', facilitySchema, 'facilities');

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30'; // days
    
    const daysAgo = parseInt(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    
    // Get comprehensive user statistics
    const [
      totalUsers,
      activeUsers,
      newUsersCount,
      usersByRole,
      usersByStatus,
      topActiveUsers,
      userGrowthTrend,
      userActivityStats
    ] = await Promise.all([
      // Basic counts
      User.countDocuments({}),
      User.countDocuments({ 
        lastActiveAt: { $gte: startDate }
      }),
      User.countDocuments({ 
        createdAt: { $gte: startDate }
      }),
      
      // User distribution by role
      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 }
          }
        }
      ]),
      
      // User distribution by status
      User.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Top active users (by recent bookings)
      User.aggregate([
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'userId',
            as: 'bookings'
          }
        },
        {
          $addFields: {
            recentBookings: {
              $size: {
                $filter: {
                  input: "$bookings",
                  cond: { $gte: ["$$this.createdAt", startDate] }
                }
              }
            }
          }
        },
        {
          $match: { recentBookings: { $gt: 0 } }
        },
        {
          $sort: { recentBookings: -1 }
        },
        {
          $limit: 10
        },
        {
          $project: {
            name: 1,
            email: 1,
            role: 1,
            recentBookings: 1,
            lastActiveAt: 1
          }
        }
      ]),
      
      // User growth trend (daily registrations)
      User.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // User activity statistics
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            usersWithPhone: { 
              $sum: { 
                $cond: [{ $ne: ["$phone", null] }, 1, 0] 
              }
            },
            verifiedUsers: { 
              $sum: { 
                $cond: [{ $eq: ["$verified", true] }, 1, 0] 
              }
            },
            usersLastWeek: {
              $sum: {
                $cond: [
                  { $gte: ["$lastActiveAt", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ]);
    
    // Calculate engagement metrics
    const engagementRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0';
    const growthRate = totalUsers > 0 ? ((newUsersCount / totalUsers) * 100).toFixed(1) : '0';
    
    // Format the data
    const userStats = {
      overview: {
        total: totalUsers,
        active: activeUsers,
        new: newUsersCount,
        engagementRate: parseFloat(engagementRate),
        growthRate: parseFloat(growthRate)
      },
      distribution: {
        byRole: usersByRole.map(item => ({
          role: item._id || 'user',
          count: item.count
        })),
        byStatus: usersByStatus.map(item => ({
          status: item._id || 'active',
          count: item.count
        }))
      },
      topActiveUsers: topActiveUsers.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        recentBookings: user.recentBookings,
        lastActive: user.lastActiveAt
      })),
      growthTrend: userGrowthTrend.map(item => ({
        date: item._id,
        registrations: item.count
      })),
      activityStats: userActivityStats[0] || {
        totalUsers: 0,
        usersWithPhone: 0,
        verifiedUsers: 0,
        usersLastWeek: 0
      },
      generatedAt: new Date(),
      timeRange: daysAgo
    };
    
    return NextResponse.json({
      success: true,
      data: userStats
    });
    
  } catch (error: any) {
    console.error('Error fetching user statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}
