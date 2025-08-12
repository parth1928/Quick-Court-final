import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Tournament from '@/models/Tournament';
import { withAuth } from '@/lib/auth';

// GET /api/tournaments - list (public access for browsing)
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const createdBy = searchParams.get('createdBy');
    
    console.log('API Request params:', { status, createdBy });
    
    const query: any = {};
    
    // Handle status filtering
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Handle createdBy filtering with ObjectId validation
    if (createdBy) {
      // Check if createdBy is a valid ObjectId format
      if (/^[0-9a-fA-F]{24}$/.test(createdBy)) {
        query.createdBy = createdBy;
      } else {
        console.log('Invalid ObjectId format for createdBy:', createdBy);
        return NextResponse.json({ 
          tournaments: [],
          total: 0,
          message: 'Invalid user ID format'
        });
      }
    }
    
    // Show tournaments that are available for registration or ongoing
    if (!status && !createdBy) {
      query.status = { $in: ['draft', 'open', 'approved', 'ongoing'] };
    }
    
    console.log('Fetching tournaments with query:', query);
    
    const tournaments = await Tournament.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${tournaments.length} tournaments`);
    
    return NextResponse.json({ 
      tournaments,
      total: tournaments.length 
    });
  } catch (error: any) {
    console.error('Error in GET /api/tournaments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournaments', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

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
    status: 'open', // Make tournaments visible to users immediately
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
