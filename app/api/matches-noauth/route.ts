import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Match from '@/models/Match';
import Venue from '@/models/Venue';
import User from '@/models/User';

// GET /api/matches-noauth - Get matches without authentication
export async function GET() {
  try {
    console.log('🔓 No-auth matches GET called');
    await dbConnect();
    
    const matches = await Match.find({ status: { $in: ['Open', 'Full'] } })
      .populate('venue', 'name location address')
      .populate('court', 'name sport pricePerHour')
      .populate('createdBy', 'name avatar')
      .sort({ date: 1, createdAt: -1 })
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
      description: match.description
    }));
    
    console.log('✅ No-auth matches loaded:', transformedMatches.length);
    
    return NextResponse.json({
      success: true,
      matches: transformedMatches,
      message: 'Matches loaded without auth'
    });
  } catch (error: any) {
    console.error('❌ No-auth matches error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      matches: []
    }, { status: 500 });
  }
}

// POST /api/matches-noauth - Create match without authentication
export async function POST(request: Request) {
  try {
    console.log('🔓 No-auth match creation called');
    await dbConnect();
    
    const data = await request.json();
    console.log('📝 Received data:', data);
    
    // Find or create a default user for testing
    let defaultUser = await User.findOne({ email: 'test@example.com' });
    if (!defaultUser) {
      defaultUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        isActive: true,
        isEmailVerified: true
      });
      console.log('✅ Created default user');
    }
    
    // Find or create a default venue
    let defaultVenue = await Venue.findOne({ name: 'Elite Sports Complex' });
    if (!defaultVenue) {
      defaultVenue = await Venue.create({
        name: 'Elite Sports Complex',
        owner: defaultUser._id,
        description: 'Test venue',
        sports: ['Basketball', 'Tennis', 'Badminton', 'Football', 'Cricket'],
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'India'
        },
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139]
        },
        contactPhone: '9999999999',
        contactEmail: 'test@venue.com',
        approvalStatus: 'approved',
        isActive: true
      });
      console.log('✅ Created default venue');
    }
    
    const matchData = {
      sport: data.sport || 'Basketball',
      venue: defaultVenue._id,
      date: new Date(data.date || new Date().toISOString().split('T')[0]),
      time: data.time || '6:00 PM - 8:00 PM',
      playersNeeded: parseInt(data.playersNeeded) || 4,
      prizeAmount: parseFloat(data.prizeAmount) || 0,
      courtFees: parseFloat(data.courtFees) || 0,
      description: data.description || '',
      createdBy: defaultUser._id,
      status: 'Open'
    };
    
    const match = await Match.create(matchData);
    console.log('✅ Match created:', match._id);
    
    const populatedMatch = await Match.findById(match._id)
      .populate('venue', 'name')
      .populate('createdBy', 'name')
      .lean();
    
    const transformedMatch = {
      id: populatedMatch._id.toString(),
      sport: populatedMatch.sport,
      venue: populatedMatch.venue?.name || 'Elite Sports Complex',
      date: populatedMatch.date.toISOString().split('T')[0],
      time: populatedMatch.time,
      prizeAmount: populatedMatch.prizeAmount || 0,
      courtFees: populatedMatch.courtFees || 0,
      playersJoined: 1,
      playersNeeded: populatedMatch.playersNeeded,
      createdBy: populatedMatch.createdBy?.name || 'Test User',
      status: populatedMatch.status,
      description: populatedMatch.description
    };
    
    return NextResponse.json({
      success: true,
      match: transformedMatch,
      message: 'Match created without auth'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ No-auth match creation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
