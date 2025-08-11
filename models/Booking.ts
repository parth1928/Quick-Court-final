import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  paymentId: {
    type: String,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent overlapping bookings for the same court
bookingSchema.index({ court: 1, startTime: 1, endTime: 1 });

bookingSchema.pre('save', async function(next) {
  if (this.isModified('startTime') || this.isModified('endTime')) {
    const overlappingBooking = await mongoose.model('Booking').findOne({
      court: this.court,
      _id: { $ne: this._id },
      status: { $nin: ['cancelled'] },
      $or: [
        {
          startTime: { $lt: this.endTime },
          endTime: { $gt: this.startTime },
        },
      ],
    });

    if (overlappingBooking) {
      next(new Error('This time slot is already booked'));
    }
  }
  next();
});

// Update the updatedAt timestamp
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
