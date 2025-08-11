import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  expiry: Date;
  attempts: number;
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // MongoDB TTL index for automatic cleanup
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // 10 minutes TTL for rate limiting
  },
});

// Compound index for efficient queries
otpSchema.index({ email: 1, expiry: 1 });

// Note: OTP is stored as bcrypt hash (~60 chars), not plain text
// Validation for 6-digit format happens in the generation utility before hashing

const OTP = mongoose.models.OTP || mongoose.model<IOTP>('OTP', otpSchema);

export default OTP;
