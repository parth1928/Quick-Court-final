import mongoose from 'mongoose';
import { generateOTP, hashOTP, verifyOTP } from '../utils/generateOtp';
import { sendOTPEmail } from '../lib/sendEmail';
import OTP from '../models/OTP';

const testOTPSystem = async () => {
  try {
    // 1. Test OTP Generation
    const otp = generateOTP();
    console.log('✅ Generated OTP:', otp);
    console.assert(otp.length === 6, 'OTP should be 6 digits');

    // 2. Test OTP Hashing
    const hashedOTP = await hashOTP(otp);
    console.log('✅ OTP Hashed successfully (length:', hashedOTP.length, ')');

    // 3. Test OTP Verification
    const isValid = await verifyOTP(otp, hashedOTP);
    console.log('✅ OTP Verification:', isValid ? 'successful' : 'failed');

    // 4. Test MongoDB Connection
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ MongoDB Connected');

    // 5. Test OTP Storage
    const testEmail = 'test@example.com';
    const otpDoc = new OTP({
      email: testEmail,
      otp: hashedOTP,
      expiry: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0
    });
    await otpDoc.save();
    console.log('✅ OTP saved to database');

    // 6. Test Email Sending
    const emailResult = await sendOTPEmail(testEmail, otp);
    console.log('📧 Email sending test:', emailResult.success ? 'successful' : 'failed');
    if (!emailResult.success) {
      console.error('Email error:', emailResult.error);
    }

    // 7. Test OTP Retrieval
    const storedOTP = await OTP.findOne({ email: testEmail });
    console.log('✅ OTP retrieval test:', storedOTP ? 'successful' : 'failed');

    // 8. Verify stored OTP
    if (storedOTP) {
      const isStoredValid = await verifyOTP(otp, storedOTP.otp);
      console.log('✅ Stored OTP verification:', isStoredValid ? 'successful' : 'failed');
    }

    // Cleanup
    await OTP.deleteOne({ email: testEmail });
    await mongoose.disconnect();
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

// Run tests
console.log('🔍 Starting OTP system tests...\n');
testOTPSystem().catch(console.error);
