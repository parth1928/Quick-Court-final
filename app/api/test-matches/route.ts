import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Match from '@/models/Match';

// Simple test endpoint to verify database connection works
export async function GET() {
  try {
    console.log('🧪 Test matches endpoint called');
    
    await dbConnect();
    console.log('✅ Database connected');
    
    const matches = await Match.find({})
      .limit(5)
      .sort({ createdAt: -1 })
      .lean();
    
    console.log('✅ Found matches:', matches.length);
    
    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      matchCount: matches.length,
      matches: matches.map(m => ({
        id: m._id,
        sport: m.sport,
        status: m.status,
        date: m.date
      }))
    });
  } catch (error: any) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Test endpoint failed'
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    message: 'POST method available on test endpoint'
  });
}
