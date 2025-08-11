import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Match from '@/models/Match';

// POST /api/matches/[id]/join - Join a match
export const POST = withAuth(async (request: Request, user: any, { params }: { params: { id: string } }) => {
  try {
    if (user.role !== 'user') {
      return NextResponse.json(
        { error: 'Only users can join matches' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const match = await Match.findById(params.id);
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }
    
    // Check if match is in the past
    if (match.date < new Date()) {
      return NextResponse.json(
        { error: 'Cannot join past matches' },
        { status: 400 }
      );
    }
    
    // Check if match is open
    if (match.status !== 'Open') {
      return NextResponse.json(
        { error: 'Match is not open for joining' },
        { status: 400 }
      );
    }
    
    // Check if user is the creator
    if (match.createdBy.toString() === user.userId) {
      return NextResponse.json(
        { error: 'Cannot join your own match' },
        { status: 400 }
      );
    }
    
    // Check if user already joined
    const alreadyJoined = match.participants.some((p: any) => p.user.toString() === user.userId);
    if (alreadyJoined) {
      return NextResponse.json(
        { error: 'You have already joined this match' },
        { status: 400 }
      );
    }
    
    // Check if match is full
    if (match.participants.length >= match.playersNeeded) {
      return NextResponse.json(
        { error: 'Match is already full' },
        { status: 400 }
      );
    }
    
    // Add user to participants
    match.participants.push({
      user: user.userId,
      joinedAt: new Date()
    });
    
    // Update status if full
    if (match.participants.length >= match.playersNeeded) {
      match.status = 'Full';
    }
    
    await match.save();
    
    // Return updated match data
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
      message: 'Successfully joined the match'
    });
    
  } catch (error: any) {
    console.error('Error joining match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['user']);

// DELETE /api/matches/[id]/join - Leave a match
export const DELETE = withAuth(async (request: Request, user: any, { params }: { params: { id: string } }) => {
  try {
    if (user.role !== 'user') {
      return NextResponse.json(
        { error: 'Only users can leave matches' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const match = await Match.findById(params.id);
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the creator (they can't leave their own match)
    if (match.createdBy.toString() === user.userId) {
      return NextResponse.json(
        { error: 'Cannot leave your own match. Cancel the match instead.' },
        { status: 400 }
      );
    }
    
    // Check if user is in the match
    const participantIndex = match.participants.findIndex((p: any) => p.user.toString() === user.userId);
    if (participantIndex === -1) {
      return NextResponse.json(
        { error: 'You are not part of this match' },
        { status: 400 }
      );
    }
    
    // Remove user from participants
    match.participants.splice(participantIndex, 1);
    
    // Update status if was full
    if (match.status === 'Full' && match.participants.length < match.playersNeeded) {
      match.status = 'Open';
    }
    
    await match.save();
    
    return NextResponse.json({
      message: 'Successfully left the match'
    });
    
  } catch (error: any) {
    console.error('Error leaving match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['user']);
