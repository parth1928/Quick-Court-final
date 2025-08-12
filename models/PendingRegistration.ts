import { Schema, model, models } from 'mongoose';

interface IPendingRegistration {
  email: string;
  name: string;
  password: string;
  phone: string;
  role: string;
  clientIP: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
}

const PendingRegistrationSchema = new Schema<IPendingRegistration>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: '+1234567890'
  },
  role: {
    type: String,
    enum: ['user', 'owner', 'admin'],
    default: 'user'
  },
  clientIP: {
    type: String,
    default: 'unknown'
  },
  userAgent: {
    type: String,
    default: 'unknown'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
    index: { expireAfterSeconds: 0 } // MongoDB will auto-delete expired documents
  }
});

// Create index for automatic expiration
PendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingRegistration = models.PendingRegistration || model<IPendingRegistration>('PendingRegistration', PendingRegistrationSchema);

export default PendingRegistration;
