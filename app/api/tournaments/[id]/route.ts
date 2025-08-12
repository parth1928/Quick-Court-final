import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/connect';
import Tournament from '@/models/Tournament';
import '@/models/User'; // ensure User schema is registered for populate
import { withAuth } from '@/lib/auth';

// GET endpoint accessible without authentication for users to view tournament details
export async function GET(_req: Request, { params }: any) {
  try {
    await dbConnect();
    // Validate id to avoid CastError
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const tournament = await Tournament.findById(params.id)
      .populate('createdBy', 'name email')
      .populate('participants.user', 'name email')
      .lean();
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }
    return NextResponse.json({ tournament });
  } catch (error: any) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json({ error: 'Failed to fetch tournament' }, { status: 500 });
  }
}

export const PATCH = withAuth(async (request: Request, user: any, context?: any) => {
  try {
    await dbConnect();
    
    // Extract id from URL since context.params might not be available in withAuth
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    const tournament = await Tournament.findById(id);
    
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }
    
    if (tournament.createdBy.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const updates = await request.json();
    Object.assign(tournament, updates, { updatedAt: new Date() });
    await tournament.save();
    
    return NextResponse.json({ tournament });
  } catch (error: any) {
    console.error('Error updating tournament:', error);
    return NextResponse.json({ error: 'Failed to update tournament' }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request: Request, user: any, context?: any) => {
  try {
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    // Extract id from URL since context.params might not be available in withAuth
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    await Tournament.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json({ error: 'Failed to delete tournament' }, { status: 500 });
  }
});
