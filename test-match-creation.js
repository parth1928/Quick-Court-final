// Test match creation API
require('dotenv').config();
const jwt = require('jsonwebtoken');

// Use the same fallback as the auth.ts file
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function testMatchCreation() {
  try {
    console.log('🧪 Testing match creation API...');
    
    // Create a test JWT token with proper structure
    const testPayload = {
      userId: '66ba7cf28a55c18d5e35b123', // Use a realistic ObjectId format
      email: 'testuser@example.com',
      role: 'user'
    };
    
    const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '24h' });
    console.log('Generated test token for user:', testPayload.email);
    console.log('User ID:', testPayload.userId);
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
    
    // First test the debug auth endpoint
    console.log('\n🔍 Testing authentication...');
    const authResponse = await fetch('http://localhost:3000/api/debug/auth', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Auth test status: ${authResponse.status}`);
    const authResult = await authResponse.text();
    console.log('Auth test result:', authResult);
    
    if (!authResponse.ok) {
      console.log('❌ Authentication failed, stopping test');
      return;
    }
    
    // Test data for match creation
    const testData = {
      sport: 'Basketball',
      venueId: 'auto-create-elite-sports',
      date: '2025-08-15',
      time: '6:00 PM - 8:00 PM',
      playersNeeded: 4,
      prizeAmount: 100,
      courtFees: 50,
      description: 'Test match creation'
    };
    
    console.log('\n📝 Sending match creation request...');
    console.log('Payload:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/matches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`\n📡 Response status: ${response.status}`);
    
    const result = await response.text();
    console.log('Response body:', result);
    
    if (response.ok) {
      try {
        const jsonResult = JSON.parse(result);
        console.log('\n✅ Match created successfully!');
        console.log('Match details:', JSON.stringify(jsonResult, null, 2));
      } catch (parseError) {
        console.log('✅ Match created (non-JSON response)');
      }
    } else {
      console.log('\n❌ Match creation failed');
      try {
        const errorData = JSON.parse(result);
        console.log('Error details:', JSON.stringify(errorData, null, 2));
      } catch (parseError) {
        console.log('Error (raw):', result);
      }
    }
    
    // Test GET endpoint to verify match was created
    console.log('\n📖 Testing GET matches...');
    const getResponse = await fetch('http://localhost:3000/api/matches', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`GET Response status: ${getResponse.status}`);
    const getResult = await getResponse.text();
    
    if (getResponse.ok) {
      try {
        const matches = JSON.parse(getResult);
        console.log(`Found ${matches.matches?.length || 0} matches`);
        if (matches.matches && matches.matches.length > 0) {
          console.log('Latest match:', JSON.stringify(matches.matches[0], null, 2));
        }
      } catch (parseError) {
        console.log('GET result (raw):', getResult);
      }
    } else {
      console.log('GET failed:', getResult);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testMatchCreation();
