import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Match from '@/models/Match';
import User from '@/models/User';
// import { sendEmail } from '@/lib/sendEmail';
import Notification from '@/models/Notification';

// POST /api/matches/[id]/join - Join a match
export const POST = withAuth(async (request: Request, user: any) => {
  console.log('🎯 Join match API called by user:', user.userId);
  
  try {
    // Extract match ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const matchId = pathSegments[pathSegments.length - 2]; // gets the id before 'join'
    
    console.log('🔍 Extracted matchId from URL:', matchId);
    
    // Allow users and owners to join matches
    if (user.role !== 'user' && user.role !== 'owner') {
      console.log('❌ Role check failed:', user.role);
      return NextResponse.json(
        { error: 'Only users and owners can join matches' },
        { status: 403 }
      );
    }
    
    console.log('✅ Role check passed:', user.role);
    
    await dbConnect();
    console.log('✅ Database connected');
    
    const match = await Match.findById(matchId);
    if (!match) {
      console.log('❌ Match not found:', matchId);
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Match found:', match.sport, 'at', match.venue);
    
    // Check if match is in the past
    if (match.date < new Date()) {
      console.log('❌ Match is in the past:', match.date);
      return NextResponse.json(
        { error: 'Cannot join past matches' },
        { status: 400 }
      );
    }
    
    // Check if match is open
    if (match.status !== 'Open') {
      console.log('❌ Match is not open:', match.status);
      return NextResponse.json(
        { error: 'Match is not open for joining' },
        { status: 400 }
      );
    }
    
    // Check if user is the creator
    if (match.createdBy.toString() === user.userId) {
      console.log('❌ User is the creator');
      return NextResponse.json(
        { error: 'Cannot join your own match' },
        { status: 400 }
      );
    }
    
    // Check if user already joined
    const alreadyJoined = match.participants.some((p: any) => p.user.toString() === user.userId);
    if (alreadyJoined) {
      console.log('❌ User already joined');
      return NextResponse.json(
        { error: 'You have already joined this match' },
        { status: 400 }
      );
    }
    
    // Check if match is full
    if (match.participants.length >= match.playersNeeded) {
      console.log('❌ Match is full:', match.participants.length, '/', match.playersNeeded);
      return NextResponse.json(
        { error: 'Match is already full' },
        { status: 400 }
      );
    }
    
    console.log('✅ All checks passed. Adding user to match...');
    
    // Add user to participants
    match.participants.push({
      user: user.userId,
      joinedAt: new Date()
    });
    
    console.log('✅ User added to participants. Current count:', match.participants.length);
    
    // Update status if full
    if (match.participants.length >= match.playersNeeded) {
      match.status = 'Full';
      console.log('✅ Match is now full, updating status');
    }
    
    console.log('💾 Saving match...');
    await match.save();
    console.log('✅ Match saved successfully');

    // In-app notification for match creator
    try {
      console.log('📨 Creating notification for match creator...');
      const creator = await User.findById(match.createdBy);
      const joiner = await User.findById(user.userId);
      if (creator && joiner) {
        await Notification.create({
          user: creator._id,
          type: 'match_joined',
          message: `${joiner.name} has joined your match for ${match.sport} on ${match.date.toLocaleDateString()} at ${match.time}.`,
          data: {
            matchId: match._id,
            joinerId: joiner._id,
            joinerName: joiner.name
          },
          read: false
        });
        console.log('✅ Notification created successfully');
      } else {
        console.warn('⚠️ Could not find creator or joiner for notification');
      }
    } catch (e) {
      console.error('❌ Failed to create match join notification:', e);
    }

    // Return updated match data
    console.log('📤 Preparing response...');
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

    console.log('✅ Join match successful, returning response');
    return NextResponse.json({
      match: transformedMatch,
      message: 'Successfully joined the match'
    });
    
  } catch (error: any) {
    console.error('💥 Error in join match API:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}, ['user', 'owner']);

// DELETE /api/matches/[id]/join - Leave a match
export const DELETE = withAuth(async (request: Request, user: any) => {
  try {
    // Extract match ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const matchId = pathSegments[pathSegments.length - 2]; // gets the id before 'join'
    
    // Allow users and owners to leave matches
    if (user.role !== 'user' && user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only users and owners can leave matches' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const match = await Match.findById(matchId);
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
