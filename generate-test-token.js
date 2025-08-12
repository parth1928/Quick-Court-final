const jwt = require('jsonwebtoken');

// Must match the JWT_SECRET used by the server
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

console.log('🔑 Using JWT_SECRET:', JWT_SECRET ? `${JWT_SECRET.substring(0, 10)}...` : 'Missing');

// Create a test user payload
const userPayload = {
  userId: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId format
  email: 'test@example.com',
  role: 'user'
};

// Generate token
const token = jwt.sign(userPayload, JWT_SECRET, { 
  expiresIn: '24h'
});

console.log('✅ Generated JWT token:');
console.log(token);
console.log('');
console.log('📋 Test commands:');
console.log('');
console.log('# Test auth debug endpoint:');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/debug-auth`);
console.log('');
console.log('# Test matches endpoint:');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/matches`);
console.log('');
console.log('# Save token to localStorage (browser console):');
console.log(`localStorage.setItem('token', '${token}');`);
console.log('');

// Verify the token works
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token verification successful:', decoded);
} catch (error) {
  console.error('❌ Token verification failed:', error.message);
}
