import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // existing naming
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // spec naming (mirror)
  shortLocation: { type: String }, // concise location string for cards
  fullAddress: { type: String },
  contactNumber: { type: String },
  mapLink: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  description: { type: String, required: true },
  sports: [{ type: String }], // array of sport names per spec
  amenities: [{ type: String }],
  images: [{ type: String }], // existing field
  photos: [{ type: String }], // spec field alias
  startingPrice: { type: Number, default: 0 }, // price of cheapest court
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // existing
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // spec alias (no inline index to avoid duplicate)
  contactPhone: { type: String },
  contactEmail: { type: String, lowercase: true, match: /.+@.+\..+/ },
  slug: { type: String, unique: true, sparse: true, index: true },
  isActive: { type: Boolean, default: true, index: true },
  deletedAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  defaultAvailableSlots: [{ type: String }],
  embeddedReviews: [{
    userName: String,
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, default: 0 },
  // Owner finance / operations fields
  gstNumber: { type: String },
  taxRate: { type: Number, default: 0 }, // percent
  platformFeePercent: { type: Number, default: 10 },
  payoutBank: {
    accountHolder: String,
    accountNumberMasked: String,
    ifsc: String,
    upi: String,
  },
  cancellationPolicy: {
    freeCancelHours: { type: Number, default: 24 },
    penaltyPercent: { type: Number, default: 50 },
  },
  internalNotes: { type: String },
  lastOwnerReviewAt: { type: Date },
  totalBookings: { type: Number, default: 0, index: true },
  totalRevenue: { type: Number, default: 0 },
  monthlyRevenue: { type: Number, default: 0 },
  monthlyBookingCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for common card listings / filters (single explicit status index)
venueSchema.index({ status: 1 });
venueSchema.index({ sports: 1 });
venueSchema.index({ startingPrice: 1 });
venueSchema.index({ rating: -1 });

// Virtuals to align with card field names (avoid conflict with real geo field 'location')
venueSchema.virtual('computedLocation').get(function(this: any) {
  if (this.shortLocation) return this.shortLocation;
  if (this.address) {
    const parts = [this.address.city, this.address.state].filter(Boolean);
    if (parts.length) return parts.join(', ');
  }
  return '';
});

venueSchema.virtual('price').get(function(this: any) {
  return this.startingPrice || 0;
});

venueSchema.virtual('image').get(function(this: any) {
  return (this.images && this.images[0]) || (this.photos && this.photos[0]) || '/placeholder.jpg';
});

venueSchema.virtual('reviews').get(function(this: any) {
  return this.reviewCount || 0;
});

// Create a 2dsphere index for location-based queries
venueSchema.index({ location: '2dsphere' });

// Update the updatedAt timestamp
venueSchema.pre('save', function(next) {
  if (!this.ownerId && this.owner) this.ownerId = this.owner; // keep mirror in sync
  this.updatedAt = new Date();
  // generate slug if missing or name changed
  if (this.isModified('name')) {
    const base = this.name?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (base) this.slug = base;
  }
  next();
});

export default mongoose.models.Venue || mongoose.model('Venue', venueSchema);
