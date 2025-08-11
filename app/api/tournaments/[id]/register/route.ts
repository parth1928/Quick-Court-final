import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Tournament from '@/models/Tournament';
import User from '@/models/User';
import { withAuth } from '@/lib/auth';

export const POST = withAuth(async (_req: Request, user: any, { params }: any) => {
  await dbConnect();
  const tournament = await Tournament.findById(params.id);
  if (!tournament) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const now = new Date();
  if (tournament.status !== 'open') return NextResponse.json({ error: 'Registration not open' }, { status: 400 });
  if (now > new Date(tournament.registrationDeadline)) return NextResponse.json({ error: 'Registration deadline passed' }, { status: 400 });
  if (tournament.participants.find((p: any) => p.user.toString() === user.userId)) return NextResponse.json({ error: 'Already registered' }, { status: 400 });
  if (tournament.participants.length >= tournament.maxParticipants) return NextResponse.json({ error: 'Tournament full' }, { status: 400 });
  const userDoc = await User.findById(user.userId).lean();
  (tournament.participants as any[]).push({ user: user.userId, name: (userDoc as any)?.name || 'Player' });
  await tournament.save();
  return NextResponse.json({ success: true, participants: tournament.participants, currentParticipants: tournament.participants.length });
}, ['user']);
