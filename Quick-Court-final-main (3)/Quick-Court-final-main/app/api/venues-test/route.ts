import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Venue from '@/models/Venue';

export async function GET() {
  try {
    await dbConnect();
    
    const venues = await Venue.find({})
      .select('_id name location sports')
      .limit(10);
      
    return NextResponse.json({
      success: true,
      count: venues.length,
      data: venues
    });
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch venues'
    }, { status: 500 });
  }
}
