import mongoose from 'mongoose';

// Simple participant schema
const participantSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  joinedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: false });

// Simplified match schema for debugging
const matchSchema = new mongoose.Schema({
  // Basic match info
  sport: { 
    type: String, 
    required: true,
    trim: true
  },
  venue: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Venue', 
    required: true 
  },
  court: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Court'
  },
  courtFees: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  // Scheduling
  date: { 
    type: Date, 
    required: true
  },
  time: { 
    type: String, 
    required: true
  },
  
  // Participants
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  participants: [participantSchema],
  playersNeeded: { 
    type: Number, 
    required: true,
    min: 2,
    max: 50
  },
  
  // Optional fields
  prizeAmount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['Open', 'Full', 'Cancelled', 'Completed'], 
    default: 'Open' 
  },
  
  // Additional info
  description: { 
    type: String,
    trim: true
  },
  rules: [{ 
    type: String,
    trim: true
  }],
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Basic indexes
matchSchema.index({ sport: 1 });
matchSchema.index({ venue: 1 });
matchSchema.index({ date: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ createdBy: 1 });

// Virtual for players joined count
matchSchema.virtual('playersJoined').get(function() {
  return this.participants?.length || 0;
});

// Pre-save middleware
matchSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-add creator as participant if new and not already added
  if (this.isNew) {
    const creatorAlreadyAdded = this.participants.some(p => 
      p.user.toString() === this.createdBy.toString()
    );
    
    if (!creatorAlreadyAdded) {
      this.participants.push({
        user: this.createdBy,
        joinedAt: new Date()
      });
    }
  }
  
  // Update status based on participants
  if (this.participants.length >= this.playersNeeded && this.status === 'Open') {
    this.status = 'Full';
  } else if (this.participants.length < this.playersNeeded && this.status === 'Full') {
    this.status = 'Open';
  }
  
  next();
});

// Include virtuals in JSON
matchSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Match || mongoose.model('Match', matchSchema);
