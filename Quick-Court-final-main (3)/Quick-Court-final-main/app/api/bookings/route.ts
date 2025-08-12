import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Booking from '@/models/Booking';
import Court from '@/models/Court';
import Venue from '@/models/Venue';

// Helper function to get venues owned by a user
async function getOwnerVenues(userId: string): Promise<Types.ObjectId[]> {
  try {
    const venues = await Venue.find({ owner: userId }).exec();
    return venues.map(venue => venue._id);
  } catch (error) {
    console.error('Error fetching owner venues:', error);
    return [];
  }
}

// GET /api/bookings - Get user's bookings
export const GET = withAuth(async (request: Request, user: any) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query: any = {};
    
    // Regular users can only see their own bookings
    if (user.role === 'user') {
      query.user = user.userId;
    }
    // Facility owners can see bookings for their venues
    else if (user.role === 'owner') {
      const courts = await Court.find({ venue: { $in: await getOwnerVenues(user.userId) } });
      query.court = { $in: courts.map(court => court._id) };
    }
    // Admin can see all bookings

    // Filter by status
    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    }

    // Filter by date range
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    // Basic pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate('court')
      .populate('user', 'name email phone')
      .skip(skip)
      .limit(limit)
      .sort({ startTime: -1 });

    const total = await Booking.countDocuments(query);

    return NextResponse.json({
      bookings,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/bookings - Create a new booking
export const POST = withAuth(async (request: Request, user: any) => {
  try {
    await dbConnect();
    const data = await request.json();

    // Add the user to the booking data
    data.user = user.userId;
    
    // Check if the time slot is available
    const overlappingBooking = await Booking.findOne({
      court: data.court,
      status: { $ne: 'cancelled' },
      $or: [
        {
          startTime: { $lt: new Date(data.endTime) },
          endTime: { $gt: new Date(data.startTime) },
        },
      ],
    });

    if (overlappingBooking) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 400 }
      );
    }

    // Calculate total price
    const court = await Court.findById(data.court);
    if (!court) {
      return NextResponse.json(
        { error: 'Court not found' },
        { status: 404 }
      );
    }

    const hours = (new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) / (1000 * 60 * 60);
    data.totalPrice = court.pricing.hourlyRate * hours;
    
    const booking = await Booking.create(data);
    
    return NextResponse.json(booking);
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});


