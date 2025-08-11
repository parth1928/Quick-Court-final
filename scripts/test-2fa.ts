/**
 * Test script for QuickCourt 2FA system
 * Run with: npm run test:2fa
 */

import { generateOTP, hashOTP, verifyOTP, createOTPExpiry, isOTPExpired } from '../utils/generateOtp';
import { verifyEmailConfig } from '../utils/sendEmail';

async function test2FASystem() {
  console.log('🧪 Testing QuickCourt 2FA System\n');

  // Test 1: OTP Generation
  console.log('1. Testing OTP Generation...');
  try {
    const otp1 = generateOTP();
    const otp2 = generateOTP();
    
    console.log(`   Generated OTP 1: ${otp1} (Length: ${otp1.length})`);
    console.log(`   Generated OTP 2: ${otp2} (Length: ${otp2.length})`);
    console.log(`   ✅ OTPs are different: ${otp1 !== otp2}`);
    console.log(`   ✅ Both are 6 digits: ${otp1.length === 6 && otp2.length === 6}\n`);
  } catch (error) {
    console.log(`   ❌ OTP Generation failed: ${error}\n`);
  }

  // Test 2: OTP Hashing and Verification
  console.log('2. Testing OTP Hashing and Verification...');
  try {
    const testOTP = generateOTP();
    console.log(`   Original OTP: ${testOTP}`);
    
    const hashedOTP = await hashOTP(testOTP);
    console.log(`   Hashed OTP: ${hashedOTP.substring(0, 20)}...`);
    
    const isValidCorrect = await verifyOTP(testOTP, hashedOTP);
    const isValidWrong = await verifyOTP('123456', hashedOTP);
    
    console.log(`   ✅ Correct OTP verifies: ${isValidCorrect}`);
    console.log(`   ✅ Wrong OTP fails: ${!isValidWrong}\n`);
  } catch (error) {
    console.log(`   ❌ OTP Hashing/Verification failed: ${error}\n`);
  }

  // Test 3: OTP Expiry
  console.log('3. Testing OTP Expiry...');
  try {
    const futureExpiry = createOTPExpiry();
    const pastExpiry = new Date(Date.now() - 10000); // 10 seconds ago
    
    console.log(`   Future expiry: ${futureExpiry.toISOString()}`);
    console.log(`   Past expiry: ${pastExpiry.toISOString()}`);
    
    const isExpiredFuture = isOTPExpired(futureExpiry);
    const isExpiredPast = isOTPExpired(pastExpiry);
    
    console.log(`   ✅ Future OTP not expired: ${!isExpiredFuture}`);
    console.log(`   ✅ Past OTP is expired: ${isExpiredPast}\n`);
  } catch (error) {
    console.log(`   ❌ OTP Expiry test failed: ${error}\n`);
  }

  // Test 4: Email Configuration
  console.log('4. Testing Email Configuration...');
  try {
    // Only test if SMTP credentials are configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const isConfigured = await verifyEmailConfig();
      console.log(`   ✅ Email configuration valid: ${isConfigured}\n`);
    } else {
      console.log(`   ⚠️  SMTP credentials not configured - skipping email test\n`);
    }
  } catch (error) {
    console.log(`   ❌ Email configuration test failed: ${error}\n`);
  }

  // Test 5: Performance Test
  console.log('5. Testing Performance...');
  try {
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      const otp = generateOTP();
      promises.push(hashOTP(otp));
    }
    
    await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`   ✅ Generated and hashed 10 OTPs in ${endTime - startTime}ms\n`);
  } catch (error) {
    console.log(`   ❌ Performance test failed: ${error}\n`);
  }

  console.log('🎉 2FA System Tests Complete!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  test2FASystem().catch(console.error);
}

export default test2FASystem;
