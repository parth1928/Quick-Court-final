import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Tournament from '@/models/Tournament';

// Simple test endpoint without authentication
export async function GET() {
  try {
    await dbConnect();
    console.log('Database connected successfully');
    
    const count = await Tournament.countDocuments();
    console.log(`Tournament count: ${count}`);
    
    const tournaments = await Tournament.find({}).limit(5).lean();
    console.log(`Sample tournaments:`, tournaments.map(t => ({ name: t.name, status: t.status })));
    
    return NextResponse.json({ 
      success: true,
      count,
      tournaments: tournaments.slice(0, 3), // Return first 3 for testing
      message: 'Tournaments API test successful'
    });
  } catch (error: any) {
    console.error('Error in tournament test:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
