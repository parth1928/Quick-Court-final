import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Match from '@/models/Match';
import User from '@/models/User';

// GET /api/debug/matches - Debug matches and users
export const GET = withAuth(async (request: Request, user: any) => {
  try {
    console.log('🔍 Debug API called by user:', user.userId, 'role:', user.role);
    
    await dbConnect();
    
    // Get user info
    const userDoc = await User.findById(user.userId).lean();
    
    // Get matches
    const matches = await Match.find({})
      .populate('createdBy', 'name email')
      .lean();
    
    // Get all users
    const allUsers = await User.find({}).select('name email role').lean();
    
    const debugInfo = {
      currentUser: {
        id: user.userId,
        role: user.role,
        dbUser: userDoc ? {
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role
        } : 'Not found in database'
      },
      matches: matches.map(match => ({
        id: match._id.toString(),
        sport: match.sport,
        status: match.status,
        createdBy: match.createdBy?.name || 'Unknown',
        createdById: match.createdBy?._id?.toString(),
        participants: match.participants?.length || 0,
        playersNeeded: match.playersNeeded,
        date: match.date,
        time: match.time
      })),
      allUsers: allUsers.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role
      })),
      stats: {
        totalMatches: matches.length,
        totalUsers: allUsers.length,
        openMatches: matches.filter(m => m.status === 'Open').length
      }
    };
    
    return NextResponse.json(debugInfo);
    
  } catch (error: any) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { 
        error: 'Debug API failed',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}, ['user', 'owner', 'admin']);
