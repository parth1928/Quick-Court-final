import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Venue from '@/models/Venue';
import { withAuth } from '@/lib/auth';

// GET /api/venues - Get all venues
export async function GET(request: Request) {
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
      // Use regex for case-insensitive search in sports array
      query.sports = { $regex: new RegExp(sport, 'i') };
    }

    // Basic pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const view = searchParams.get('view');

    let venues;
    if (view === 'card') {
      // force only approved for card listings
      if (!query.approvalStatus) query.approvalStatus = 'approved';
      venues = await Venue.find(query)
        .select('_id name shortLocation address description startingPrice rating reviewCount sports amenities images photos status approvalStatus operatingHours')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();
        
      const cards = (venues as any[]).map(v => ({
        _id: v._id.toString(),
        name: v.name,
        description: v.description || '',
        location: v.shortLocation || (v.address ? `${v.address.city || ''}${v.address.city && v.address.state ? ', ' : ''}${v.address.state || ''}` : ''),
        shortLocation: v.shortLocation || v.address?.city,
        sports: v.sports || [],
        sportsOffered: v.sports || [],
        startingPrice: v.startingPrice || 0,
        pricePerHour: v.startingPrice || 0,
        rating: v.rating || 0,
        images: v.images || v.photos || [],
        image: (v.images && v.images[0]) || (v.photos && v.photos[0]) || '/placeholder.svg',
        address: v.address || { city: v.shortLocation },
        operatingHours: v.operatingHours || { open: '06:00', close: '22:00' },
        approvalStatus: v.approvalStatus,
        status: v.status || v.approvalStatus,
        isActive: v.isActive !== false,
        amenities: (v.amenities || []).slice(0, 5),
        totalReviews: v.reviewCount || 0
      }));
      
      const total = await Venue.countDocuments(query);
      return NextResponse.json({ venues: cards, pagination: { total, page, pages: Math.ceil(total / limit) } });
    }

    venues = await Venue.find(query)
      .populate('owner', 'name email phone')
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
}

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
