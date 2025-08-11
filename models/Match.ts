import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  // Basic match info
  sport: { type: String, required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  
  // Scheduling
  date: { type: Date, required: true },
  time: { type: String, required: true }, // e.g., "6:00 PM - 8:00 PM"
  
  // Participants
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now }
  }],
  playersNeeded: { type: Number, required: true, min: 2, max: 50 },
  
  // Optional prize
  prizeAmount: { type: Number, default: 0, min: 0 },
  
  // Status management
  status: { 
    type: String, 
    enum: ['Open', 'Full', 'Cancelled', 'Completed'], 
    default: 'Open' 
  },
  
  // Additional info
  description: { type: String },
  rules: [{ type: String }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for performance
matchSchema.index({ sport: 1 });
matchSchema.index({ venue: 1 });
matchSchema.index({ date: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ createdBy: 1 });

// Virtual for players joined count
matchSchema.virtual('playersJoined').get(function() {
  return this.participants?.length || 0;
});

// Update timestamp on save
matchSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure virtuals are included in JSON
matchSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Match || mongoose.model('Match', matchSchema);
