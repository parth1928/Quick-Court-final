/**
 * Simple Booking API Test
 * Tests the booking API with minimal setup
 */

async function testBookingSimple() {
  try {
    console.log('🚀 Testing booking API...');
    
    // Test data
    const bookingData = {
      venueName: 'Test Arena',
      courtName: 'Court 1',
      sportType: 'Basketball',
      venueAddress: '123 Test Street, Mumbai, Maharashtra, 400001, India',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // Tomorrow + 2 hours
      totalPrice: 1000,
      pricingBreakdown: {
        baseRate: 800,
        tax: 144,
        platformFee: 56,
        currency: 'INR'
      },
      paymentStatus: 'paid',
      paymentId: 'test_payment_123',
      status: 'confirmed',
      notes: 'Test booking'
    };
    
    // Create a simple JWT token for testing
    const testUserId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
    const testToken = 'Bearer test-token-for-' + testUserId;
    
    console.log('📋 Request data:', JSON.stringify(bookingData, null, 2));
    
    // Make request
    const response = await fetch('http://localhost:3001/api/users/me/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': testToken
      },
      body: JSON.stringify(bookingData)
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);
    
    const responseText = await response.text();
    console.log('📊 Raw response:', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('📊 Parsed response:', JSON.stringify(responseJson, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError.message);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run test
testBookingSimple().then(() => {
  console.log('🏁 Test completed');
}).catch(error => {
  console.error('💥 Test suite failed:', error);
});
