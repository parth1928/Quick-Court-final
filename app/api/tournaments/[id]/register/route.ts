import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Tournament from '@/models/Tournament';
import User from '@/models/User';
import { withAuth } from '@/lib/auth';

export const POST = withAuth(async (request: Request, user: any) => {
  try {
    await dbConnect();
    
    // Extract id from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 2]; // gets the id before 'register'
    
    const tournament = await Tournament.findById(id);
    if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    
    const now = new Date();
    if (tournament.status !== 'open') return NextResponse.json({ error: 'Registration not open' }, { status: 400 });
    if (now > new Date(tournament.registrationDeadline)) return NextResponse.json({ error: 'Registration deadline passed' }, { status: 400 });
    if (tournament.participants.find((p: any) => p.user.toString() === user.userId)) return NextResponse.json({ error: 'Already registered' }, { status: 400 });
    if (tournament.participants.length >= tournament.maxParticipants) return NextResponse.json({ error: 'Tournament full' }, { status: 400 });
    
    // Get full user profile for participant information
    const userDoc = await User.findById(user.userId).select('name email phone avatar').lean() as any;
    if (!userDoc) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    
    // Store comprehensive participant information
    (tournament.participants as any[]).push({ 
      user: user.userId, 
      name: userDoc.name || 'Player',
      email: userDoc.email || '',
      phone: userDoc.phone || '',
      avatar: userDoc.avatar || '/placeholder-user.jpg',
      registrationDate: new Date()
    });
    
    await tournament.save();
    return NextResponse.json({ 
      success: true, 
      participants: tournament.participants, 
      currentParticipants: tournament.participants.length 
    });
  } catch (error: any) {
    console.error('Error registering for tournament:', error);
    return NextResponse.json({ error: 'Failed to register for tournament' }, { status: 500 });
  }
});
