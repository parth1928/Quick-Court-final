// Script to fetch and display real users from MongoDB Atlas
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

// User Schema (to match existing database structure)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  phone: String,
  avatar: String,
  status: String,
  isBanned: Boolean,
  bookingCount: Number,
  lastLoginAt: Date,
  bannedAt: Date,
  banReason: String,
  suspendedAt: Date,
  suspensionReason: String,
  createdAt: Date,
  updatedAt: Date
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function fetchRealUsers() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    console.log('📊 Database:', mongoose.connection.db?.databaseName);

    // Fetch all users from the database
    console.log('\n📋 Fetching all users from database...');
    const users = await User.find({}).select('-password -passwordHash').sort({ createdAt: -1 });

    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('\n💡 Run the seed script first: node scripts/seed-indian.js');
      process.exit(0);
    }

    console.log(`\n👥 Found ${users.length} users in database:\n`);
    
    // Display users in a formatted table
    console.log('=' .repeat(120));
    console.log('| ID                       | Name                | Email                         | Role    | Status    | Last Login   |');
    console.log('=' .repeat(120));
    
    users.forEach((user, index) => {
      const id = user._id.toString().substring(0, 24);
      const name = (user.name || 'N/A').padEnd(18, ' ').substring(0, 18);
      const email = (user.email || 'N/A').padEnd(28, ' ').substring(0, 28);
      const role = (user.role || 'user').padEnd(6, ' ').substring(0, 6);
      const status = (user.status || (user.isBanned ? 'banned' : 'active')).padEnd(8, ' ').substring(0, 8);
      const lastLogin = user.lastLoginAt ? 
        new Date(user.lastLoginAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : 
        'Never'.padEnd(10, ' ');
      
      console.log(`| ${id} | ${name} | ${email} | ${role} | ${status} | ${lastLogin} |`);
    });
    
    console.log('=' .repeat(120));

    // Display statistics
    const stats = {
      total: users.length,
      active: users.filter(u => u.status === 'active' || (!u.status && !u.isBanned)).length,
      banned: users.filter(u => u.status === 'banned' || u.isBanned === true).length,
      inactive: users.filter(u => u.status === 'inactive').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      admins: users.filter(u => u.role === 'admin').length,
      owners: users.filter(u => u.role === 'owner').length,
      regularUsers: users.filter(u => u.role === 'user').length
    };

    console.log('\n📊 USER STATISTICS:');
    console.log(`📈 Total Users: ${stats.total}`);
    console.log(`✅ Active: ${stats.active}`);
    console.log(`❌ Banned: ${stats.banned}`);
    console.log(`⏸️  Inactive: ${stats.inactive}`);
    console.log(`⏳ Suspended: ${stats.suspended}`);
    console.log('\n👔 ROLE BREAKDOWN:');
    console.log(`🔧 Admins: ${stats.admins}`);
    console.log(`🏢 Facility Owners: ${stats.owners}`);
    console.log(`👤 Regular Users: ${stats.regularUsers}`);

    // Display detailed information for banned users
    const bannedUsers = users.filter(u => u.status === 'banned' || u.isBanned === true);
    if (bannedUsers.length > 0) {
      console.log('\n🚫 BANNED USERS DETAILS:');
      bannedUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name} (${user.email})`);
        console.log(`   Status: ${user.status || 'banned'}`);
        console.log(`   Banned: ${user.isBanned ? 'Yes' : 'No'}`);
        if (user.bannedAt) {
          console.log(`   Banned At: ${new Date(user.bannedAt).toLocaleString()}`);
        }
        if (user.banReason) {
          console.log(`   Reason: ${user.banReason}`);
        }
      });
    }

    // Display test login credentials
    console.log('\n🔑 TEST LOGIN CREDENTIALS:');
    console.log('=' .repeat(60));
    
    const adminUser = users.find(u => u.role === 'admin');
    if (adminUser) {
      console.log(`👤 Admin: ${adminUser.email} / Admin@123`);
    }
    
    const ownerUser = users.find(u => u.role === 'owner');
    if (ownerUser) {
      console.log(`🏢 Owner: ${ownerUser.email} / Owner@123`);
    }
    
    const activeUser = users.find(u => u.role === 'user' && (u.status === 'active' || (!u.status && !u.isBanned)));
    if (activeUser) {
      console.log(`👥 User (Active): ${activeUser.email} / User@123`);
    }
    
    const bannedUser = users.find(u => u.status === 'banned' || u.isBanned === true);
    if (bannedUser) {
      console.log(`❌ User (Banned): ${bannedUser.email} / User@123 (Cannot login)`);
    }
    
    console.log('=' .repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fetching users from database:', error);
    process.exit(1);
  }
}

fetchRealUsers();
