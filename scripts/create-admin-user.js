const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickcourt';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  phone: String,
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const adminProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { 
    type: String, 
    enum: ['operations', 'customer_service', 'technical', 'management'], 
    default: 'operations' 
  },
  permissions: {
    canManageUsers: { type: Boolean, default: true },
    canManageFacilities: { type: Boolean, default: true },
    canManageTournaments: { type: Boolean, default: true },
    canViewReports: { type: Boolean, default: true },
    canManageBookings: { type: Boolean, default: true }
  },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

async function createAdminUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', userSchema);
    const AdminProfile = mongoose.model('AdminProfile', adminProfileSchema);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@quickcourt.test' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists with email: admin@quickcourt.test');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@quickcourt.test',
      password: hashedPassword,
      role: 'admin',
      phone: '+1234567890',
      isVerified: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('   User ID:', adminUser._id);
    console.log('   Email:', adminUser.email);
    console.log('   Role:', adminUser.role);

    // Create admin profile
    const adminProfile = new AdminProfile({
      user: adminUser._id,
      department: 'management',
      permissions: {
        canManageUsers: true,
        canManageFacilities: true,
        canManageTournaments: true,
        canViewReports: true,
        canManageBookings: true
      },
      notes: 'Super admin user with full permissions'
    });

    await adminProfile.save();
    console.log('✅ Admin profile created successfully');
    console.log('   Profile ID:', adminProfile._id);
    console.log('   Department:', adminProfile.department);

    console.log('\n🎉 Admin user setup complete!');
    console.log('📧 Email: admin@quickcourt.test');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Role: admin');
    console.log('\nYou can now log in with these credentials.');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

createAdminUser();
