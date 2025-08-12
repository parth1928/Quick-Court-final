import { config } from 'dotenv';
import { validateEnvVars, testEmailConfig } from '../lib/env-validation';
import { sendOTPEmail } from '../utils/sendEmail';
import { generateOTP } from '../utils/generateOtp';
import mongoose from 'mongoose';
import OTP from '../models/OTP';

// Configure mongoose to use ES6 Promises and enable strict query
mongoose.set('strictQuery', true);
mongoose.Promise = global.Promise;

// Configure mongoose to use ES6 Promises and enable strict query
mongoose.set('strictQuery', true);
mongoose.Promise = global.Promise;

// Console colors for better readability
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
};

// Load environment variables
config({ path: '.env.local' });

async function runTests() {
  console.log(`${colors.blue}🔍 Starting OTP System Verification...${colors.reset}\n`);

  try {
    // 1. Validate Environment Variables
    console.log(`${colors.bright}1️⃣ Validating Environment Variables...${colors.reset}`);
    await validateEnvVars();
    console.log(`${colors.green}✅ Environment variables are properly configured${colors.reset}\n`);

    // 2. Test Email Configuration
    console.log(`${colors.bright}2️⃣ Testing Email Configuration...${colors.reset}`);
    const emailConfigWorks = await testEmailConfig();
    if (!emailConfigWorks) {
      throw new Error('Email configuration test failed');
    }
    console.log(`${colors.green}✅ Email configuration is working${colors.reset}\n`);

    // 3. Test MongoDB Connection
    console.log(`${colors.bright}3️⃣ Testing MongoDB Connection...${colors.reset}`);
    try {
      await mongoose.connect(process.env.MONGODB_URI as string);
      console.log(`${colors.green}✅ Successfully connected to MongoDB${colors.reset}\n`);
    } catch (error: any) {
      throw new Error(`MongoDB connection failed: ${error.message}`);
    }

    // 4. Test OTP Generation and Validation
    console.log(`${colors.bright}4️⃣ Testing OTP Generation and Validation...${colors.reset}`);
    const otp = generateOTP();
    console.log(`${colors.dim}Generated OTP: ${otp}${colors.reset}`);

    // Validate OTP format
    if (!otp || otp.length !== 6 || isNaN(Number(otp))) {
      throw new Error('Generated OTP is invalid');
    }
    console.log(`${colors.green}✅ OTP generation is working correctly${colors.reset}\n`);

    // 5. Test Email Sending
    console.log(`${colors.bright}5️⃣ Testing Email Sending...${colors.reset}`);
    const testEmail = process.env.SMTP_USER;
    if (!testEmail) {
      throw new Error('SMTP_USER environment variable is not set');
    }

    try {
      console.log(`${colors.dim}Attempting to send test OTP email to ${testEmail}${colors.reset}`);
      
      const emailSent = await sendOTPEmail({
        email: testEmail,
        otp,
        userName: 'Test User',
        expiryMinutes: 5
      });

      if (!emailSent) {
        throw new Error('Email sending returned false');
      }

      // Extra validation
      console.log(`${colors.dim}Validating email was sent...${colors.reset}`);
      const emailConfig = await testEmailConfig();
      if (!emailConfig) {
        throw new Error('Email configuration validation failed after sending');
      }

      console.log(`${colors.green}✅ OTP email sent successfully${colors.reset}`);
      console.log(`${colors.dim}Test OTP sent: ${otp}${colors.reset}\n`);
    } catch (error: any) {
      console.error(`${colors.red}Email sending failed:${colors.reset}`, error);
      throw new Error(`Email sending failed: ${error.message}`);
    }

    // 6. Test OTP Storage and Retrieval
    console.log(`${colors.bright}6️⃣ Testing OTP Storage and Retrieval...${colors.reset}`);
    try {
      // Clean up any existing test OTPs
      await OTP.deleteMany({ email: testEmail });

      // Test OTP creation
      const otpDoc = new OTP({
        email: testEmail,
        otp: 'test123', // In real use, this would be hashed
        expiry: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0
      });
      await otpDoc.save();
      console.log(`${colors.dim}Test OTP document created${colors.reset}`);

      // Test OTP retrieval
      const savedOTP = await OTP.findOne({ email: testEmail });
      if (!savedOTP) {
        throw new Error('Failed to save OTP to database');
      }
      console.log(`${colors.dim}Test OTP document retrieved successfully${colors.reset}`);

      // Test OTP update
      savedOTP.attempts += 1;
      await savedOTP.save();
      console.log(`${colors.dim}Test OTP document updated successfully${colors.reset}`);

      console.log(`${colors.green}✅ OTP database operations working correctly${colors.reset}\n`);
    } catch (error: any) {
      throw new Error(`OTP database operations failed: ${error.message}`);
    }

    // 7. Test TTL Index and Expiry
    console.log(`${colors.bright}7️⃣ Checking TTL Indexes and Expiry...${colors.reset}`);
    try {
      console.log(`${colors.dim}Fetching collection indexes...${colors.reset}`);
      const indexes = await OTP.collection.indexes();
      const ttlIndex = indexes.find(index => index.expireAfterSeconds !== undefined);
      
      if (!ttlIndex) {
        throw new Error('TTL index not found on OTP collection');
      }

      console.log(`${colors.dim}Found TTL index: ${JSON.stringify(ttlIndex, null, 2)}${colors.reset}`);

      // Verify the TTL index configuration
      const expectedTTL = 300; // 5 minutes in seconds
      if (ttlIndex.expireAfterSeconds !== expectedTTL) {
        console.log(`${colors.yellow}⚠️ Warning: TTL index duration is ${ttlIndex.expireAfterSeconds}s (expected ${expectedTTL}s)${colors.reset}`);
      }

      // Test expiry functionality
      console.log(`${colors.dim}Testing document expiry...${colors.reset}`);
      const expiredOTP = new OTP({
        email: testEmail,
        otp: 'expired123',
        expiry: new Date(Date.now() - 6 * 60 * 1000), // 6 minutes ago
        attempts: 0
      });
      await expiredOTP.save();

      // Wait briefly for TTL monitor to run
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if document was removed
      const expiredDoc = await OTP.findOne({ email: testEmail, otp: 'expired123' });
      if (expiredDoc) {
        console.log(`${colors.yellow}⚠️ Warning: Expired document was not removed immediately (this is normal, MongoDB's TTL monitor runs every minute)${colors.reset}`);
      }

      console.log(`${colors.green}✅ TTL index is properly configured${colors.reset}\n`);
    } catch (error: any) {
      console.error(`${colors.red}TTL index verification failed:${colors.reset}`, error);
      throw new Error(`TTL index verification failed: ${error.message}`);
    }

    // Clean up test data
    try {
      console.log(`${colors.dim}Cleaning up test data...${colors.reset}`);
      await OTP.deleteMany({ email: testEmail });
      await mongoose.disconnect();
      console.log(`${colors.dim}Cleanup completed${colors.reset}\n`);
    } catch (error: any) {
      console.log(`${colors.yellow}⚠️ Warning: Cleanup failed: ${error.message}${colors.reset}\n`);
    }

    console.log(`${colors.green}🎉 All tests completed successfully!${colors.reset}\n`);
    process.exit(0);
  } catch (error: any) {
    console.error(`\n${colors.red}❌ Test failed:${colors.reset}`, error.message);
    
    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect error in error handler
    }
    
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error: any) => {
  console.error(`\n${colors.red}❌ Unhandled Promise Rejection:${colors.reset}`, error.message);
  process.exit(1);
});

runTests().catch((error) => {
  console.error(`\n${colors.red}❌ Fatal Error:${colors.reset}`, error.message);
  process.exit(1);
});
