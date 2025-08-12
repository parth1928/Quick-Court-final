// Test script to debug booking cancellation
const testCancelBooking = async () => {
  try {
    // Get a sample booking ID (you'll need to replace this with actual ID)
    const bookingId = '66ba57b93e6e08a90e2b5678'; // Replace with actual booking ID
    const token = 'your_jwt_token'; // Replace with actual token
    
    console.log('Testing booking cancellation...');
    console.log('Booking ID:', bookingId);
    
    const response = await fetch(`http://localhost:3000/api/users/me/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'cancel',
        reason: 'Test cancellation'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.text();
    console.log('Response body:', result);
    
    try {
      const jsonResult = JSON.parse(result);
      console.log('Parsed result:', jsonResult);
    } catch (parseError) {
      console.log('Could not parse as JSON:', parseError.message);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

// To test specific ObjectId validation
const testObjectIdValidation = () => {
  const mongoose = require('mongoose');
  
  const testIds = [
    '66ba57b93e6e08a90e2b5678', // Valid
    '123', // Invalid
    'invalid-id', // Invalid
    '', // Empty
    null, // Null
  ];
  
  testIds.forEach(id => {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    console.log(`ID: ${id} -> Valid: ${isValid}`);
  });
};

console.log('=== ObjectId Validation Test ===');
testObjectIdValidation();

console.log('\n=== Manual Test Instructions ===');
console.log('1. Replace bookingId with actual booking ID from your database');
console.log('2. Replace token with actual JWT token from localStorage');
console.log('3. Run: node test-cancel-booking.js');

module.exports = { testCancelBooking, testObjectIdValidation };
