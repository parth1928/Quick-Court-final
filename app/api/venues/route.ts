import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Venue from '@/models/Venue';
import { withAuth } from '@/lib/auth';

// GET /api/venues - Get all venues
export const GET = withAuth(async (request: Request) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query: any = {};
    
    // Filter by approval status
    const status = searchParams.get('status');
    if (status) {
      query.approvalStatus = status;
    }

    // Filter by sport
    const sport = searchParams.get('sport');
    if (sport) {
      query['courts.sport'] = sport;
    }

    // Basic pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const venues = await Venue.find(query)
      .populate('owner', 'name email phone')
      .populate('courts')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Venue.countDocuments(query);

    return NextResponse.json({
      venues,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching venues:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/venues - Create a new venue
export const POST = withAuth(async (request: Request, user: any) => {
  try {
    if (user.role !== 'owner' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only facility owners can create venues' },
        { status: 403 }
      );
    }

    await dbConnect();
    const data = await request.json();

    // Add the owner to the venue data
    data.owner = user.userId;
    
    const venue = await Venue.create(data);
    
    return NextResponse.json(venue);
  } catch (error: any) {
    console.error('Error creating venue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['owner', 'admin']);
