import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';

// GET /api/bookings/[id] - Get a specific booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    console.log('🔍 GET /api/bookings/[id] called with ID:', id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    // Find the booking and populate related data
    const booking = await Booking.findById(id)
      .populate('user', 'name email phone')
      .populate('venue', 'name location address contactPhone')
      .populate('court', 'name sportType surfaceType pricing')
      .lean();
    
    if (!booking) {
      console.log('❌ Booking not found for ID:', id);
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Booking found:', booking._id);
    
    return NextResponse.json({
      success: true,
      booking
    });
    
  } catch (error: any) {
    console.error('❌ GET /api/bookings/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}
