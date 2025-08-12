import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Venue from '@/models/Venue';
import mongoose from 'mongoose';

// Clean venues API - replacement for the complex main API
export async function GET(request: Request) {
  try {
    console.log('GET /api/venues/clean - Starting...');
    await dbConnect();
    console.log('Database connected successfully');
    
    const { searchParams } = new URL(request.url);
    
    // Build simple, reliable query
    const query: any = {
      approvalStatus: 'approved',
      status: 'approved'
    };
    
    // Add sport filter if provided
    const sport = searchParams.get('sport');
    if (sport && sport !== 'all') {
      query.$or = [
        { sportsOffered: { $regex: new RegExp(sport, 'i') } },
        { sports: { $regex: new RegExp(sport, 'i') } }
      ];
    }
    
    // Add owner filter if provided (for owner dashboard)
    const ownerId = searchParams.get('ownerId');
    if (ownerId) {
      try {
        const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
        query.owner = ownerObjectId;
        // Remove approval status filter for owner's own venues
        delete query.approvalStatus;
        delete query.status;
      } catch (err) {
        console.error('Invalid owner ID format:', ownerId);
        return NextResponse.json({ error: 'Invalid owner ID format' }, { status: 400 });
      }
    }
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = (page - 1) * limit;
    
    console.log('Final query:', JSON.stringify(query, null, 2));
    
    // Fetch venues
    const venues = await Venue.find(query)
      .select('_id name shortLocation address description sportsOffered sports startingPrice pricePerHour rating totalReviews reviewCount images photos amenities approvalStatus status owner')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${venues.length} venues in database`);
    
    // Always return card format for consistency
    const venueCards = venues.map((v: any) => ({
      id: v._id.toString(),
      name: v.name || 'Unnamed Venue',
      location: v.shortLocation || (v.address ? 
        `${v.address.city || 'Unknown City'}${v.address.state ? ', ' + v.address.state : ''}` : 
        'Location not specified'),
      sports: v.sportsOffered || v.sports || [],
      price: v.startingPrice || v.pricePerHour || 0,
      rating: v.rating || 0,
      reviews: v.totalReviews || v.reviewCount || 0,
      image: (v.images && v.images[0]) || (v.photos && v.photos[0]) || '/placeholder.jpg',
      amenities: (v.amenities || []).slice(0, 5),
      description: v.description || '',
      status: v.status || 'pending',
      approvalStatus: v.approvalStatus || 'pending'
    }));
    
    const total = await Venue.countDocuments(query);
    
    console.log(`Returning ${venueCards.length} venue cards`);
    
    return NextResponse.json({
      success: true,
      venues: venueCards,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error: any) {
    console.error('Error in clean venues API:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      venues: []
    }, { status: 500 });
  }
}
