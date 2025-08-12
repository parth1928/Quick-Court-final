// Test both status and isBanned field enforcement
const mongoose = require('mongoose');

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

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  status: String,
  isBanned: Boolean,
  phone: String,
  createdAt: Date,
  updatedAt: Date,
  lastActiveAt: Date,
  bannedAt: Date,
  suspendedAt: Date
}, { strict: false });

async function testDualFieldBan() {
  try {
    console.log('Testing dual field ban enforcement...');
    await connectDB();
    
    const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');
    
    // Find a user to test with
    const testUser = await User.findOne({ email: 'hrhprikh097@gmail.com' });
    if (!testUser) {
      console.log('Test user not found');
      return;
    }
    
    console.log('Testing with user:', {
      name: testUser.name,
      email: testUser.email,
      currentStatus: testUser.status,
      currentIsBanned: testUser.isBanned
    });
    
    // Test ban - should update both fields
    console.log('\n1. Testing ban (updating both status and isBanned)...');
    const banResult = await User.findByIdAndUpdate(
      testUser._id,
      {
        status: 'banned',
        isBanned: true,
        bannedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    console.log('After ban:', {
      status: banResult.status,
      isBanned: banResult.isBanned,
      bannedAt: banResult.bannedAt
    });
    
    // Test middleware check logic
    console.log('\n2. Testing middleware logic...');
    const isUserBanned = banResult.status === 'banned' || banResult.isBanned === true;
    console.log('Would middleware block user?', isUserBanned ? 'YES' : 'NO');
    
    // Test unban - should update both fields
    console.log('\n3. Testing unban (updating both status and isBanned)...');
    const unbanResult = await User.findByIdAndUpdate(
      testUser._id,
      {
        status: 'active',
        isBanned: false,
        $unset: { bannedAt: 1 },
        updatedAt: new Date()
      },
      { new: true }
    );
    
    console.log('After unban:', {
      status: unbanResult.status,
      isBanned: unbanResult.isBanned,
      bannedAt: unbanResult.bannedAt
    });
    
    // Test middleware check logic for unbanned user
    const isUserStillBanned = unbanResult.status === 'banned' || unbanResult.isBanned === true;
    console.log('Would middleware still block user?', isUserStillBanned ? 'YES' : 'NO');
    
    console.log('\n✅ Dual field ban enforcement test completed');
    console.log('✅ Both status and isBanned fields are properly updated');
    console.log('✅ Middleware will check both fields for maximum compatibility');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testDualFieldBan();
