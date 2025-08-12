const mongoose = require('mongoose');

// Use the same connection string from your db.ts
const MONGODB_URI = 'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';

// Define user schema
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function checkAdminUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`Found ${adminUsers.length} admin users:`);

    if (adminUsers.length === 0) {
      console.log('No admin users found. You need to create an admin user first.');
    } else {
      adminUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ID: ${user._id}`);
      });
    }

    // Check all users and their roles
    const allUsers = await User.find({});
    console.log(`\nTotal users: ${allUsers.length}`);
    
    const roleCounts = {};
    allUsers.forEach(user => {
      const role = user.role || 'no_role';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    
    console.log('Role distribution:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  ${role}: ${count}`);
    });

  } catch (error) {
    console.error('Error checking admin users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkAdminUsers();
