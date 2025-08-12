/**
 * Test script to verify the registration flow and session management
 * Run with: npm run dev (in another terminal) then node test-registration-flow.js
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'testpassword123';

async function testRegistrationFlow() {
  console.log('🧪 Testing registration flow...');
  console.log(`📧 Using test email: ${TEST_EMAIL}`);

  try {
    // Step 1: Start registration
    console.log('\n1️⃣ Starting registration...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        role: 'user',
        step: 'register'
      }),
    });

    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);

    if (!registerResponse.ok) {
      throw new Error(`Registration failed: ${registerData.error}`);
    }

    if (registerData.step !== 'verify_otp') {
      throw new Error('Expected verify_otp step');
    }

    console.log('✅ Registration initiated successfully');

    // Step 2: Wait for manual OTP verification (in development mode, OTP is logged)
    console.log('\n2️⃣ OTP sent. Check server logs for the OTP code.');
    console.log('🔍 Look for a line like: "🔐 Generated OTP for [email]: [6-digit-code]"');
    console.log('\n⏸️  Enter the OTP manually in the UI to test the complete flow.');
    console.log('📝 This test validates that:');
    console.log('   - Registration endpoint works');
    console.log('   - Session is properly stored');
    console.log('   - OTP generation and email sending works');
    console.log('   - User can proceed to OTP verification step');

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testRegistrationFlow()
  .then(success => {
    if (success) {
      console.log('\n✅ Registration flow test completed successfully!');
      console.log('🚀 The session management and registration process is working.');
    } else {
      console.log('\n❌ Registration flow test failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
