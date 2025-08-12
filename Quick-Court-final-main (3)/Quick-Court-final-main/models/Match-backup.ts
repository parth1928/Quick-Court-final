// Backup of the enhanced Match model
// This is the comprehensive version - will restore after fixing basic issues
import mongoose from 'mongoose';

// Participant sub-schema
const participantSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  joinedAt: { 
    type: Date, 
    default: Date.now 
  },
  status: {
    type: String,
    enum: ['joined', 'confirmed', 'cancelled'],
    default: 'joined'
  }
}, { _id: false });

// Enhanced match schema (currently too complex - causing validation errors)
const matchSchema = new mongoose.Schema({
  // Basic match information
  sport: { 
    type: String, 
    required: [true, 'Sport is required'],
    trim: true,
    enum: {
      values: ['Tennis', 'Badminton', 'Table Tennis', 'Squash', 'Basketball', 'Football', 'Cricket', 'Volleyball'],
      message: '{VALUE} is not a valid sport'
    }
  },
  
  // Continue with rest of enhanced schema...
  // (This is the backup - we'll use a simpler version first)
});

export default mongoose.models.Match || mongoose.model('Match', matchSchema);
