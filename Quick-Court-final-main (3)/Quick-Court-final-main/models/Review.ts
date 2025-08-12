import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: null },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one review per user per venue
reviewSchema.index({ venue: 1, user: 1 }, { unique: true });

// Update venue rating when a review is added or modified
reviewSchema.post('save', async function() {
  const venue = await mongoose.model('Venue').findById(this.venue);
  if (venue) {
    const stats = await mongoose.model('Review').aggregate([
      {
        $match: { venue: this.venue }
      },
      {
        $group: {
          _id: '$venue',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      venue.rating = Math.round(stats[0].avgRating * 10) / 10;
      venue.reviewCount = stats[0].numReviews;
      await venue.save();
    }
  }
});

// Update the updatedAt timestamp
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
