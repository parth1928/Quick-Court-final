import mongoose from 'mongoose';

// Enhanced Booking Schema for robust production use
const enhancedBookingSchema = new mongoose.Schema({
  // Primary References
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  court: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Court', 
    required: true,
    index: true 
  },
  venue: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Venue',
    index: true 
  },

  // Time Management
  startTime: { 
    type: Date, 
    required: true,
    index: true 
  },
  endTime: { 
    type: Date, 
    required: true,
    index: true 
  },
  duration: { 
    type: Number, // in minutes
    required: true 
  },
  
  // Booking Status & Management
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'], 
    default: 'pending',
    index: true 
  },
  bookingType: {
    type: String,
    enum: ['single', 'recurring'],
    default: 'single'
  },
  
  // Financial Information
  pricing: {
    baseRate: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' }
  },
  
  // Payment Information
  payment: {
    status: { 
      type: String, 
      enum: ['pending', 'paid', 'failed', 'refunded', 'partial'], 
      default: 'pending' 
    },
    method: { 
      type: String, 
      enum: ['card', 'upi', 'netbanking', 'wallet', 'cash'], 
      default: 'card' 
    },
    transactionId: { type: String },
    gatewayResponse: { type: Object },
    paidAt: { type: Date },
    refundAmount: { type: Number, default: 0 },
    refundedAt: { type: Date }
  },

  // User Experience Fields
  checkIn: {
    status: { type: Boolean, default: false },
    time: { type: Date },
    method: { type: String, enum: ['qr', 'manual', 'auto'] }
  },
  checkOut: {
    status: { type: Boolean, default: false },
    time: { type: Date }
  },
  
  // Review & Rating
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
    reviewedAt: { type: Date }
  },
  
  // Cancellation Management
  cancellation: {
    reason: { type: String },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: { type: Date },
    refundEligible: { type: Boolean, default: false },
    cancellationFee: { type: Number, default: 0 }
  },
  
  // Additional Information
  notes: { type: String, maxlength: 1000 },
  specialRequests: [{ type: String }],
  participants: [{
    name: { type: String },
    phone: { type: String },
    email: { type: String }
  }],
  
  // Metadata
  source: { 
    type: String, 
    enum: ['web', 'mobile', 'admin', 'walk-in'], 
    default: 'web' 
  },
  ipAddress: { type: String },
  userAgent: { type: String },
  
  // Audit Fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound Indexes for Performance
enhancedBookingSchema.index({ court: 1, startTime: 1, endTime: 1 });
enhancedBookingSchema.index({ user: 1, status: 1, startTime: -1 });
enhancedBookingSchema.index({ venue: 1, startTime: -1 });
enhancedBookingSchema.index({ status: 1, startTime: 1 });
enhancedBookingSchema.index({ 'payment.status': 1, createdAt: -1 });

// Virtual Fields
enhancedBookingSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

enhancedBookingSchema.virtual('isUpcoming').get(function() {
  return this.startTime > new Date() && this.status === 'confirmed';
});

enhancedBookingSchema.virtual('canCancel').get(function() {
  const now = new Date();
  const hoursUntilBooking = (this.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  return this.status === 'confirmed' && hoursUntilBooking > 2; // 2 hour cancellation policy
});

// Pre-save Middleware
enhancedBookingSchema.pre('save', async function(next) {
  // Auto-populate venue from court
  if (!this.venue && this.court) {
    try {
      const Court = mongoose.model('Court');
      const courtDoc: any = await Court.findById(this.court).select('venue');
      if (courtDoc?.venue) {
        this.venue = courtDoc.venue;
      }
    } catch (e) {
      console.warn('Failed to populate venue from court:', e);
    }
  }

  // Calculate duration if not provided
  if (!this.duration && this.startTime && this.endTime) {
    this.duration = (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60);
  }

  // Validate booking time
  if (this.startTime >= this.endTime) {
    return next(new Error('Start time must be before end time'));
  }

  // Check for overlapping bookings
  if (this.isModified('startTime') || this.isModified('endTime') || this.isModified('court')) {
    const overlappingBooking = await mongoose.model('BookingEnhanced').findOne({
      court: this.court,
      _id: { $ne: this._id },
      status: { $nin: ['cancelled', 'no-show'] },
      $or: [
        {
          startTime: { $lt: this.endTime },
          endTime: { $gt: this.startTime }
        }
      ]
    });

    if (overlappingBooking) {
      return next(new Error('This time slot is already booked'));
    }
  }

  // Update timestamp
  this.updatedAt = new Date();
  next();
});

// Post-save Middleware - Update User booking count
enhancedBookingSchema.post('save', async function(doc: any) {
  try {
    if (doc.status === 'confirmed') {
      await mongoose.model('User').updateOne(
        { _id: doc.user }, 
        { $inc: { bookingCount: 1 } }
      );
    }
  } catch (e) {
    console.error('Error updating user booking count:', e);
  }
});

// Instance Methods
enhancedBookingSchema.methods.cancel = async function(reason: string, cancelledBy: any) {
  this.status = 'cancelled';
  this.cancellation = {
    reason,
    cancelledBy,
    cancelledAt: new Date(),
    refundEligible: this.canCancel,
    cancellationFee: this.canCancel ? 0 : this.pricing.totalAmount * 0.1 // 10% fee for late cancellation
  };
  
  return this.save();
};

enhancedBookingSchema.methods.complete = async function() {
  this.status = 'completed';
  return this.save();
};

enhancedBookingSchema.methods.addReview = async function(rating: number, comment?: string) {
  this.review = {
    rating,
    comment,
    reviewedAt: new Date()
  };
  return this.save();
};

export default mongoose.models.BookingEnhanced || mongoose.model('BookingEnhanced', enhancedBookingSchema);
