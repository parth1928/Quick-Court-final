import mongoose from 'mongoose';

const slotSubSchema = new mongoose.Schema({
  start: { type: String, required: true }, // HH:MM
  end: { type: String, required: true },   // HH:MM
  isAvailable: { type: Boolean, default: true }
}, { _id: false });

const timeSlotSchema = new mongoose.Schema({
  court: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
  courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court' }, // alias
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  slots: [slotSubSchema],
  generatedForRange: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

timeSlotSchema.index({ court: 1, date: 1 }, { unique: true });

timeSlotSchema.pre('save', function(next) {
  if (!this.courtId && this.court) this.courtId = this.court;
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.TimeSlot || mongoose.model('TimeSlot', timeSlotSchema);
