import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Tournament from '@/models/Tournament';
import { withAuth } from '@/lib/auth';

// GET /api/tournaments - list
export const GET = withAuth(async (req: Request) => {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const createdBy = searchParams.get('createdBy');
  const query: any = {};
  if (status) query.status = status;
  if (createdBy) query.createdBy = createdBy;
  const tournaments = await Tournament.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ tournaments });
}, []);

// POST /api/tournaments - create
export const POST = withAuth(async (req: Request, user: any) => {
  if (user.role !== 'owner' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await dbConnect();
  const body = await req.json();
  const required = ['name','sport','startDate','endDate','registrationDeadline','maxParticipants'];
  for (const field of required) {
    if (!body[field]) return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
  }
  const tournament = await Tournament.create({
    name: body.name,
    sport: body.sport,
    category: body.category || '',
    venue: body.venue || '',
    location: body.location || '',
    startDate: body.startDate,
    endDate: body.endDate,
    registrationDeadline: body.registrationDeadline,
    maxParticipants: body.maxParticipants,
    entryFee: body.entryFee || 0,
    prizePool: body.prizePool || 0,
    status: 'draft',
    difficulty: body.difficulty || 'Beginner',
    description: body.description || '',
    organizer: body.organizer || '',
    organizerContact: body.organizerContact || '',
    createdBy: user.userId,
    rules: body.rules || [],
    schedule: body.schedule || [],
    prizes: body.prizes || []
  });
  return NextResponse.json({ tournament });
}, []);
