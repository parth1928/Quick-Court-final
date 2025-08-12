// Direct database test for user ban functionality
const mongoose = require('mongoose');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0');
    console.log('MongoDB Connected');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Define the same user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  status: String,
  phone: String,
  createdAt: Date,
  updatedAt: Date,
  lastActiveAt: Date,
  bannedAt: Date,
  suspendedAt: Date
}, { strict: false });

async function testDatabaseUpdate() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');
    
    console.log('Finding users...');
    const users = await User.find({}).limit(3);
    console.log('Found users:', users.length);
    
    if (users.length === 0) {
      console.log('No users found in database');
      return;
    }
    
    const testUser = users[0];
    console.log('Testing with user:', {
      id: testUser._id,
      name: testUser.name,
      email: testUser.email,
      currentStatus: testUser.status
    });
    
    console.log('Attempting to ban user...');
    const banResult = await User.findByIdAndUpdate(
      testUser._id,
      {
        status: 'banned',
        bannedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true, runValidators: false }
    );
    
    console.log('Ban result:', {
      id: banResult?._id,
      status: banResult?.status,
      bannedAt: banResult?.bannedAt,
      updatedAt: banResult?.updatedAt
    });
    
    // Verify by fetching again
    console.log('Verifying update...');
    const verifyUser = await User.findById(testUser._id);
    console.log('Verified user status:', {
      id: verifyUser?._id,
      status: verifyUser?.status,
      bannedAt: verifyUser?.bannedAt
    });
    
    // Test unban
    console.log('Attempting to unban user...');
    const unbanResult = await User.findByIdAndUpdate(
      testUser._id,
      {
        status: 'active',
        $unset: { bannedAt: 1 },
        updatedAt: new Date()
      },
      { new: true, runValidators: false }
    );
    
    console.log('Unban result:', {
      id: unbanResult?._id,
      status: unbanResult?.status,
      bannedAt: unbanResult?.bannedAt
    });
    
    // Final verification
    const finalUser = await User.findById(testUser._id);
    console.log('Final user status:', {
      id: finalUser?._id,
      status: finalUser?.status,
      bannedAt: finalUser?.bannedAt
    });
    
  } catch (error) {
    console.error('Database test error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testDatabaseUpdate();
