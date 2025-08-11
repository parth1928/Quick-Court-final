import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Match from '@/models/Match';
import Venue from '@/models/Venue';
import User from '@/models/User';

// Simple GET without auth for testing
export async function GET() {
  try {
    await dbConnect();
    
    const matches = await Match.find({})
      .populate('venue', 'name location')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
      
    return NextResponse.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch matches'
    }, { status: 500 });
  }
}

// Simple POST without auth for testing
export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { sport, venueId, date, time, playersNeeded, prizeAmount = 0, description } = body;
    
    // Validate required fields
    if (!sport || !venueId || !date || !time || !playersNeeded) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: sport, venueId, date, time, playersNeeded'
      }, { status: 400 });
    }
    
    // Check if venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return NextResponse.json({
        success: false,
        error: 'Venue not found'
      }, { status: 400 });
    }
    
    // Get or create a test user
    let testUser = await User.findOne({ email: 'testuser@example.com' });
    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'hashedpassword123',
        role: 'user',
        phone: '+1234567890'
      });
      await testUser.save();
    }
    const dummyUserId = testUser._id;
    
    const newMatch = new Match({
      sport,
      venue: venueId,
      date: new Date(date),
      time,
      playersNeeded: parseInt(playersNeeded),
      prizeAmount: parseFloat(prizeAmount) || 0,
      description,
      createdBy: dummyUserId, // Temporary for testing
      participants: [{
        user: dummyUserId,
        joinedAt: new Date()
      }]
    });
    
    const savedMatch = await newMatch.save();
    
    // Populate the saved match
    const populatedMatch = await Match.findById(savedMatch._id)
      .populate('venue', 'name location')
      .populate('createdBy', 'name email');
    
    return NextResponse.json({
      success: true,
      data: populatedMatch
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create match'
    }, { status: 500 });
  }
}
