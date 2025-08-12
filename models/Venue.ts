import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Venue name is required'],
    trim: true,
    maxlength: [100, 'Venue name cannot exceed 100 characters'],
    minlength: [3, 'Venue name must be at least 3 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
    index: true
  },
  
  sportsOffered: {
    type: [String],
    required: [true, 'At least one sport must be offered'],
    validate: {
      validator: function(sports: string[]) {
        return sports && sports.length > 0;
      },
      message: 'At least one sport must be offered'
    },
    enum: {
      values: ['badminton', 'tennis', 'basketball', 'cricket', 'football', 'volleyball', 'table-tennis', 'squash', 'swimming'],
      message: 'Invalid sport type'
    },
    index: true
  },
  
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [50, 'City name cannot exceed 50 characters'],
      index: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [50, 'State name cannot exceed 50 characters']
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      validate: {
        validator: function(pincode: string) {
          return /^[0-9]{6}$/.test(pincode);
        },
        message: 'Pincode must be 6 digits'
      }
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'India',
      maxlength: [50, 'Country name cannot exceed 50 characters']
    }
  },
  
  geoLocation: {
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  
  amenities: {
    type: [String],
    enum: {
      values: ['lights', 'parking', 'showers', 'lockers', 'cafeteria', 'first-aid', 'ac', 'wifi', 'equipment-rental', 'pro-shop'],
      message: 'Invalid amenity type'
    },
    default: []
  },
  
  pricePerHour: {
    type: Number,
    required: [true, 'Price per hour is required'],
    min: [1, 'Price per hour must be greater than 0'],
    max: [10000, 'Price per hour cannot exceed ₹10,000'],
    validate: {
      validator: function(price: number) {
        return Number.isInteger(price) || (price * 100) % 1 === 0;
      },
      message: 'Price can have maximum 2 decimal places'
    }
  },
  
  images: {
    type: [String],
    validate: {
      validator: function(images: string[]) {
        return images.length <= 10;
      },
      message: 'Maximum 10 images allowed'
    },
    default: []
  },
  
  approvalStatus: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Invalid approval status'
    },
    default: 'pending',
    index: true
  },
  
  // Additional useful fields
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  
  totalReviews: {
    type: Number,
    default: 0,
    min: [0, 'Total reviews cannot be negative']
  },
  
  operatingHours: {
    open: {
      type: String,
      default: '06:00',
      validate: {
        validator: function(time: string) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
        },
        message: 'Invalid time format. Use HH:MM'
      }
    },
    close: {
      type: String,
      default: '22:00',
      validate: {
        validator: function(time: string) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
        },
        message: 'Invalid time format. Use HH:MM'
      }
    }
  },
  
  // Legacy fields for backward compatibility
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shortLocation: { type: String },
  fullAddress: { type: String },
  contactNumber: { type: String },
  mapLink: { type: String },
  sports: [{ type: String }], // alias for sportsOffered
  photos: [{ type: String }], // alias for images
  startingPrice: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  contactPhone: { type: String },
  contactEmail: { type: String, lowercase: true, match: /.+@.+\..+/ },
  slug: { type: String, unique: true, sparse: true, index: true },
  
  // Admin review fields
  rejectionReason: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
venueSchema.index({ 'address.city': 1, sportsOffered: 1 });
venueSchema.index({ 'address.city': 1, pricePerHour: 1 });
venueSchema.index({ approvalStatus: 1, isActive: 1 });
venueSchema.index({ 'geoLocation.lat': 1, 'geoLocation.lng': 1 });
venueSchema.index({ rating: -1 });
venueSchema.index({ sports: 1 }); // backward compatibility
venueSchema.index({ startingPrice: 1 }); // backward compatibility

// Virtual for full address display
venueSchema.virtual('fullAddressDisplay').get(function() {
  return this.address ? `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.pincode}, ${this.address.country}` : '';
});

// Virtual for formatted price
venueSchema.virtual('formattedPrice').get(function() {
  return `₹${this.pricePerHour?.toLocaleString('en-IN')}`;
});

// Virtual for backward compatibility
venueSchema.virtual('computedLocation').get(function() {
  if (this.shortLocation) return this.shortLocation;
  if (this.address) {
    const parts = [this.address.city, this.address.state].filter(Boolean);
    if (parts.length) return parts.join(', ');
  }
  return '';
});

venueSchema.virtual('price').get(function() {
  return this.pricePerHour || this.startingPrice || 0;
});

venueSchema.virtual('image').get(function() {
  return (this.images && this.images[0]) || (this.photos && this.photos[0]) || '/placeholder.jpg';
});

venueSchema.virtual('reviews').get(function() {
  return this.totalReviews || 0;
});

// Pre-save middleware for validation and data sync
venueSchema.pre('save', async function(next) {
  try {
    // Sync legacy fields
    if (!this.ownerId && this.owner) this.ownerId = this.owner;
    if (!this.sports && this.sportsOffered) this.sports = this.sportsOffered;
    if (!this.photos && this.images) this.photos = this.images;
    if (!this.startingPrice && this.pricePerHour) this.startingPrice = this.pricePerHour;
    if (!this.status && this.approvalStatus) this.status = this.approvalStatus;

    // Sync primary fields from legacy if needed
    if (!this.sportsOffered && this.sports) this.sportsOffered = this.sports;
    if (!this.images && this.photos) this.images = this.photos;
    if (!this.pricePerHour && this.startingPrice) this.pricePerHour = this.startingPrice;
    if (!this.approvalStatus && this.status) this.approvalStatus = this.status;

    // Generate slug if missing or name changed; ensure uniqueness
    if (this.isModified('name')) {
      const base = this.name?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (base) {
        let slug = base;
        let counter = 1;
        // Avoid infinite loops: limit attempts
        while (await (this.constructor as any).exists({ slug, _id: { $ne: this._id } }) && counter < 100) {
          slug = `${base}-${counter++}`;
        }
        this.slug = slug;
      }
    }

    // Generate fullAddress if missing
    if (!this.fullAddress && this.address) {
      this.fullAddress = `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.pincode}, ${this.address.country}`;
    }

    // Validate operating hours
    if (this.operatingHours && this.operatingHours.open >= this.operatingHours.close) {
      return next(new Error('Opening time must be before closing time'));
    }
    next();
  } catch (err) {
    next(err as any);
  }
});

// Static method to find venues by location
venueSchema.statics.findByLocation = function(lat: number, lng: number, radiusKm: number = 10) {
  return this.find({
    'geoLocation.lat': {
      $gte: lat - (radiusKm / 111),
      $lte: lat + (radiusKm / 111)
    },
    'geoLocation.lng': {
      $gte: lng - (radiusKm / (111 * Math.cos(lat * Math.PI / 180))),
      $lte: lng + (radiusKm / (111 * Math.cos(lat * Math.PI / 180)))
    },
    isActive: true,
    approvalStatus: 'approved'
  });
};

// Instance method to calculate distance from a point
venueSchema.methods.distanceFrom = function(lat: number, lng: number) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat - this.geoLocation.lat) * Math.PI / 180;
  const dLng = (lng - this.geoLocation.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.geoLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

export default mongoose.models.Venue || mongoose.model('Venue', venueSchema);
