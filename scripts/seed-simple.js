const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Manually load .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

// User Schema (simplified for seeding)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  phone: String,
  avatar: { type: String, default: '/placeholder-user.jpg' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
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

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    console.log('Clearing existing users...');
    await User.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@quickcourt.test',
      password: 'Admin@123',
      role: 'admin',
      phone: '+1234567890'
    });
    await adminUser.save();
    console.log('✅ Admin user created:');
    console.log('   Email: admin@quickcourt.test');
    console.log('   Password: Admin@123');

    // Create facility owners
    console.log('Creating facility owners...');
    const owner1 = new User({
      name: 'Facility Owner 1',
      email: 'owner1@quickcourt.test',
      password: 'Owner@123',
      role: 'owner',
      phone: '+1234567891'
    });
    await owner1.save();

    const owner2 = new User({
      name: 'Facility Owner 2',
      email: 'owner2@quickcourt.test',
      password: 'Owner@123',
      role: 'owner',
      phone: '+1234567892'
    });
    await owner2.save();
    console.log('✅ Facility owners created');

    // Create regular users
    console.log('Creating regular users...');
    const users = [
      {
        name: 'Regular User 1',
        email: 'user1@quickcourt.test',
        password: 'User@123',
        role: 'user',
        phone: '+1234567893'
      },
      {
        name: 'Regular User 2',
        email: 'user2@quickcourt.test',
        password: 'User@123',
        role: 'user',
        phone: '+1234567894'
      },
      {
        name: 'Regular User 3',
        email: 'user3@quickcourt.test',
        password: 'User@123',
        role: 'user',
        phone: '+1234567895'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }
    console.log('✅ Regular users created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('👤 Admin: admin@quickcourt.test / Admin@123');
    console.log('🏢 Owner: owner1@quickcourt.test / Owner@123');
    console.log('👥 User: user1@quickcourt.test / User@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
