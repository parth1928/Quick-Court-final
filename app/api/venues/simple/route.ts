import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Venue from '@/models/Venue';

// Simple venues API for debugging
export async function GET(request: Request) {
  try {
    console.log('GET /api/venues/simple - Starting...');
    await dbConnect();
    console.log('Database connected');
    
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');
    const sport = searchParams.get('sport');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Simple query - just get approved venues
    const query: any = {
      approvalStatus: 'approved',
      status: 'approved'
    };
    
    // Add sport filter if provided
    if (sport && sport !== 'all') {
      query.$or = [
        { sportsOffered: { $regex: new RegExp(sport, 'i') } },
        { sports: { $regex: new RegExp(sport, 'i') } }
      ];
    }
    
    console.log('Simple query:', JSON.stringify(query, null, 2));
    
    // Fetch venues
    const venues = await Venue.find(query)
      .select('_id name shortLocation address description sportsOffered sports startingPrice pricePerHour rating totalReviews reviewCount images photos amenities approvalStatus status')
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${venues.length} venues`);
    
    if (view === 'card') {
      // Convert to card format
      const venueCards = venues.map((v: any) => ({
        id: v._id.toString(),
        name: v.name || 'Unnamed Venue',
        location: v.shortLocation || (v.address ? `${v.address.city || 'Unknown'}, ${v.address.state || ''}` : 'Location not specified'),
        sports: v.sportsOffered || v.sports || [],
        price: v.startingPrice || v.pricePerHour || 0,
        rating: v.rating || 0,
        reviews: v.totalReviews || v.reviewCount || 0,
        image: (v.images && v.images[0]) || (v.photos && v.photos[0]) || '/placeholder.jpg',
        amenities: (v.amenities || []).slice(0, 5),
        description: v.description || ''
      }));
      
      const total = await Venue.countDocuments(query);
      
      return NextResponse.json({
        success: true,
        venues: venueCards,
        pagination: {
          total,
          page: 1,
          pages: Math.ceil(total / limit)
        }
      });
    }
    
    // Return full venue data
    const total = await Venue.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      venues,
      pagination: {
        total,
        page: 1,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error: any) {
    console.error('Error in simple venues API:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      venues: []
    }, { status: 500 });
  }
}
