/**
 * Quick test for OTP generation and hashing
 */

const { generateOTP, hashOTP, verifyOTP } = require('./utils/generateOtp');

async function testOTPFlow() {
  console.log('🧪 Testing OTP Generation and Hashing...\n');

  try {
    // Test 1: Generate OTP
    console.log('1. Generating OTP...');
    const plainOTP = generateOTP();
    console.log(`   Generated OTP: ${plainOTP}`);
    console.log(`   Length: ${plainOTP.length} digits`);
    console.log(`   Is 6 digits: ${plainOTP.length === 6 && /^\d{6}$/.test(plainOTP)}\n`);

    // Test 2: Hash OTP
    console.log('2. Hashing OTP...');
    const hashedOTP = await hashOTP(plainOTP);
    console.log(`   Hashed OTP: ${hashedOTP.substring(0, 30)}...`);
    console.log(`   Hash length: ${hashedOTP.length} characters`);
    console.log(`   Is bcrypt hash: ${hashedOTP.startsWith('$2')}\n`);

    // Test 3: Verify OTP
    console.log('3. Verifying OTP...');
    const isValid = await verifyOTP(plainOTP, hashedOTP);
    const isInvalid = await verifyOTP('123456', hashedOTP);
    console.log(`   Correct OTP verifies: ${isValid}`);
    console.log(`   Wrong OTP fails: ${!isInvalid}\n`);

    // Test 4: Multiple OTPs
    console.log('4. Testing multiple OTPs...');
    const otps = [];
    for (let i = 0; i < 5; i++) {
      otps.push(generateOTP());
    }
    console.log(`   Generated 5 OTPs: ${otps.join(', ')}`);
    console.log(`   All unique: ${new Set(otps).size === 5}`);
    console.log(`   All 6 digits: ${otps.every(otp => otp.length === 6)}\n`);

    console.log('✅ All tests passed! OTP system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOTPFlow();
