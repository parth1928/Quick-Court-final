import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import TimeSlot from '@/models/TimeSlot';
import Court from '@/models/Court';
import Venue from '@/models/Venue';

// GET /api/courts/[courtId]/slots - Get time slots for a court
export const GET = withAuth(async (req: NextRequest, { userId, role }) => {
  try {
    await connectDB();
    
    const courtId = req.url.split('/courts/')[1].split('/slots')[0];
    const searchParams = req.nextUrl.searchParams;
    
    // Get query parameters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    // Validate parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Ensure court exists and user has access
    const court = await Court.findById(courtId).populate('venue', ['owner', 'name']);
    if (!court) {
      return NextResponse.json(
        { error: 'Court not found' },
        { status: 404 }
      );
    }

    // Type check for populated venue
    if (!court.venue || typeof court.venue !== 'object') {
      return NextResponse.json(
        { error: 'Invalid court data: venue not found' },
        { status: 500 }
      );
    }

    // Check permissions
    if (role !== 'admin' && (court.venue as any).owner.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to access this court\'s slots' },
        { status: 403 }
      );
    }

    // Build query
    const query: any = {
      court: courtId,
      date: { $gte: startDate, $lte: endDate }
    };

    if (status && ['available', 'booked', 'blocked', 'maintenance'].includes(status)) {
      query.status = status;
    }

    // Get slots
    const slots = await TimeSlot.find(query)
      .sort({ date: 1, startTime: 1 })
      .populate('booking', 'user status');

    return NextResponse.json({ slots });

  } catch (error: any) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time slots' },
      { status: 500 }
    );
  }
});

// POST /api/courts/[courtId]/slots - Generate time slots for a court
export const POST = withAuth(async (req: NextRequest, { userId, role }) => {
  try {
    await connectDB();
    
    const courtId = req.url.split('/courts/')[1].split('/slots')[0];
    const data = await req.json();
    const { startDate, endDate, clearExisting } = data;

    // Validate input
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Check court exists and user has permission
    const court = await Court.findById(courtId).populate('venue', 'owner');
    if (!court) {
      return NextResponse.json(
        { error: 'Court not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (role !== 'admin' && court.venue?.owner?.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to manage this court\'s slots' },
        { status: 403 }
      );
    }

    // Clear existing slots if requested
    if (clearExisting) {
      await TimeSlot.deleteMany({
        court: courtId,
        date: { $gte: startDate, $lte: endDate },
        status: { $ne: 'booked' }
      });
    }

    // Generate slots
    const slots = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      // Generate hourly slots from 6 AM to 10 PM
      for (let hour = 6; hour < 22; hour++) {
        const slotData = {
          court: courtId,
          date: date.toISOString().split('T')[0],
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          status: 'available',
          price: court.pricePerHour || 100
        };
        
        const existingSlot = await TimeSlot.findOne({
          court: courtId,
          date: slotData.date,
          startTime: slotData.startTime
        });
        
        if (!existingSlot) {
          const slot = await TimeSlot.create(slotData);
          slots.push(slot);
        }
      }
    }

    return NextResponse.json({ 
      message: `Generated ${slots.length} slots`,
      slots
    });

  } catch (error: any) {
    console.error('Error generating time slots:', error);
    return NextResponse.json(
      { error: 'Failed to generate time slots' },
      { status: 500 }
    );
  }
});

// PATCH /api/courts/[courtId]/slots - Update time slot status
export const PATCH = withAuth(async (req: NextRequest, { userId, role }) => {
  try {
    await connectDB();
    
    const courtId = req.url.split('/courts/')[1].split('/slots')[0];
    const data = await req.json();
    const { slotIds, status, reason } = data;

    // Validate input
    if (!slotIds || !Array.isArray(slotIds) || !status) {
      return NextResponse.json(
        { error: 'slotIds array and status are required' },
        { status: 400 }
      );
    }

    // Check court exists and user has permission
    const court = await Court.findById(courtId).populate('venue', 'owner');
    if (!court) {
      return NextResponse.json(
        { error: 'Court not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (role !== 'admin' && (court.venue as any).owner.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this court\'s slots' },
        { status: 403 }
      );
    }

    // Update slots
    const updateData: any = {
      status,
      updatedBy: userId
    };

    if (reason) {
      updateData.blockReason = reason;
    }

    const result = await TimeSlot.updateMany(
      {
        _id: { $in: slotIds },
        court: courtId,
        // Don't allow updating booked slots
        status: { $ne: 'booked' }
      },
      { $set: updateData }
    );

    // If setting to maintenance, update court status
    if (status === 'maintenance') {
      await Court.findByIdAndUpdate(courtId, {
        status: 'maintenance',
        maintenanceNotes: reason,
        updatedBy: userId
      });
    }

    return NextResponse.json({
      message: `Updated ${result.modifiedCount} slots`,
      modifiedCount: result.modifiedCount
    });

  } catch (error: any) {
    console.error('Error updating time slots:', error);
    return NextResponse.json(
      { error: 'Failed to update time slots' },
      { status: 500 }
    );
  }
});
