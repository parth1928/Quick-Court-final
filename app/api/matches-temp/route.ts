import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Match from '@/models/Match';
import Venue from '@/models/Venue';
import User from '@/models/User';

// Temporary endpoint without authentication for testing
export async function GET() {
  try {
    await dbConnect();
    console.log('✅ Database connected for temp matches');
    
    const matches = await Match.find({})
      .populate('venue', 'name location address')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    const transformedMatches = matches.map((match: any) => ({
      id: match._id.toString(),
      sport: match.sport,
      venue: match.venue?.name || 'Unknown Venue',
      venueId: match.venue?._id?.toString(),
      date: match.date.toISOString().split('T')[0],
      time: match.time,
      prizeAmount: match.prizeAmount || 0,
      courtFees: match.courtFees || 0,
      playersJoined: match.participants?.length || 0,
      playersNeeded: match.playersNeeded,
      createdBy: match.createdBy?.name || 'Unknown User',
      status: match.status,
      description: match.description,
      participants: (match.participants || []).map((p: any) => ({
        id: p.user?.toString(),
        name: 'Player',
        joinedAt: p.joinedAt
      }))
    }));
    
    return NextResponse.json({
      success: true,
      matches: transformedMatches,
      total: matches.length
    });
    
  } catch (error: any) {
    console.error('❌ Error in temp matches GET:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    console.log('✅ Database connected for temp match creation');
    
    const body = await request.json();
    console.log('📝 Received match data:', body);
    
    // Basic validation
    if (!body.sport || !body.date || !body.time || !body.playersNeeded) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: sport, date, time, playersNeeded'
      }, { status: 400 });
    }
    
    // Find or create test user
    let testUser = await User.findOne({ email: 'tempuser@test.com' });
    if (!testUser) {
      console.log('👤 Creating temp user...');
      testUser = await User.create({
        name: 'Temp User',
        email: 'tempuser@test.com',
        password: 'hashedpassword',
        role: 'user',
        phone: '+1234567890',
        isActive: true,
        emailVerified: true
      });
    }
    
    // Handle venue
    let venue;
    if (body.venueId === 'auto-create-elite-sports' || !body.venueId) {
      // Find or create Elite Sports venue
      venue = await Venue.findOne({ name: 'Elite Sports Complex' });
      if (!venue) {
        console.log('🏢 Creating Elite Sports venue...');
        venue = await Venue.create({
          name: 'Elite Sports Complex',
          owner: testUser._id,
          description: 'Modern sports complex with multiple courts',
          sports: ['Basketball', 'Tennis', 'Badminton', 'Volleyball', 'Table Tennis'],
          address: {
            street: '123 Elite Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          location: {
            type: 'Point',
            coordinates: [72.8777, 19.0760]
          },
          contactPhone: '9999999001',
          contactEmail: 'info@elitesports.com',
          approvalStatus: 'approved',
          status: 'approved',
          isActive: true,
          startingPrice: 300,
          createdBy: testUser._id,
          updatedBy: testUser._id,
          slug: `elite-sports-complex-${Date.now()}`
        });
      }
    } else {
      venue = await Venue.findById(body.venueId);
      if (!venue) {
        return NextResponse.json({
          success: false,
          error: 'Venue not found'
        }, { status: 404 });
      }
    }
    
    console.log('✅ Using venue:', venue.name);
    
    // Create match
    const matchData = {
      sport: body.sport,
      venue: venue._id,
      date: new Date(body.date),
      time: body.time,
      playersNeeded: parseInt(body.playersNeeded),
      prizeAmount: parseFloat(body.prizeAmount) || 0,
      courtFees: parseFloat(body.courtFees) || 0,
      description: body.description || '',
      createdBy: testUser._id,
      status: 'Open',
      participants: [{
        user: testUser._id,
        joinedAt: new Date()
      }]
    };
    
    console.log('💾 Creating match:', matchData);
    const match = await Match.create(matchData);
    console.log('✅ Match created with ID:', match._id);
    
    // Return created match
    const populatedMatch = await Match.findById(match._id)
      .populate('venue', 'name')
      .populate('createdBy', 'name')
      .lean();
    
    const response = {
      success: true,
      match: {
        id: populatedMatch._id.toString(),
        sport: populatedMatch.sport,
        venue: populatedMatch.venue?.name || venue.name,
        venueId: populatedMatch.venue?._id?.toString() || venue._id.toString(),
        date: populatedMatch.date.toISOString().split('T')[0],
        time: populatedMatch.time,
        playersNeeded: populatedMatch.playersNeeded,
        prizeAmount: populatedMatch.prizeAmount || 0,
        courtFees: populatedMatch.courtFees || 0,
        status: populatedMatch.status,
        createdBy: populatedMatch.createdBy?.name || 'Temp User',
        description: populatedMatch.description,
        participants: populatedMatch.participants || []
      }
    };
    
    return NextResponse.json(response, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ Error in temp match creation:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
