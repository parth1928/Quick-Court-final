import mongoose from 'mongoose';
import OTP from '../models/OTP';

const testMongoConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ MongoDB Connected');

    // Test OTP Collection and TTL Index
    const testOTP = new OTP({
      email: 'test@example.com',
      otp: 'test123', // This would be hashed in production
      expiry: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      attempts: 0
    });

    await testOTP.save();
    console.log('✅ OTP Model working');

    // Check TTL Index
    const indexes = await OTP.collection.indexes();
    const ttlIndex = indexes.find(index => index.expireAfterSeconds !== undefined);
    if (ttlIndex) {
      console.log('✅ TTL Index configured correctly');
    } else {
      console.log('❌ TTL Index missing');
    }

    // Cleanup test data
    await OTP.deleteOne({ email: 'test@example.com' });
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

testMongoConnection().catch(console.error);
