import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Court from '@/models/Court';
import Venue from '@/models/Venue';

export const GET = withAuth(async (req: NextRequest, { userId, role }) => {
  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const query: any = {};

    // Get venueId from query params
    const venueId = searchParams.get('venueId');
    if (venueId) {
      query.venue = venueId;
    }

    // If owner, ensure they can only see their courts
    if (role === 'owner') {
      const ownedVenues = await Venue.find({ owner: userId }).select('_id');
      const venueIds = ownedVenues.map(venue => venue._id);
      query.venue = { $in: venueIds };
    }

    // Additional filters
    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    }

    const sportType = searchParams.get('sportType');
    if (sportType) {
      query.sportType = sportType;
    }

    // Get courts with venue info
    const courts = await Court.find(query)
      .populate('venue', 'name location')
      .sort({ createdAt: -1 });

    return NextResponse.json(courts);
  } catch (error: any) {
    console.error('Courts GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courts' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: NextRequest, { userId, role }) => {
  try {
    await connectDB();

    if (role !== 'owner' && role !== 'admin') {
      return NextResponse.json(
        { error: 'Only facility owners can create courts' },
        { status: 403 }
      );
    }

    const data = await req.json();
    const {
      venueId,
      name,
      sportType,
      surfaceType,
      indoor,
      capacity,
      pricing,
      operatingHours,
      images = [],
      availability,
      equipmentIncluded = []
    } = data;

    // Validate required fields
    if (!venueId || !name || !sportType || !surfaceType || !pricing?.hourlyRate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    // Validate timeSlotPricing if provided
    if (pricing?.timeSlotPricing && !Array.isArray(pricing.timeSlotPricing)) {
      return NextResponse.json(
        { error: 'timeSlotPricing must be an array' },
        { status: 400 }
      );
    }

    // Check if venue exists and user owns it
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    if (role !== 'admin' && venue.owner.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to add courts to this venue' },
        { status: 403 }
      );
    }

    // Create new court
    const court = new Court({
      venue: venueId,
      name,
      sportType,
      surfaceType,
      indoor: indoor || false,
      capacity: capacity || 2,
      pricing,
      operatingHours,
      images,
      availability,
      equipmentIncluded,
      createdBy: userId,
      status: 'active'
    });

    await court.save();

    // Return the court with venue details
    const savedCourt = await Court.findById(court._id)
      .populate('venue', 'name location');

    return NextResponse.json(savedCourt);
  } catch (error: any) {
    console.error('Court POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create court' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (req: NextRequest, { userId, role }) => {
  try {
    await connectDB();
    const data = await req.json();
    const { courtId, ...updateData } = data;

    if (!courtId) {
      return NextResponse.json(
        { error: 'Court ID is required' },
        { status: 400 }
      );
    }

    // Check court exists
    const court = await Court.findById(courtId).populate('venue');
    if (!court) {
      return NextResponse.json(
        { error: 'Court not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (role !== 'admin' && (court.venue as any).owner.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this court' },
        { status: 403 }
      );
    }

    // Update court
    const updatedCourt = await Court.findByIdAndUpdate(
      courtId,
      {
        ...updateData,
        updatedBy: userId,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('venue', 'name location');

    return NextResponse.json(updatedCourt);
  } catch (error: any) {
    console.error('Court PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update court' },
      { status: 500 }
    );
  }
});
