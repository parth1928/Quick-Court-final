import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Match from '@/models/Match';

// DELETE /api/matches/clear - Delete all matches (admin only)
export const DELETE = withAuth(async (request: Request, user: any) => {
  try {
    // Only allow admins or owners to clear all matches
    if (user.role !== 'admin' && user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only admins can delete all matches' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    // Count matches before deletion
    const currentCount = await Match.countDocuments();
    console.log(`🔍 Found ${currentCount} matches to delete`);
    
    if (currentCount === 0) {
      return NextResponse.json({
        message: 'No matches to delete',
        deletedCount: 0
      });
    }
    
    // Delete all matches
    const result = await Match.deleteMany({});
    
    console.log(`✅ Deleted ${result.deletedCount} matches`);
    
    return NextResponse.json({
      message: `Successfully deleted ${result.deletedCount} matches`,
      deletedCount: result.deletedCount
    });
    
  } catch (error: any) {
    console.error('Error deleting all matches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['admin', 'owner']);
