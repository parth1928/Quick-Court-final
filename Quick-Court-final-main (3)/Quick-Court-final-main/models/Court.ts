import mongoose from 'mongoose';

const courtSchema = new mongoose.Schema({
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' }, // spec alias
  name: { type: String, required: true },
  sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport' }, // Make optional - not required
  sportType: { type: String, required: true }, // Make this required instead - direct sport name
  description: { type: String },
  surfaceType: { type: String, required: true },
  indoor: { type: Boolean, default: false },
  capacity: { type: Number, default: 2 },
  pricing: {
    hourlyRate: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
  },
  pricePerHour: { type: Number }, // spec alias (kept in sync in pre-save)
  operatingHours: { start: String, end: String }, // spec simplified hours
  images: [{ type: String }],
  availability: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  // Optional per-date overrides: { '2025-08-15': { open: '08:00', close: '18:00' } }
  availabilityOverrides: { type: Map, of: { open: String, close: String } },
  blackoutDates: [{ type: String }], // e.g., '2025-08-16'
  slug: { type: String, unique: true, sparse: true, index: true },
  isActive: { type: Boolean, default: true, index: true },
  deletedAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' },
  maintenanceNotes: { type: String },
  bookingDurationMinutes: { type: Number, default: 60 },
  allowDynamicPricing: { type: Boolean, default: false },
  equipmentIncluded: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt timestamp
courtSchema.pre('save', function(next) {
  if (!this.venueId && this.venue) this.venueId = this.venue; // mirror
  if (!this.pricePerHour && this.pricing?.hourlyRate) this.pricePerHour = this.pricing.hourlyRate;
  if (!this.pricing?.hourlyRate && this.pricePerHour) {
    if (!this.pricing) (this as any).pricing = { hourlyRate: this.pricePerHour };
    else (this as any).pricing.hourlyRate = this.pricePerHour;
  }
  if (this.isModified('name')) {
    const base = this.name?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (base) this.slug = base;
  }
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Court || mongoose.model('Court', courtSchema);
