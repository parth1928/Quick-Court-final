import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Booking from '@/models/Booking';
import User from '@/models/User';
import { Types } from 'mongoose';

// PATCH /api/users/me/bookings/[id] - Update booking (cancel, review, etc.)
export const PATCH = withAuth(async (request: NextRequest, user: any) => {
  try {
    console.log('🔌 Connecting to database...');
    await dbConnect();
    console.log('✅ Database connected successfully');
    
    // Extract id from URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    console.log('🔧 PATCH booking - id:', id);
    console.log('🔧 PATCH booking - user:', user.userId);
    
    if (!id) {
      console.error('❌ Missing booking ID in URL');
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      console.error('❌ Invalid booking ID format:', id);
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID format' },
        { status: 400 }
      );
    }
    
    if (!Types.ObjectId.isValid(user.userId)) {
      console.error('❌ Invalid user ID format:', user.userId);
      return NextResponse.json(
        { success: false, error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    const { action } = data;
    
    console.log('🔧 PATCH booking request:', { id, action, userId: user.userId, data });
    
    // Find the booking
    console.log('🔍 Looking for booking:', { id, userId: user.userId });
    const booking = await Booking.findOne({
      _id: id,
      user: user.userId,
      deletedAt: null
    }).populate('court venue');

    console.log('🔍 Found booking:', booking ? 'YES' : 'NO');
    if (booking) {
      console.log('🔍 Booking details:', {
        id: booking._id,
        user: booking.user,
        status: booking.status,
        startTime: booking.startTime
      });
    }

    if (!booking) {
      console.error('❌ Booking not found:', { id, userId: user.userId });
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    let updateData: any = {};
    let responseMessage = '';
    
    switch (action) {
      case 'cancel':
        // Validate booking startTime
        if (!booking.startTime || isNaN(booking.startTime.getTime())) {
          console.error('❌ Invalid booking startTime:', booking.startTime);
          return NextResponse.json(
            { success: false, error: 'Invalid booking start time' },
            { status: 400 }
          );
        }
        
        // Check if cancellation is allowed
        const now = new Date();
        const hoursUntilBooking = (booking.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        console.log('⏰ Cancellation check:', {
          now: now.toISOString(),
          bookingStart: booking.startTime.toISOString(),
          hoursUntil: hoursUntilBooking,
          currentStatus: booking.status
        });
        
        if (booking.status !== 'confirmed' && booking.status !== 'pending') {
          return NextResponse.json(
            { success: false, error: 'This booking cannot be cancelled' },
            { status: 400 }
          );
        }
        
        if (hoursUntilBooking < 2) {
          return NextResponse.json(
            { success: false, error: 'Bookings can only be cancelled 2 hours before the start time' },
            { status: 400 }
          );
        }
        
        updateData = {
          status: 'cancelled',
          cancellationReason: data.reason || 'Cancelled by user',
          cancelledAt: new Date(),
          updatedAt: new Date()
        };
        
        // Calculate refund (full refund if cancelled more than 24 hours before)
        if (hoursUntilBooking > 24) {
          updateData.refundAmount = booking.totalPrice;
          updateData.paymentStatus = 'refunded';
        } else {
          // 50% refund for cancellations between 2-24 hours
          updateData.refundAmount = booking.totalPrice * 0.5;
        }
        
        responseMessage = 'Booking cancelled successfully';
        break;
        
      case 'review':
        if (booking.status !== 'completed') {
          return NextResponse.json(
            { success: false, error: 'Only completed bookings can be reviewed' },
            { status: 400 }
          );
        }
        
        const { rating, comment } = data;
        if (!rating || rating < 1 || rating > 5) {
          return NextResponse.json(
            { success: false, error: 'Rating must be between 1 and 5' },
            { status: 400 }
          );
        }
        
        updateData = {
          'review.rating': rating,
          'review.comment': comment || '',
          'review.reviewedAt': new Date(),
          updatedAt: new Date()
        };
        
        responseMessage = 'Review added successfully';
        break;
        
      case 'checkin':
        if (booking.status !== 'confirmed') {
          return NextResponse.json(
            { success: false, error: 'Only confirmed bookings can be checked in' },
            { status: 400 }
          );
        }
        
        // Check if booking time is within check-in window (30 minutes before to 30 minutes after)
        const checkInWindow = 30 * 60 * 1000; // 30 minutes in milliseconds
        const bookingStart = booking.startTime.getTime();
        const currentTime = now.getTime();
        
        if (currentTime < bookingStart - checkInWindow || currentTime > bookingStart + checkInWindow) {
          return NextResponse.json(
            { success: false, error: 'Check-in is only allowed 30 minutes before to 30 minutes after booking start time' },
            { status: 400 }
          );
        }
        
        updateData = {
          checkInAt: new Date(),
          updatedAt: new Date()
        };
        
        responseMessage = 'Checked in successfully';
        break;
        
      case 'checkout':
        if (!booking.checkInAt) {
          return NextResponse.json(
            { success: false, error: 'Cannot check out without checking in first' },
            { status: 400 }
          );
        }
        
        updateData = {
          checkOutAt: new Date(),
          status: 'completed',
          updatedAt: new Date()
        };
        
        responseMessage = 'Checked out successfully';
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    // Update the booking
    console.log('💾 Updating booking with data:', updateData);
    let updatedBooking;
    
    try {
      updatedBooking = await Booking.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('court venue');
      
      if (!updatedBooking) {
        console.error('❌ Booking not found during update:', id);
        return NextResponse.json(
          { success: false, error: 'Booking not found during update' },
          { status: 404 }
        );
      }
      
      console.log('✅ Booking updated successfully:', updatedBooking._id);
    } catch (updateError: any) {
      console.error('💥 Failed to update booking:', updateError);
      return NextResponse.json(
        { success: false, error: `Failed to update booking: ${updateError.message}` },
        { status: 500 }
      );
    }

    // If booking was cancelled, update user's booking count
    if (action === 'cancel' && booking.status === 'confirmed') {
      try {
        await User.updateOne(
          { _id: user.userId },
          { $inc: { bookingCount: -1 } }
        );
        console.log('✅ Updated user booking count');
      } catch (userUpdateError: any) {
        console.error('⚠️ Failed to update user booking count:', userUpdateError);
        // Don't fail the request for this
      }
    }    return NextResponse.json({
      success: true,
      data: {
        booking: updatedBooking,
        message: responseMessage
      }
    });
    
  } catch (error: any) {
    console.error('💥 Error updating booking:', error);
    console.error('💥 Error stack:', error.stack);
    console.error('💥 Error name:', error.name);
    console.error('💥 Error message:', error.message);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to update booking';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = `Validation failed: ${error.message}`;
      statusCode = 400;
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid ID format';
      statusCode = 400;
    } else if (error.code === 11000) {
      errorMessage = 'Duplicate entry';
      statusCode = 409;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined
      },
      { status: statusCode }
    );
  }
}, []);

// DELETE /api/users/me/bookings/[id] - Soft delete booking (admin only)
export const DELETE = withAuth(async (request: NextRequest, user: any) => {
  try {
    // Only allow admins to delete bookings
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    // Extract id from URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      { 
        deletedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Booking deleted successfully'
      }
    });
    
  } catch (error: any) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete booking',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}, []);

// GET /api/users/me/bookings/[id] - Get single booking details
export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();
    
    // Extract id from URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    const booking = await Booking.findOne({
      _id: id,
      user: user.userId,
      deletedAt: null
    })
    .populate({
      path: 'court',
      populate: {
        path: 'venue',
        select: 'name shortLocation fullAddress contactNumber images amenities'
      },
      select: 'name sportType surfaceType images pricing availability venue'
    })
    .populate('venue', 'name shortLocation fullAddress contactNumber images amenities')
    .lean();
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Transform booking for detailed view
    const court = booking.court || {};
    const venue = booking.venue || court.venue || {};
    
    const detailedBooking = {
      id: booking._id.toString(),
      // Venue details
      venue: {
        id: venue._id?.toString(),
        name: venue.name || 'Unknown Venue',
        location: venue.shortLocation || venue.fullAddress || 'Unknown Location',
        contactNumber: venue.contactNumber || '',
        images: venue.images || [],
        amenities: venue.amenities || []
      },
      // Court details
      court: {
        id: court._id?.toString(),
        name: court.name || 'Unknown Court',
        sport: court.sportType || 'Unknown Sport',
        surfaceType: court.surfaceType || '',
        images: court.images || [],
        pricing: court.pricing || {}
      },
      // Booking details
      date: booking.startTime?.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      startTime: booking.startTime,
      endTime: booking.endTime,
      duration: booking.endTime && booking.startTime ? 
        Math.round((booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60)) : 0,
      status: booking.status || 'pending',
      pricing: booking.pricingBreakdown || {},
      totalPrice: booking.totalPrice || 0,
      paymentStatus: booking.paymentStatus || 'pending',
      paymentId: booking.paymentId || null,
      // Status flags
      canCancel: booking.status === 'confirmed' && 
                booking.startTime && 
                new Date(booking.startTime).getTime() - Date.now() > 2 * 60 * 60 * 1000,
      canCheckIn: booking.status === 'confirmed' && !booking.checkInAt,
      canCheckOut: booking.checkInAt && !booking.checkOutAt,
      canReview: booking.status === 'completed' && !booking.review,
      // Additional info
      notes: booking.notes || '',
      review: booking.review || null,
      checkInAt: booking.checkInAt || null,
      checkOutAt: booking.checkOutAt || null,
      cancellationReason: booking.cancellationReason || null,
      refundAmount: booking.refundAmount || 0,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };
    
    return NextResponse.json({
      success: true,
      data: { booking: detailedBooking }
    });
    
  } catch (error: any) {
    console.error('Error fetching booking details:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch booking details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}, []);
