import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  avatar: { type: String },
  team: { type: String },
  registrationDate: { type: Date, default: Date.now }
}, { _id: false });

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: String, required: true },
  category: { type: String },
  venue: { type: String },
  location: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  maxParticipants: { type: Number, required: true },
  entryFee: { type: Number, default: 0 },
  prizePool: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['draft','submitted','approved','open','closed','ongoing','completed','cancelled'], 
    default: 'draft' 
  },
  difficulty: { type: String, enum: ['Beginner','Intermediate','Advanced','Professional'], default: 'Beginner' },
  description: { type: String },
  organizer: { type: String },
  organizerContact: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [participantSchema],
  rules: [{ type: String }],
  schedule: [{
    date: Date,
    time: String,
    event: String,
    location: String
  }],
  prizes: [{
    position: String,
    prize: String,
    amount: Number
  }],
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

tournamentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

tournamentSchema.virtual('currentParticipants').get(function(this: any) {
  return this.participants?.length || 0;
});

export default mongoose.models.Tournament || mongoose.model('Tournament', tournamentSchema);
