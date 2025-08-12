import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';

// Booking confirmation endpoint
export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();
    
    const data = await request.json();
    
    console.log('📋 Booking confirmation request:', {
      user: user.userId,
      transactionId: data.transactionId,
      type: data.type
    });
    
    // Create booking confirmation record with enhanced details
    const confirmation = {
      userId: user.userId,
      transactionId: data.transactionId || `TXN_${Date.now()}`,
      bookingId: data.bookingId || `BK_${Date.now()}`,
      type: data.type || 'venue', // 'venue' or 'tournament'
      details: data.details,
      amount: data.amount,
      status: 'confirmed',
      confirmationCode: `QC${Date.now()}`,
      // Enhanced booking details
      venueName: data.venueName,
      courtName: data.courtName,
      sport: data.sport,
      date: data.date,
      time: data.time,
      duration: data.duration,
      notes: data.notes,
      paymentMethod: data.paymentMethod || 'Online Payment',
      confirmedAt: new Date(),
      createdAt: new Date()
    };
    
    // In a real app, you'd save this to a confirmations collection
    // For now, we'll just return success with enhanced response
    console.log('✅ Confirmation record created:', confirmation.confirmationCode);
    
    return NextResponse.json({
      success: true,
      data: {
        confirmationId: `CONF_${Date.now()}`,
        confirmationCode: confirmation.confirmationCode,
        status: 'confirmed',
        confirmedAt: confirmation.confirmedAt,
        message: 'Booking confirmation recorded successfully',
        receipt: {
          bookingId: confirmation.bookingId,
          transactionId: confirmation.transactionId,
          amount: confirmation.amount,
          venue: confirmation.venueName,
          court: confirmation.courtName,
          date: confirmation.date,
          time: confirmation.time
        }
      }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('💥 Error recording booking confirmation:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to record confirmation'
    }, { status: 500 });
  }
}, []);

// Get booking confirmations
export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('🔍 Getting booking confirmations for user:', user.userId);
    
    // In a real app, you'd fetch from confirmations collection
    // For now, return mock data
    const mockConfirmations = [
      {
        confirmationId: `CONF_${Date.now()}`,
        confirmationCode: `QC${Date.now()}`,
        bookingId: bookingId || `BK_${Date.now()}`,
        userId: user.userId,
        status: 'confirmed',
        amount: 1500,
        venueName: 'Elite Sports Complex',
        courtName: 'Basketball Court A',
        date: new Date().toLocaleDateString(),
        time: '10:00 AM - 11:00 AM',
        confirmedAt: new Date(),
        createdAt: new Date()
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: {
        confirmations: mockConfirmations,
        count: mockConfirmations.length
      }
    });
    
  } catch (error: any) {
    console.error('💥 Error fetching confirmations:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch confirmations'
    }, { status: 500 });
  }
}, []);
