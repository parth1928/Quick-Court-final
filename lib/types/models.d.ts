import { Model } from 'mongoose';

export interface ITimeSlot {
  _id: string;
  court: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'blocked' | 'maintenance';
  price: number;
  booking?: string;
  blockReason?: string;
  label?: string;
  maxBookings?: number;
  currentBookings: number;
  courtId?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlotModel extends Model<ITimeSlot> {
  generateSlots(
    courtId: string,
    court: any,
    startDate: string,
    endDate: string,
    clearExisting?: boolean
  ): Promise<ITimeSlot[]>;
  
  findConflicts(
    courtId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<ITimeSlot[]>;
  
  isAvailable(
    courtId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean>;
  
  deleteOldSlots(daysToKeep?: number): Promise<{ deletedCount: number }>;
}
