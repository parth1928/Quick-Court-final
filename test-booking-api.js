// Test API endpoint for user bookings
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function testBookingAPI() {
  try {
    console.log('🧪 Testing booking API endpoint...');
    
    // First, let's test without authentication to see the error
    console.log('\n1. Testing without authentication:');
    const response1 = await fetch('http://192.168.102.132:3000/api/users/me/bookings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response1.status}`);
    const result1 = await response1.text();
    console.log(`Response: ${result1}`);
    
    // Test with a mock JWT token (you'll need to replace this with a real one)
    console.log('\n2. Testing with mock authentication:');
    
    // Create a simple JWT for testing (replace with actual user data)
    const jwt = require('jsonwebtoken');
    const testPayload = {
      userId: '507f1f77bcf86cd799439011', // Mock ObjectId
      email: 'test@example.com',
      role: 'user'
    };
    
    const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated test token:', token.substring(0, 50) + '...');
    
    const response2 = await fetch('http://192.168.102.132:3000/api/users/me/bookings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Status: ${response2.status}`);
    const result2 = await response2.text();
    console.log(`Response: ${result2}`);
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testBookingAPI();
