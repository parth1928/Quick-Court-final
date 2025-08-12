import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Court from '@/models/Court';
import Booking from '@/models/Booking';

// GET /api/courts/[courtId]/available-slots?date=YYYY-MM-DD
export async function GET(
  request: Request,
  { params }: { params: { courtId: string } }
) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Get court details
    const court = await Court.findById(params.courtId);
    if (!court) {
      return NextResponse.json(
        { error: 'Court not found' },
        { status: 404 }
      );
    }

    // Get day of week for availability
    const requestDate = new Date(date);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[requestDate.getDay()];

    // Get operating hours for the day
    let operatingHours = court.availability?.[dayName];
    
    // Check for date-specific overrides
    if (court.availabilityOverrides?.has(date)) {
      operatingHours = court.availabilityOverrides.get(date);
    }

    // Check if court is closed or in blackout dates
    if (!operatingHours?.open || !operatingHours?.close || court.blackoutDates?.includes(date)) {
      return NextResponse.json({
        availableSlots: [],
        operatingHours: null,
        pricePerHour: court.pricing?.hourlyRate || court.pricePerHour || 0
      });
    }

    // Generate time slots
    const slots = [];
    const openTime = parseInt(operatingHours.open.split(':')[0]);
    const closeTime = parseInt(operatingHours.close.split(':')[0]);
    const slotDuration = court.bookingDurationMinutes || 60; // Default 1 hour slots

    for (let hour = openTime; hour < closeTime; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeStr,
          available: true,
          price: court.pricing?.hourlyRate || court.pricePerHour || 0
        });
      }
    }

    // Get existing bookings for the date
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    
    const bookings = await Booking.find({
      court: params.courtId,
      status: { $nin: ['cancelled'] },
      $or: [
        {
          startTime: { $gte: startOfDay, $lt: endOfDay }
        },
        {
          endTime: { $gt: startOfDay, $lte: endOfDay }
        },
        {
          startTime: { $lt: startOfDay },
          endTime: { $gt: endOfDay }
        }
      ]
    });

    // Mark booked slots as unavailable
    for (const booking of bookings) {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      slots.forEach(slot => {
        const slotTime = new Date(`${date}T${slot.time}:00.000Z`);
        const slotEnd = new Date(slotTime.getTime() + slotDuration * 60000);
        
        // Check if slot overlaps with booking
        if (
          (slotTime >= bookingStart && slotTime < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (slotTime <= bookingStart && slotEnd >= bookingEnd)
        ) {
          slot.available = false;
        }
      });
    }

    return NextResponse.json({
      availableSlots: slots.filter(slot => slot.available),
      allSlots: slots,
      operatingHours,
      pricePerHour: court.pricing?.hourlyRate || court.pricePerHour || 0,
      court: {
        id: court._id,
        name: court.name,
        sport: court.sportType || court.sport,
        pricePerHour: court.pricing?.hourlyRate || court.pricePerHour || 0
      }
    });

  } catch (error: any) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
