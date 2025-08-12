/**
 * Test Admin Login Script
 * Tests if admin login works and returns proper JWT token
 */

async function testAdminLogin() {
  try {
    console.log('🚀 Testing admin login...');
    
    const loginData = {
      email: 'admin@quickcourt.com',
      password: 'admin123'
    };
    
    console.log('📋 Login request data:', loginData);
    
    // Make login request
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);
    
    const responseText = await response.text();
    console.log('📊 Raw response:', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('📊 Parsed response:', JSON.stringify(responseJson, null, 2));
      
      if (responseJson.token) {
        console.log('🎉 LOGIN SUCCESSFUL!');
        console.log('🔐 JWT Token:', responseJson.token.substring(0, 50) + '...');
        
        // Decode token to verify contents
        const payload = JSON.parse(Buffer.from(responseJson.token.split('.')[1], 'base64url').toString());
        console.log('🔍 Token payload:', payload);
        
        return responseJson.token;
      } else {
        console.log('❌ LOGIN FAILED');
        console.log('Error:', responseJson.error || responseJson.message);
      }
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError.message);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
  
  return null;
}

async function testAdminAPI(token) {
  if (!token) {
    console.log('⏭️ Skipping API test - no token');
    return;
  }
  
  try {
    console.log('\n🔧 Testing admin API access...');
    
    // Test admin dashboard access
    const response = await fetch('http://localhost:3001/api/admin/venues/approval', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Admin API response status:', response.status);
    
    const responseText = await response.text();
    console.log('📊 Admin API response:', responseText.substring(0, 200) + '...');
    
    if (response.ok) {
      console.log('✅ Admin API access successful!');
    } else {
      console.log('❌ Admin API access failed');
    }
    
  } catch (error) {
    console.error('💥 Admin API test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🎭 Starting admin authentication tests...\n');
  
  const token = await testAdminLogin();
  await testAdminAPI(token);
  
  console.log('\n🏁 Tests completed');
}

runTests().catch(error => {
  console.error('💥 Test suite failed:', error);
});
