import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  // Original field used in existing code. We'll also expose passwordHash for the spec.
  password: { type: String, required: true },
  passwordHash: { type: String }, // mirrors password so either can be used
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user', index: true },
  phone: { type: String, required: true },
  avatar: { type: String, default: '/placeholder-user.jpg' },
  isBanned: { type: Boolean, default: false },
  bookingCount: { type: Number, default: 0, index: true },
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    // keep passwordHash in sync if password not modified but passwordHash missing
    if (!this.passwordHash) this.passwordHash = this.password;
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(this.password, salt);
    this.password = hashed;
    this.passwordHash = hashed; // maintain both fields for compatibility with spec
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update the updatedAt timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.User || mongoose.model('User', userSchema);
