const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  phone: String,
  avatar: { type: String, default: '/placeholder-user.jpg' },
  status: { type: String, enum: ['active', 'inactive', 'banned', 'suspended'], default: 'active' },
  isBanned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
const bcrypt = require('bcryptjs');
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@quickcourt.com' });
    
    if (existingAdmin) {
      console.log('🔸 Admin user already exists:');
      console.log('   Email: admin@quickcourt.com');
      console.log('   Role:', existingAdmin.role);
      
      // Update role to admin if it's not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }
    } else {
      // Create new admin user
      console.log('👤 Creating admin user...');
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@quickcourt.com',
        password: 'Admin@123',
        role: 'admin',
        phone: '+91-9876543210',
        avatar: '/placeholder-user.jpg',
        status: 'active'
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📋 Admin Login Credentials:');
    console.log('   Email: admin@quickcourt.com');
    console.log('   Password: Admin@123');
    console.log('\n🎯 You can now:');
    console.log('   1. Login with these credentials');
    console.log('   2. Access the venue approval page');
    console.log('   3. Approve/reject venue requests');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 11000) {
      console.log('🔸 Admin user may already exist with different email');
      console.log('   Try logging in with: admin@quickcourt.com / Admin@123');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdmin();
