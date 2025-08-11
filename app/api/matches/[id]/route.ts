import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Match from '@/models/Match';

// GET /api/matches/[id] - Get single match
export const GET = withAuth(async (request: Request, user: any, { params }: { params: { id: string } }) => {
  try {
    await dbConnect();
    
    const match = await Match.findById(params.id)
      .populate('venue', 'name location address sports amenities')
      .populate('createdBy', 'name avatar')
      .populate('participants.user', 'name avatar')
      .lean();
    
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }
    
    const transformedMatch = {
      id: match._id.toString(),
      sport: match.sport,
      venue: {
        id: match.venue?._id?.toString(),
        name: match.venue?.name || 'Unknown Venue',
        location: match.venue?.location,
        address: match.venue?.address,
        sports: match.venue?.sports || [],
        amenities: match.venue?.amenities || []
      },
      date: match.date.toISOString().split('T')[0],
      time: match.time,
      prizeAmount: match.prizeAmount || 0,
      playersJoined: match.participants?.length || 0,
      playersNeeded: match.playersNeeded,
      createdBy: {
        id: match.createdBy?._id?.toString(),
        name: match.createdBy?.name || 'Unknown User',
        avatar: match.createdBy?.avatar
      },
      status: match.status,
      participants: (match.participants || []).map((p: any) => ({
        id: p.user?._id?.toString(),
        name: p.user?.name || 'Unknown User',
        avatar: p.user?.avatar,
        joinedAt: p.joinedAt
      })),
      description: match.description,
      rules: match.rules || [],
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
      // Helper flags for the current user
      canJoin: match.status === 'Open' && 
               match.participants.length < match.playersNeeded &&
               match.createdBy._id.toString() !== user.userId &&
               !match.participants.some((p: any) => p.user._id.toString() === user.userId),
      hasJoined: match.participants.some((p: any) => p.user._id.toString() === user.userId),
      isCreator: match.createdBy._id.toString() === user.userId
    };
    
    return NextResponse.json({
      match: transformedMatch
    });
    
  } catch (error: any) {
    console.error('Error fetching match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['user', 'owner', 'admin']);

// PATCH /api/matches/[id] - Update match (only creator or admin)
export const PATCH = withAuth(async (request: Request, user: any, { params }: { params: { id: string } }) => {
  try {
    await dbConnect();
    
    const match = await Match.findById(params.id);
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    if (match.createdBy.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only update your own matches' },
        { status: 403 }
      );
    }
    
    const updates = await request.json();
    const allowedUpdates = ['description', 'rules', 'time', 'prizeAmount'];
    
    // Filter to only allowed updates
    const filteredUpdates: any = {};
    for (const key of allowedUpdates) {
      if (key in updates) {
        filteredUpdates[key] = updates[key];
      }
    }
    
    // Special handling for status updates
    if (updates.status && ['Open', 'Cancelled', 'Completed'].includes(updates.status)) {
      if (updates.status === 'Cancelled' || updates.status === 'Completed') {
        filteredUpdates.status = updates.status;
      }
    }
    
    Object.assign(match, filteredUpdates);
    match.updatedAt = new Date();
    await match.save();
    
    return NextResponse.json({
      message: 'Match updated successfully'
    });
    
  } catch (error: any) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['user', 'admin']);

// DELETE /api/matches/[id] - Delete/Cancel match (only creator or admin)
export const DELETE = withAuth(async (request: Request, user: any, { params }: { params: { id: string } }) => {
  try {
    await dbConnect();
    
    const match = await Match.findById(params.id);
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    if (match.createdBy.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only delete your own matches' },
        { status: 403 }
      );
    }
    
    // Instead of deleting, mark as cancelled if it has participants
    if (match.participants.length > 1) {
      match.status = 'Cancelled';
      await match.save();
      return NextResponse.json({
        message: 'Match cancelled successfully'
      });
    } else {
      // Delete if only creator joined
      await Match.findByIdAndDelete(params.id);
      return NextResponse.json({
        message: 'Match deleted successfully'
      });
    }
    
  } catch (error: any) {
    console.error('Error deleting match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['user', 'admin']);
