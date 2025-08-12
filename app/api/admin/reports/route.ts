import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

// Define schemas for reports
const userSchema = new mongoose.Schema({}, { strict: false });
const facilitySchema = new mongoose.Schema({}, { strict: false });
const venueSchema = new mongoose.Schema({}, { strict: false });
const bookingSchema = new mongoose.Schema({}, { strict: false });
const reportSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.models.ReportsUser || mongoose.model('ReportsUser', userSchema, 'users');
const Facility = mongoose.models.ReportsFacility || mongoose.model('ReportsFacility', facilitySchema, 'facilities');
const Venue = mongoose.models.ReportsVenue || mongoose.model('ReportsVenue', venueSchema, 'venues');
const Booking = mongoose.models.ReportsBooking || mongoose.model('ReportsBooking', bookingSchema, 'bookings');
const Report = mongoose.models.ReportsReport || mongoose.model('ReportsReport', reportSchema, 'reports');

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30'; // days
    const reportType = searchParams.get('type') || 'overview';
    
    const daysAgo = parseInt(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    
    let reportData: any = {};
    
    if (reportType === 'overview' || reportType === 'all') {
      // Overview metrics
      const totalUsers = await User.countDocuments({});
      const newUsers = await User.countDocuments({ 
        createdAt: { $gte: startDate } 
      });
      
      const totalFacilities = await Facility.countDocuments({});
      const newFacilities = await Facility.countDocuments({ 
        createdAt: { $gte: startDate } 
      });
      
      const totalVenues = await Venue.countDocuments({});
      const newVenues = await Venue.countDocuments({ 
        createdAt: { $gte: startDate } 
      });
      
      const totalBookings = await Booking.countDocuments({ 
        createdAt: { $gte: startDate } 
      });
      
      // Revenue calculation (mock for now)
      const totalRevenue = totalBookings * 250; // Average booking value
      
      reportData.overview = {
        users: { total: totalUsers, new: newUsers },
        facilities: { total: totalFacilities, new: newFacilities },
        venues: { total: totalVenues, new: newVenues },
        bookings: { total: totalBookings },
        revenue: { total: totalRevenue, currency: 'INR' }
      };
    }
    
    if (reportType === 'bookings' || reportType === 'all') {
      // Booking trends (daily for last 30 days)
      const bookingTrends = await Booking.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 },
            revenue: { $sum: { $ifNull: ["$totalAmount", 250] } }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      reportData.bookingTrends = bookingTrends.map(item => ({
        date: item._id,
        bookings: item.count,
        revenue: item.revenue
      }));
    }
    
    if (reportType === 'users' || reportType === 'all') {
      // User registration trends
      const userTrends = await User.aggregate([
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
      ]);
      
      reportData.userTrends = userTrends.map(item => ({
        date: item._id,
        users: item.count
      }));
      
      // User distribution by role
      const usersByRole = await User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 }
          }
        }
      ]);
      
      reportData.usersByRole = usersByRole.map(item => ({
        role: item._id || 'user',
        count: item.count
      }));
    }
    
    if (reportType === 'facilities' || reportType === 'all') {
      // Facility approval status
      const facilityStatus = await Facility.aggregate([
        {
          $group: {
            _id: "$approvalStatus",
            count: { $sum: 1 }
          }
        }
      ]);
      
      const venueStatus = await Venue.aggregate([
        {
          $group: {
            _id: "$approvalStatus",
            count: { $sum: 1 }
          }
        }
      ]);
      
      reportData.facilityStatus = facilityStatus.map(item => ({
        status: item._id || 'pending',
        count: item.count
      }));
      
      reportData.venueStatus = venueStatus.map(item => ({
        status: item._id || 'pending',
        count: item.count
      }));
    }
    
    if (reportType === 'reports' || reportType === 'all') {
      // User reports and moderation
      const recentReports = await Report.find({
        createdAt: { $gte: startDate }
      })
      .populate('reportedBy', 'name email')
      .populate('reportedUser', 'name email')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
      
      reportData.recentReports = recentReports.map(report => ({
        id: report._id.toString(),
        type: report.type || 'general',
        reason: report.reason || 'No reason provided',
        status: report.status || 'pending',
        reportedBy: report.reportedBy?.name || 'Anonymous',
        reportedUser: report.reportedUser?.name || 'Unknown',
        createdAt: report.createdAt
      }));
      
      // Report statistics
      const reportStats = await Report.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);
      
      reportData.reportStats = reportStats.map(item => ({
        status: item._id || 'pending',
        count: item.count
      }));
    }
    
    return NextResponse.json({
      success: true,
      data: reportData,
      timeRange: daysAgo,
      generatedAt: new Date()
    });
    
  } catch (error: any) {
    console.error('Error generating reports:', error);
    return NextResponse.json(
      { error: 'Failed to generate reports' },
      { status: 500 }
    );
  }
}
