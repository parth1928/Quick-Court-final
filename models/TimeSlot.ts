import mongoose, { Schema } from 'mongoose';
import { ITimeSlot, TimeSlotModel } from '@/lib/types/models';

const slotSchema = new Schema<ITimeSlot, TimeSlotModel>({
  court: { type: String, ref: 'Court', required: true, index: true },
  date: { type: String, required: true }, // YYYY-MM-DD format
  startTime: { type: String, required: true }, // HH:mm format (24h)
  endTime: { type: String, required: true }, // HH:mm format (24h)
  status: { 
    type: String, 
    enum: ['available', 'booked', 'blocked', 'maintenance'],
    default: 'available',
    index: true 
  },
  price: { type: Number, required: true }, // Allow dynamic pricing per slot
  booking: { type: String, ref: 'Booking' }, // If booked
  blockReason: { type: String }, // For blocked/maintenance slots
  label: { type: String }, // Peak / Off-Peak etc.
  maxBookings: { type: Number }, // For group courts (e.g., multiple badminton courts in same hour)
  currentBookings: { type: Number, default: 0 }, // Track current bookings for group slots
  courtId: { type: String, ref: 'Court' }, // alias
  createdBy: { type: String, ref: 'User' },
  updatedBy: { type: String, ref: 'User' },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound indices for fast lookups
slotSchema.index({ court: 1, date: 1, startTime: 1, status: 1 });

// Only one slot can exist for a court at a given time
slotSchema.index(
  { court: 1, date: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

// Update timestamps and aliases
slotSchema.pre('save', function(this: ITimeSlot & { _id: string }, next) {
  if (!this.courtId && this.court) this.courtId = this.court;
  this.updatedAt = new Date();
  next();
});

// Helper method to find conflicting slots
slotSchema.statics.findConflicts = async function(
  courtId: string,
  date: string,
  startTime: string,
  endTime: string
) {
  return this.find({
    court: courtId,
    date: date,
    status: { $ne: 'maintenance' },
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
    ]
  });
};

// Helper method to check slot availability
slotSchema.statics.isAvailable = async function(
  courtId: string,
  date: string,
  startTime: string,
  endTime: string
) {
  const slots = await this.find({
    court: courtId,
    date: date,
    startTime: startTime,
    endTime: endTime,
    $or: [
      { status: 'available' },
      { 
        status: 'booked',
        maxBookings: { $exists: true },
        currentBookings: { $lt: '$maxBookings' }
      }
    ]
  });

  return slots.length > 0;
};

// Helper to generate slots for a date range
slotSchema.statics.generateSlots = async function(
  courtId: string,
  court: any,
  startDate: string,
  endDate: string,
  clearExisting = false
) {
  // Clear existing slots in range if requested
  if (clearExisting) {
    await this.deleteMany({
      court: courtId,
      date: { $gte: startDate, $lte: endDate },
      status: 'available' // Don't delete booked slots
    });
  }

  const slots = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  // Get day name in lowercase
  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  };

  // Generate all slots between start and end date
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayName = getDayName(currentDate);
    
    // Get operating hours for this day
    const dayHours = court.availability?.[dayName] || 
                    court.operatingHours || 
                    { start: '09:00', end: '21:00' };
    
    // Skip if the court is closed this day
    if (!dayHours.start || !dayHours.end) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Check for date override
    const override = court.availabilityOverrides?.get(dateStr);
    const hours = override || dayHours;

    // Generate slots based on booking duration (default 60 minutes)
    const duration = court.bookingDurationMinutes || 60;
    let slotStart = new Date(`${dateStr}T${hours.start}`);
    const dayEnd = new Date(`${dateStr}T${hours.end}`);

    while (slotStart < dayEnd) {
      const endTime = new Date(slotStart.getTime() + duration * 60000);
      if (endTime > dayEnd) break;

      const slot = {
        court: courtId,
        date: dateStr,
        startTime: slotStart.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
        price: court.pricing.hourlyRate,
        status: 'available',
        maxBookings: court.maxConcurrentBookings,
        createdBy: court.createdBy
      };

      // Skip if slot already exists
      const exists = await this.findOne({
        court: courtId,
        date: dateStr,
        startTime: slot.startTime,
        endTime: slot.endTime
      });

      if (!exists && !court.blackoutDates?.includes(dateStr)) {
        slots.push(slot);
      }

      slotStart = endTime;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (slots.length > 0) {
    await this.insertMany(slots);
  }

  return slots;
};

// Delete old slots helper (useful for cleanup)
slotSchema.statics.deleteOldSlots = async function(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const dateStr = cutoffDate.toISOString().split('T')[0];
  
  return this.deleteMany({
    date: { $lt: dateStr },
    status: 'available' // Only delete unbooked slots
  });
};

export default mongoose.models.TimeSlot || mongoose.model('TimeSlot', slotSchema);
