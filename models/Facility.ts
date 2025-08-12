import mongoose, { Schema } from 'mongoose';

const FacilitySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  sports: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'Active', 'Inactive', 'Maintenance'],
    default: 'pending'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  description: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  monthlyRevenue: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: '/placeholder.svg'
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String
  },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  amenities: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps on save
FacilitySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for full address
FacilitySchema.virtual('fullAddress').get(function() {
  const { street = '', city = '', state = '', postalCode = '' } = this.address || {};
  const parts = [street, city, state, postalCode].filter(Boolean);
  return parts.join(', ').trim();
});

// Ensure virtuals are included in JSON
FacilitySchema.set('toJSON', { virtuals: true });
FacilitySchema.set('toObject', { virtuals: true });

export default mongoose.models.Facility || mongoose.model('Facility', FacilitySchema);
