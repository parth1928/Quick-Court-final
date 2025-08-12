import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  court: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
  courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court' }, // spec alias
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // spec alias
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' }, // denormalized for owner queries
  startTime: { type: Date, required: true }, // existing naming
  endTime: { type: Date, required: true },
  startTs: { type: Date }, // spec naming
  endTs: { type: Date },
  status: { type: String, enum: ['confirmed', 'cancelled', 'completed', 'pending'], default: 'confirmed', index: true },
  totalPrice: { type: Number, required: true },
  pricingBreakdown: {
    baseRate: { type: Number },
    tax: { type: Number },
    discount: { type: Number },
    currency: { type: String, default: 'INR' }
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentId: { type: String },
  ownerEarning: { type: Number },
  platformFee: { type: Number },
  cancellationReason: { type: String },
  cancelledAt: { type: Date },
  refundAmount: { type: Number },
  checkInAt: { type: Date },
  checkOutAt: { type: Date },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Prevent overlapping bookings for the same court
bookingSchema.index({ court: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ court: 1, startTs: 1, endTs: 1 });

bookingSchema.pre('save', async function(next) {
  // sync alias fields
  if (!this.courtId && this.court) this.courtId = this.court;
  if (!this.userId && this.user) this.userId = this.user;
  if (!this.venue && this.court) {
    try {
      const Court = mongoose.model('Court');
      const courtDoc: any = await Court.findById(this.court).select('venue');
      if (courtDoc?.venue) this.venue = courtDoc.venue;
    } catch (e) { /* ignore */ }
  }
  if (this.startTs && !this.startTime) this.startTime = this.startTs;
  if (this.endTs && !this.endTime) this.endTime = this.endTs;
  if (this.startTime && !this.startTs) this.startTs = this.startTime;
  if (this.endTime && !this.endTs) this.endTs = this.endTime;

  // Skip overlap validation for fallback courts completely
  const fallbackCourtIds = ["507f1f77bcf86cd799439021", "507f1f77bcf86cd799439022", "507f1f77bcf86cd799439023"];
  const isFallbackCourt = fallbackCourtIds.includes(this.court?.toString());
  
  if (!isFallbackCourt && (this.isModified('startTime') || this.isModified('endTime') || this.isModified('startTs') || this.isModified('endTs'))) {
    const overlappingBooking = await mongoose.model('Booking').findOne({
      court: this.court,
      _id: { $ne: this._id },
      status: { $nin: ['cancelled'] },
      $or: [
        { startTime: { $lt: this.endTime }, endTime: { $gt: this.startTime } },
        { startTs: { $lt: this.endTs }, endTs: { $gt: this.startTs } },
      ],
    });
    if (overlappingBooking) return next(new Error('This time slot is already booked'));
  }
  next();
});

// Update the updatedAt timestamp
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Maintain user's bookingCount
bookingSchema.post('save', async function(doc: any) {
  try {
    if (doc.status === 'confirmed') {
      await mongoose.model('User').updateOne({ _id: doc.user }, { $inc: { bookingCount: 1 } });
    }
  } catch (e) {
    console.error('Error incrementing bookingCount', e);
  }
});

// If a confirmed booking is cancelled later
bookingSchema.post('findOneAndUpdate', async function(result: any) {
  try {
    const update: any = this.getUpdate();
    if (!result) return;
    const prevStatus = result.status;
    const newStatus = update.status || update.$set?.status;
    if (prevStatus === 'confirmed' && newStatus === 'cancelled') {
      await mongoose.model('User').updateOne({ _id: result.user }, { $inc: { bookingCount: -1 } });
    }
  } catch (e) {
    console.error('Error adjusting bookingCount on cancellation', e);
  }
});

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
