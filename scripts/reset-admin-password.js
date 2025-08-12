const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Use the same connection string from your db.ts
const MONGODB_URI = 'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';

// Define user schema
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function resetAdminPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@quickcourt.test';
    const newPassword = 'admin123'; // Simple password for testing

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the admin user's password
    const result = await User.updateOne(
      { email: adminEmail },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Password reset successful for ${adminEmail}`);
      console.log(`🔑 New password: ${newPassword}`);
      console.log(`\n📝 Login credentials:`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${newPassword}`);
    } else {
      console.log(`❌ Failed to reset password for ${adminEmail}`);
    }

  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetAdminPassword();
