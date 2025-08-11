import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Match from '@/models/Match';
import Venue from '@/models/Venue';
import User from '@/models/User';

// GET /api/matches - Get all matches
export const GET = withAuth(async (request: Request, user: any) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query: any = {};
    
    // Filter by sport
    const sport = searchParams.get('sport');
    if (sport) {
      query.sport = sport;
    }
    
    // Filter by status
    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    } else {
      // By default, only show Open matches
      query.status = { $in: ['Open', 'Full'] };
    }
    
    // Filter by date (future matches only by default)
    const includeAll = searchParams.get('includeAll');
    if (!includeAll) {
      query.date = { $gte: new Date() };
    }
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const matches = await Match.find(query)
      .populate('venue', 'name location address')
      .populate('createdBy', 'name avatar')
      .populate('participants.user', 'name avatar')
      .sort({ date: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Match.countDocuments(query);
    
    // Transform matches for frontend
    const transformedMatches = matches.map((match: any) => ({
      id: match._id.toString(),
      sport: match.sport,
      venue: match.venue?.name || 'Unknown Venue',
      venueId: match.venue?._id?.toString(),
      date: match.date.toISOString().split('T')[0],
      time: match.time,
      prizeAmount: match.prizeAmount || 0,
      playersJoined: match.participants?.length || 0,
      playersNeeded: match.playersNeeded,
      createdBy: match.createdBy?.name || 'Unknown User',
      createdById: match.createdBy?._id?.toString(),
      status: match.status,
      participants: (match.participants || []).map((p: any) => ({
        id: p.user?._id?.toString(),
        name: p.user?.name || 'Unknown User',
        joinedAt: p.joinedAt
      })),
      description: match.description,
      rules: match.rules || [],
      createdAt: match.createdAt,
      updatedAt: match.updatedAt
    }));
    
    return NextResponse.json({
      matches: transformedMatches,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['user', 'owner', 'admin']);

// POST /api/matches - Create a new match
export const POST = withAuth(async (request: Request, user: any) => {
  try {
    if (user.role !== 'user') {
      return NextResponse.json(
        { error: 'Only users can create matches' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    const data = await request.json();
    
    // Validation
    const { sport, venue, date, time, playersNeeded, prizeAmount, description, rules } = data;
    
    if (!sport || !venue || !date || !time || !playersNeeded) {
      return NextResponse.json(
        { error: 'Sport, venue, date, time, and players needed are required' },
        { status: 400 }
      );
    }
    
    if (playersNeeded < 2 || playersNeeded > 50) {
      return NextResponse.json(
        { error: 'Players needed must be between 2 and 50' },
        { status: 400 }
      );
    }
    
    if (new Date(date) < new Date()) {
      return NextResponse.json(
        { error: 'Cannot create matches for past dates' },
        { status: 400 }
      );
    }
    
    // Verify venue exists and supports the sport
    const venueDoc = await Venue.findById(venue).lean();
    if (!venueDoc) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }
    
    if (!venueDoc.sports || !venueDoc.sports.includes(sport)) {
      return NextResponse.json(
        { error: 'Selected venue does not support this sport' },
        { status: 400 }
      );
    }
    
    // Create match
    const match = await Match.create({
      sport,
      venue,
      date: new Date(date),
      time,
      playersNeeded: parseInt(playersNeeded),
      prizeAmount: parseInt(prizeAmount) || 0,
      description,
      rules: rules || [],
      createdBy: user.userId,
      participants: [{
        user: user.userId,
        joinedAt: new Date()
      }],
      status: 'Open'
    });
    
    // Populate and return the created match
    const populatedMatch = await Match.findById(match._id)
      .populate('venue', 'name location address')
      .populate('createdBy', 'name avatar')
      .populate('participants.user', 'name avatar')
      .lean();
    
    const transformedMatch = {
      id: populatedMatch._id.toString(),
      sport: populatedMatch.sport,
      venue: populatedMatch.venue?.name || 'Unknown Venue',
      venueId: populatedMatch.venue?._id?.toString(),
      date: populatedMatch.date.toISOString().split('T')[0],
      time: populatedMatch.time,
      prizeAmount: populatedMatch.prizeAmount || 0,
      playersJoined: populatedMatch.participants?.length || 0,
      playersNeeded: populatedMatch.playersNeeded,
      createdBy: populatedMatch.createdBy?.name || 'Unknown User',
      createdById: populatedMatch.createdBy?._id?.toString(),
      status: populatedMatch.status,
      participants: (populatedMatch.participants || []).map((p: any) => ({
        id: p.user?._id?.toString(),
        name: p.user?.name || 'Unknown User',
        joinedAt: p.joinedAt
      })),
      description: populatedMatch.description,
      rules: populatedMatch.rules || [],
      createdAt: populatedMatch.createdAt,
      updatedAt: populatedMatch.updatedAt
    };
    
    return NextResponse.json({
      match: transformedMatch,
      message: 'Match created successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['user']);
