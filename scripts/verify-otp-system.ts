import { config } from 'dotenv';
import { validateEnvVars, testEmailConfig } from '../lib/env-validation';
import { sendOTPEmail } from '../utils/sendEmail';
import { generateOTP } from '../utils/generateOtp';
import mongoose from 'mongoose';
import OTP from '../models/OTP';

// Load environment variables
config({ path: '.env.local' });

async function runTests() {
  console.log('🔍 Starting OTP System Tests...\n');

  try {
    // 1. Validate Environment Variables
    console.log('1️⃣ Validating environment variables...');
    validateEnvVars();
    console.log('✅ Environment variables are properly configured\n');

    // 2. Test Email Configuration
    console.log('2️⃣ Testing email configuration...');
    const emailConfigWorks = await testEmailConfig();
    if (!emailConfigWorks) {
      throw new Error('Email configuration test failed');
    }
    console.log('✅ Email configuration is working\n');

    // 3. Test MongoDB Connection
    console.log('3️⃣ Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Successfully connected to MongoDB\n');

    // 4. Test OTP Generation and Email Sending
    console.log('4️⃣ Testing OTP generation and email sending...');
    const testEmail = process.env.SMTP_USER as string;
    const otp = generateOTP();
    console.log(`Generated OTP: ${otp}`);

    const emailSent = await sendOTPEmail({
      email: testEmail,
      otp,
      userName: 'Test User',
      expiryMinutes: 5
    });

    if (!emailSent) {
      throw new Error('Failed to send OTP email');
    }
    console.log('✅ OTP email sent successfully\n');

    // 5. Test OTP Storage
    console.log('5️⃣ Testing OTP storage in MongoDB...');
    // Clean up any existing test OTPs
    await OTP.deleteMany({ email: testEmail });

    const otpDoc = new OTP({
      email: testEmail,
      otp: 'test123', // In real use, this would be hashed
      expiry: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0
    });
    await otpDoc.save();

    // Verify OTP was saved
    const savedOTP = await OTP.findOne({ email: testEmail });
    if (!savedOTP) {
      throw new Error('Failed to save OTP to database');
    }
    console.log('✅ OTP successfully stored in database\n');

    // 6. Test TTL Index
    console.log('6️⃣ Checking TTL indexes...');
    const indexes = await OTP.collection.indexes();
    const ttlIndexExists = indexes.some(index => index.expireAfterSeconds !== undefined);
    if (!ttlIndexExists) {
      throw new Error('TTL index not found on OTP collection');
    }
    console.log('✅ TTL index is properly configured\n');

    // Clean up test data
    await OTP.deleteMany({ email: testEmail });
    await mongoose.disconnect();

    console.log('🎉 All tests completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runTests().catch(console.error);
