import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Booking from '@/models/Booking';
import Court from '@/models/Court';
import Venue from '@/models/Venue';
import User from '@/models/User';

// GET /api/users/me/bookings - Get user's bookings with full details
export const GET = withAuth(async (request: Request, user: any) => {
  try {
    console.log('📅 Booking API called for user:', { id: user.userId, email: user.email });
    
    await dbConnect();
    console.log('✅ Database connected successfully');
    
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const status = searchParams.get('status'); // 'all', 'upcoming', 'completed', 'cancelled'
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'startTime'; // 'startTime', 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // 'asc', 'desc'
    
    console.log('📋 Query parameters:', { status, limit, page, sortBy, sortOrder });
    
    // Build query
    const query: any = { 
      user: user.userId,
      deletedAt: null 
    };
    
    // Filter by status
    if (status && status !== 'all') {
      switch (status) {
        case 'upcoming':
          query.status = { $in: ['confirmed', 'pending'] };
          query.startTime = { $gte: new Date() };
          break;
        case 'completed':
          query.status = 'completed';
          break;
        case 'cancelled':
          query.status = 'cancelled';
          break;
        default:
          query.status = status;
      }
    }
    
    console.log('🔍 MongoDB query:', JSON.stringify(query, null, 2));
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // First, let's check if any bookings exist for this user
    const totalCount = await Booking.countDocuments(query);
    console.log(`📊 Total bookings found for user: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log('ℹ️ No bookings found for user, returning empty result');
      return NextResponse.json({
        success: true,
        data: {
          bookings: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        }
      });
    }
    
    // Fetch bookings with populated references
    console.log('🔄 Fetching bookings with population...');
    const bookings = await Booking.find(query)
      .populate({
        path: 'court',
        populate: {
          path: 'venue',
          select: 'name shortLocation address images'
        },
        select: 'name sportType surfaceType images pricing venue'
      })
      .populate('venue', 'name shortLocation address images')
      .select('-__v')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    console.log(`📦 Retrieved ${bookings.length} bookings from database`);
    
    // Transform bookings for frontend consumption
    const transformedBookings = bookings.map((booking: any) => {
      const court = booking.court || {};
      const venue = booking.venue || court.venue || {};
      
      return {
        id: booking._id.toString(),
        venueName: venue.name || 'Unknown Venue',
        venueLocation: venue.shortLocation || venue.address?.city || 'Unknown Location',
        venueImages: venue.images || [],
        courtName: court.name || 'Unknown Court',
        sport: court.sportType || 'Unknown Sport',
        surfaceType: court.surfaceType || '',
        date: booking.startTime?.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) || '',
        time: booking.startTime && booking.endTime ? 
          `${booking.startTime.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })} - ${booking.endTime.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })}` : '',
        duration: booking.endTime && booking.startTime ? 
          Math.round((booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60)) : 0,
        status: booking.status || 'pending',
        price: booking.totalPrice || 0,
        currency: booking.pricingBreakdown?.currency || 'INR',
        paymentStatus: booking.paymentStatus || 'pending',
        canCancel: booking.status === 'confirmed' && 
                  booking.startTime && 
                  new Date(booking.startTime).getTime() - Date.now() > 2 * 60 * 60 * 1000, // 2 hours
        canReview: booking.status === 'completed' && !booking.review,
        rating: booking.review?.rating || null,
        reviewComment: booking.review?.comment || null,
        bookingDate: booking.createdAt?.toLocaleDateString('en-IN') || '',
        checkInStatus: booking.checkInAt ? 'checked-in' : 'pending',
        checkOutStatus: booking.checkOutAt ? 'checked-out' : 'pending',
        notes: booking.notes || '',
        cancellationReason: booking.cancellationReason || null,
        refundAmount: booking.refundAmount || 0,
        
        // Raw dates for frontend processing
        startTime: booking.startTime,
        endTime: booking.endTime,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      };
    });
    
    // Calculate summary statistics
    const stats = {
      total: totalCount,
      upcoming: await Booking.countDocuments({
        user: user.userId,
        status: { $in: ['confirmed', 'pending'] },
        startTime: { $gte: new Date() },
        deletedAt: null
      }),
      completed: await Booking.countDocuments({
        user: user.userId,
        status: 'completed',
        deletedAt: null
      }),
      cancelled: await Booking.countDocuments({
        user: user.userId,
        status: 'cancelled',
        deletedAt: null
      }),
      totalSpent: await Booking.aggregate([
        {
          $match: {
            user: user.userId,
            status: { $in: ['completed', 'confirmed'] },
            paymentStatus: 'paid',
            deletedAt: null
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPrice' }
          }
        }
      ]).then(result => result[0]?.total || 0)
    };
    
    console.log(`✅ Successfully transformed ${transformedBookings.length} bookings`);
    console.log('📈 Booking stats:', stats);
    
    return NextResponse.json({
      success: true,
      data: {
        bookings: transformedBookings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        },
        stats,
        filters: {
          status,
          sortBy,
          sortOrder
        }
      }
    });
    
  } catch (error: any) {
    console.error('💥 Error fetching user bookings:', error);
    console.error('💥 Error stack:', error.stack);
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

// POST /api/users/me/bookings - Create a new booking
export const POST = withAuth(async (request: Request, user: any) => {
  try {
    console.log('🎯 Starting booking creation process...');
    console.log('🔌 Connecting to database...');
    await dbConnect();
    console.log('✅ Database connected successfully');
    
    const data = await request.json();
    
    console.log('📋 Booking creation request:', { 
      user: user.userId, 
      dataKeys: Object.keys(data),
      venueName: data.venueName,
      courtName: data.courtName,
      courtId: data.court
    });
    
    // Validate user ID format early
    if (!user.userId || typeof user.userId !== 'string') {
      console.error('❌ Invalid user object or missing userId:', user);
      throw new Error('Invalid user authentication data');
    }
    
    // Check if userId is a valid ObjectId format
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(user.userId)) {
      console.error('❌ Invalid ObjectId format for userId:', user.userId);
      throw new Error(`Invalid user ID format: ${user.userId}`);
    }
    
    // Simplified booking creation - handle venue/court simulation
    let court, venue;
    
    if (data.courtId || data.court) {
      // Traditional booking with existing court ID
      console.log('🏟️ Using existing court ID:', data.courtId || data.court);
      court = await Court.findById(data.courtId || data.court).populate('venue');
      if (!court) {
        return NextResponse.json(
          { success: false, error: 'Court not found' },
          { status: 404 }
        );
      }
      venue = court.venue;
      
    } else if (data.venueName && data.courtName) {
      // Simulation booking - create simplified venue and court
      console.log('� Creating simulation venue and court');
      
      // Find or create a simple venue
      venue = await Venue.findOne({ name: data.venueName });
      if (!venue) {
        console.log('🏢 Creating simulation venue:', data.venueName);
        venue = await Venue.create({
          name: data.venueName,
          owner: user.userId,
          description: 'Simulation venue for booking demo',
          sportsOffered: [data.sportType?.toLowerCase() || 'basketball'],
          address: {
            street: data.venueAddress || 'Demo Address',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India'
          },
          geoLocation: { lat: 19.0760, lng: 72.8777 },
          pricePerHour: 500,
          operatingHours: { open: '06:00', close: '22:00' },
          amenities: ['lights', 'parking'],
          images: ['/placeholder.jpg'],
          approvalStatus: 'approved',
          status: 'approved',
          isActive: true
        });
        console.log('✅ Created simulation venue:', venue._id);
      }
      
      // Find or create a simple court
      court = await Court.findOne({ name: data.courtName, venue: venue._id });
      if (!court) {
        console.log('🏟️ Creating simulation court:', data.courtName);
        court = await Court.create({
          name: data.courtName,
          venue: venue._id,
          sportType: data.sportType || 'Basketball',
          surfaceType: 'Synthetic',
          description: 'Simulation court for booking demo',
          pricing: {
            hourlyRate: 500,
            currency: 'INR'
          },
          availability: {
            monday: { open: '06:00', close: '22:00' },
            tuesday: { open: '06:00', close: '22:00' },
            wednesday: { open: '06:00', close: '22:00' },
            thursday: { open: '06:00', close: '22:00' },
            friday: { open: '06:00', close: '22:00' },
            saturday: { open: '08:00', close: '20:00' },
            sunday: { open: '08:00', close: '20:00' }
          },
          operatingHours: { start: '06:00', end: '22:00' },
          isActive: true,
          status: 'active'
        });
        console.log('✅ Created simulation court:', court._id);
      }
      
    } else {
      return NextResponse.json(
        { success: false, error: 'Either court ID or venue/court names are required' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!data.startTime || !data.endTime) {
      return NextResponse.json(
        { success: false, error: 'Start time and end time are required' },
        { status: 400 }
      );
    }
    
    // Validate time slots
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format for start or end time' },
        { status: 400 }
      );
    }
    
    if (startTime >= endTime) {
      return NextResponse.json(
        { success: false, error: 'Start time must be before end time' },
        { status: 400 }
      );
    }
    
    // For simulation, skip past time validation to allow demo bookings
    console.log('⏰ Time validation passed');
    
    // Skip overlap check for simulation to make demo easier
    if (data.checkOverlap !== false) {
      const overlappingBooking = await Booking.findOne({
        court: court._id,
        status: { $nin: ['cancelled'] },
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        ]
      });
      
      if (overlappingBooking) {
        return NextResponse.json(
          { success: false, error: 'This time slot is already booked' },
          { status: 409 }
        );
      }
    }
    
    // Calculate pricing
    const durationHours = Math.max(1, (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
    const basePrice = (court.pricing?.hourlyRate || court.pricePerHour || 500) * durationHours;
    const tax = Math.round(basePrice * 0.18); // 18% GST
    const platformFee = Math.round(basePrice * 0.05); // 5% platform fee
    const totalPrice = Math.round(basePrice + tax + platformFee);
    
    const pricingBreakdown = {
      baseRate: Math.round(basePrice),
      tax,
      platformFee,
      currency: 'INR'
    };
    
    console.log('💰 Calculated pricing:', { basePrice, tax, platformFee, totalPrice });
    
    // Create booking with minimal required data
    const bookingData = {
      user: user.userId,
      court: court._id,
      venue: venue._id,
      startTime,
      endTime,
      totalPrice,
      pricingBreakdown,
      status: data.status || 'confirmed',
      paymentStatus: data.paymentStatus || 'paid',
      paymentId: data.paymentId || `sim_${Date.now()}`,
      notes: data.notes || 'Simulation booking',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('💾 Creating booking with data:', {
      user: bookingData.user,
      court: bookingData.court,
      venue: bookingData.venue,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      totalPrice: bookingData.totalPrice,
      status: bookingData.status
    });
    
    const booking = await Booking.create(bookingData);
    console.log('✅ Booking created successfully:', booking._id);
    
    // Populate the created booking for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('court', 'name sportType pricing')
      .populate('venue', 'name shortLocation')
      .lean();
    
    console.log('✅ Booking creation completed successfully:', {
      id: booking._id,
      venue: venue.name,
      court: court.name,
      user: user.userId
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: booking._id.toString(),
        booking: populatedBooking,
        message: 'Booking created successfully'
      }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('💥 Error creating booking:', error);
    console.error('💥 Error stack:', error.stack);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: messages
      }, { status: 400 });
    }
    
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: 'Duplicate booking conflict'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create booking',
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message
      } : undefined
    }, { status: 500 });
  }
}, []);
