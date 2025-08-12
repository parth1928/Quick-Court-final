import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthContext } from '@/lib/auth';
import dbConnect from '@/lib/db/connect';
import Court from '@/models/Court';
import Venue from '@/models/Venue';

interface TimeSlotUpdates {
  operatingHours?: {
    [key: string]: { open: string; close: string };
  };
  blackoutDates?: string[];
  availabilityOverrides?: Map<string, { open: string; close: string }>;
  status?: 'active' | 'maintenance' | 'inactive';
  maintenanceNotes?: string;
}

export const POST = withAuth(async (req: NextRequest, user: AuthContext) => {
  const { userId, role } = user;
  try {
    if (role !== 'owner' && role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const courtId = searchParams.get('courtId');
    if (!courtId) {
      return NextResponse.json(
        { error: 'Court ID is required' },
        { status: 400 }
      );
    }

    const data = await req.json();
    const slots = data as TimeSlotUpdates;

    // Check if court exists and user owns it
    const court = await Court.findById(courtId).populate('venue');
    if (!court) {
      return NextResponse.json(
        { error: 'Court not found' },
        { status: 404 }
      );
    }

    // Check if user owns the venue
    const venue = await Venue.findById(court.venue);
    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    if (role !== 'admin' && venue.owner.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to manage this court' },
        { status: 403 }
      );
    }

    // Update or create availability slots
    const updates: any = {};

    // Handle operating hours updates
    if (slots.operatingHours) {
      updates.operatingHours = slots.operatingHours;
    }

    // Handle blackout dates
    if (slots.blackoutDates) {
      updates.blackoutDates = slots.blackoutDates;
    }

    // Handle availability overrides
    if (slots.availabilityOverrides) {
      updates.availabilityOverrides = slots.availabilityOverrides;
    }

    // Handle status changes
    if (slots.status) {
      updates.status = slots.status;
      if (slots.status === 'maintenance' && slots.maintenanceNotes) {
        updates.maintenanceNotes = slots.maintenanceNotes;
      }
    }

    // Update the court
    const updatedCourt = await Court.findByIdAndUpdate(
      courtId,
      {
        $set: {
          ...updates,
          updatedBy: userId,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).populate('venue', 'name location');

    return NextResponse.json(updatedCourt);
  } catch (error: any) {
    console.error('Time slot management error:', error);
    return NextResponse.json(
      { error: 'Failed to update time slots' },
      { status: 500 }
    );
  }
});

interface CourtAvailability {
  date: string;
  isAvailable: boolean;
  reason?: string;
  operatingHours?: {
    open: string;
    close: string;
  };
}

export const GET = withAuth(async (req: NextRequest, user: AuthContext) => {
  try {
    const { userId, role } = user;
    await dbConnect();
    const searchParams = req.nextUrl.searchParams;
    const courtId = searchParams.get('courtId');

    if (!courtId) {
      return NextResponse.json(
        { error: 'Court ID is required' },
        { status: 400 }
      );
    }

    // Get court with availability info
    const court = await Court.findById(courtId)
      .select('availability blackoutDates availabilityOverrides operatingHours status maintenanceNotes')
      .populate('venue', 'name location owner');

    if (!court) {
      return NextResponse.json(
        { error: 'Court not found' },
        { status: 404 }
      );
    }

    // Check permissions for non-admin users
    if (role !== 'admin') {
      const venue = court.venue as any;
      if (role === 'owner' && venue.owner.toString() !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized to view this court' },
          { status: 403 }
        );
      }
    }

    // Calculate availability for the next 30 days
    const today = new Date();
    const next30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() + i);
      return date.toISOString().split('T')[0];
    });

    const availability = next30Days.map(date => {
      // Check if date is in blackoutDates
      if (court.blackoutDates?.includes(date)) {
        return { date, isAvailable: false, reason: 'Blackout Date' };
      }

      // Check if there's an override for this date
      const override = court.availabilityOverrides?.get(date);
      if (override) {
        return {
          date,
          isAvailable: true,
          operatingHours: override
        };
      }

      // Get day of week
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const regularHours = (court.availability as { [key: string]: { open: string; close: string } })[dayOfWeek];
      
      return {
        date,
        isAvailable: true,
        operatingHours: regularHours
      };
    });

    return NextResponse.json({
      courtId: court._id,
      venueName: (court.venue as any).name,
      status: court.status,
      maintenanceNotes: court.maintenanceNotes,
      availability,
      regularHours: court.availability,
      blackoutDates: court.blackoutDates,
      overrides: Object.fromEntries(court.availabilityOverrides || new Map())
    });
  } catch (error: any) {
    console.error('Time slot fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time slots' },
      { status: 500 }
    );
  }
});
