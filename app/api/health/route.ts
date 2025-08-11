import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connected successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
