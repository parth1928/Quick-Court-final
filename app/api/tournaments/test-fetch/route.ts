import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Tournament from '@/models/Tournament';
import { validateToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    // Check authentication
    const user = await validateToken(req);
    console.log('User from token:', user);
    
    // Get all tournaments without any filter
    const allTournaments = await Tournament.find({})
      .populate('createdBy', 'name email')
      .lean();
    
    console.log(`Total tournaments in database: ${allTournaments.length}`);
    
    // Get tournaments with the user's ID (if authenticated)
    let userTournaments = [];
    if (user) {
      userTournaments = await Tournament.find({ createdBy: user.userId })
        .populate('createdBy', 'name email')
        .lean();
      console.log(`Tournaments for user ${user.userId}: ${userTournaments.length}`);
    }
    
    return NextResponse.json({ 
      authenticated: !!user,
      user: user,
      totalTournaments: allTournaments.length,
      userTournaments: userTournaments.length,
      allTournaments: allTournaments.map(t => ({
        id: t._id,
        name: t.name,
        createdBy: t.createdBy,
        status: t.status
      })),
      userTournamentsData: userTournaments.map(t => ({
        id: t._id,
        name: t.name,
        createdBy: t.createdBy,
        status: t.status
      }))
    });
  } catch (error: any) {
    console.error('Error in test fetch:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}
