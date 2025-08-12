import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Booking from '@/models/Booking';
import Facility from '@/models/Facility';
import Court from '@/models/Court';
import User from '@/models/User';

// GET /api/owner/bookings - Get all bookings for facility owner's venues
export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    console.log('🏢 Fetching owner bookings for user:', user.userId);
    await dbConnect();

    // Verify user is an owner
    if (user.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Owner access required' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const dateFilter = url.searchParams.get('dateFilter');
    const search = url.searchParams.get('search');

    console.log('🔍 Query filters:', { status, dateFilter, search });

    // First, get all facilities owned by this user
    const userFacilities = await Facility.find({ 
      owner: user.userId,
      deletedAt: null 
    }).select('_id name');

    if (!userFacilities || userFacilities.length === 0) {
      console.log('⚠️ No facilities found for owner:', user.userId);
      return NextResponse.json({
        success: true,
        data: {
          bookings: [],
          summary: {
            total: 0,
            upcoming: 0,
            completed: 0,
            cancelled: 0,
            revenue: 0
          }
        }
      });
    }

    const facilityIds = userFacilities.map(f => f._id);
    console.log('🏢 Found facilities:', facilityIds.length);

    // Get all courts for these facilities
    const facilityCourts = await Court.find({
      venue: { $in: facilityIds },
      deletedAt: null
    }).select('_id venue');

    if (!facilityCourts || facilityCourts.length === 0) {
      console.log('⚠️ No courts found for facilities');
      return NextResponse.json({
        success: true,
        data: {
          bookings: [],
          summary: {
            total: 0,
            upcoming: 0,
            completed: 0,
            cancelled: 0,
            revenue: 0
          }
        }
      });
    }

    const courtIds = facilityCourts.map(c => c._id);
    console.log('🏟️ Found courts:', courtIds.length);

    // Build booking query
    let bookingQuery: any = {
      court: { $in: courtIds },
      deletedAt: null
    };

    // Apply status filter
    if (status && status !== 'All') {
      bookingQuery.status = status.toLowerCase();
    }

    // Apply date filter
    if (dateFilter && dateFilter !== 'All') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (dateFilter) {
        case 'Today':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          bookingQuery.startTime = {
            $gte: today,
            $lt: tomorrow
          };
          break;
        case 'This Week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          bookingQuery.startTime = {
            $gte: weekStart,
            $lt: weekEnd
          };
          break;
        case 'This Month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          bookingQuery.startTime = {
            $gte: monthStart,
            $lt: monthEnd
          };
          break;
      }
    }

    console.log('🔍 Booking query:', JSON.stringify(bookingQuery, null, 2));

    // Fetch bookings with populated data
    const bookings = await Booking.find(bookingQuery)
      .populate({
        path: 'user',
        select: 'firstName lastName email phone'
      })
      .populate({
        path: 'court',
        select: 'name sportType surfaceType',
        populate: {
          path: 'venue',
          select: 'name shortLocation fullAddress'
        }
      })
      .sort({ startTime: -1 })
      .lean();

    console.log('📊 Found bookings:', bookings.length);

    // Apply search filter on populated data
    let filteredBookings = bookings;
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      filteredBookings = bookings.filter(booking => {
        const user = booking.user as any;
        const court = booking.court as any;
        const venue = court?.venue as any;
        
        return (
          user?.firstName?.toLowerCase().includes(searchTerm) ||
          user?.lastName?.toLowerCase().includes(searchTerm) ||
          user?.email?.toLowerCase().includes(searchTerm) ||
          court?.name?.toLowerCase().includes(searchTerm) ||
          venue?.name?.toLowerCase().includes(searchTerm) ||
          booking.status?.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Transform bookings for frontend
    const transformedBookings = filteredBookings.map(booking => {
      const user = booking.user as any;
      const court = booking.court as any;
      const venue = court?.venue as any;

      return {
        id: booking._id.toString(),
        userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown User',
        userEmail: user?.email || 'No email',
        userPhone: user?.phone || '',
        court: court?.name || 'Unknown Court',
        courtType: court?.sportType || '',
        facility: venue?.name || 'Unknown Facility',
        facilityLocation: venue?.shortLocation || venue?.fullAddress || '',
        date: booking.startTime ? booking.startTime.toLocaleDateString('en-IN', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }) : 'Unknown Date',
        time: booking.startTime && booking.endTime ? 
          `${booking.startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - ${booking.endTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` :
          'Unknown Time',
        status: booking.status || 'unknown',
        amount: booking.totalPrice || 0,
        bookingDate: booking.createdAt ? booking.createdAt.toLocaleDateString('en-IN') : 'Unknown',
        paymentStatus: booking.paymentStatus || 'pending',
        paymentId: booking.paymentId || null,
        notes: booking.notes || '',
        checkInAt: booking.checkInAt || null,
        checkOutAt: booking.checkOutAt || null,
        cancellationReason: booking.cancellationReason || null,
        canCancel: booking.status === 'confirmed' && 
                  booking.startTime && 
                  new Date(booking.startTime).getTime() - Date.now() > 2 * 60 * 60 * 1000,
        // Raw dates for calculations
        startTime: booking.startTime,
        endTime: booking.endTime,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      };
    });

    // Calculate summary statistics
    const summary = {
      total: transformedBookings.length,
      upcoming: transformedBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length,
      completed: transformedBookings.filter(b => b.status === 'completed').length,
      cancelled: transformedBookings.filter(b => b.status === 'cancelled').length,
      revenue: transformedBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.amount || 0), 0)
    };

    console.log('📈 Summary stats:', summary);

    return NextResponse.json({
      success: true,
      data: {
        bookings: transformedBookings,
        summary
      }
    });

  } catch (error: any) {
    console.error('💥 Error fetching owner bookings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch bookings',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}, []);
