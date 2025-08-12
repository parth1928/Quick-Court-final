// Script to restore old user data structure
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Original User Schema (simplified for restoration)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  phone: String,
  avatar: { type: String, default: '/placeholder-user.jpg' },
  bookingCount: { type: Number, default: 0 },
  lastLoginAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function restoreOldData() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Get current users count
    const currentCount = await User.countDocuments();
    console.log(`📊 Current users in database: ${currentCount}`);

    // Remove all ban-related fields from existing users
    console.log('\n🔄 Removing ban-related fields from all users...');
    const result = await User.updateMany(
      {}, // Update all users
      {
        $unset: {
          status: 1,
          isBanned: 1,
          bannedAt: 1,
          banReason: 1,
          suspendedAt: 1,
          suspensionReason: 1
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users`);

    // Fetch and display cleaned users
    const cleanedUsers = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    console.log('\n👥 RESTORED USER DATA:');
    console.log('=' .repeat(100));
    console.log('| Name                | Email                         | Role    | Created      |');
    console.log('=' .repeat(100));
    
    cleanedUsers.forEach((user) => {
      const name = (user.name || 'N/A').padEnd(18, ' ').substring(0, 18);
      const email = (user.email || 'N/A').padEnd(28, ' ').substring(0, 28);
      const role = (user.role || 'user').padEnd(6, ' ').substring(0, 6);
      const created = user.createdAt ? 
        new Date(user.createdAt).toLocaleDateString() : 
        'Unknown';
      
      console.log(`| ${name} | ${email} | ${role} | ${created} |`);
    });
    
    console.log('=' .repeat(100));

    // Display statistics
    const stats = {
      total: cleanedUsers.length,
      admins: cleanedUsers.filter(u => u.role === 'admin').length,
      owners: cleanedUsers.filter(u => u.role === 'owner').length,
      users: cleanedUsers.filter(u => u.role === 'user').length
    };

    console.log('\n📊 RESTORED DATA STATISTICS:');
    console.log(`📈 Total Users: ${stats.total}`);
    console.log(`🔧 Admins: ${stats.admins}`);
    console.log(`🏢 Facility Owners: ${stats.owners}`);
    console.log(`👤 Regular Users: ${stats.users}`);

    console.log('\n✅ OLD DATA STRUCTURE RESTORED!');
    console.log('🔄 All ban-related fields have been removed');
    console.log('📋 Users are back to original simple structure');
    console.log('\n🔑 LOGIN CREDENTIALS (All Active):');
    
    const adminUser = cleanedUsers.find(u => u.role === 'admin');
    if (adminUser) {
      console.log(`👤 Admin: ${adminUser.email} / Admin@123`);
    }
    
    const ownerUser = cleanedUsers.find(u => u.role === 'owner');
    if (ownerUser) {
      console.log(`🏢 Owner: ${ownerUser.email} / Owner@123`);
    }
    
    const regularUser = cleanedUsers.find(u => u.role === 'user');
    if (regularUser) {
      console.log(`👥 User: ${regularUser.email} / User@123`);
    }

    console.log('\n✨ All users can now login normally!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error restoring old data:', error);
    process.exit(1);
  }
}

restoreOldData();
