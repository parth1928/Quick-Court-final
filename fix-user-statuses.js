// Fix users without status field
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
  phone: String,
  createdAt: Date,
  updatedAt: Date,
  lastActiveAt: Date,
  bannedAt: Date,
  suspendedAt: Date
}, { strict: false });

async function fixUserStatuses() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');
    
    console.log('Finding users without status...');
    const usersWithoutStatus = await User.find({
      $or: [
        { status: { $exists: false } },
        { status: null },
        { status: undefined }
      ]
    });
    
    console.log(`Found ${usersWithoutStatus.length} users without status`);
    
    if (usersWithoutStatus.length > 0) {
      console.log('Updating users to have active status...');
      const result = await User.updateMany(
        {
          $or: [
            { status: { $exists: false } },
            { status: null },
            { status: undefined }
          ]
        },
        {
          $set: {
            status: 'active',
            updatedAt: new Date()
          }
        }
      );
      
      console.log(`Updated ${result.modifiedCount} users`);
    }
    
    // Verify the fix
    console.log('Verifying fix...');
    const allUsers = await User.find({}).select('name email status');
    console.log('All users status:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}): ${user.status}`);
    });
    
  } catch (error) {
    console.error('Fix error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixUserStatuses();
