/**
 * Test Booking Simulation Script
 * Tests the booking API with simulation data
 */

const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://parthsenapati:parthsenapati@quickcourt.h8jmq.mongodb.net/quickcourt?retryWrites=true&w=majority&appName=QuickCourt';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function createTestUser() {
  console.log('🔌 Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  try {
    // Check if test user exists
    let testUser = await db.collection('users').findOne({ email: 'testuser@example.com' });
    
    if (!testUser) {
      console.log('👤 Creating test user...');
      const result = await db.collection('users').insertOne({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'hashedpassword123',
        role: 'user',
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      testUser = { _id: result.insertedId, email: 'testuser@example.com', role: 'user' };
      console.log('✅ Test user created:', testUser._id);
    } else {
      console.log('✅ Test user found:', testUser._id);
    }
    
    return testUser;
  } finally {
    await client.close();
  }
}

async function generateAuthToken(user) {
  const token = jwt.sign(
    { 
      userId: user._id.toString(), 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  console.log('🔐 Generated auth token for user:', user._id);
  return token;
}

async function testBookingAPI() {
  try {
    console.log('🚀 Starting booking simulation test...\n');
    
    // Create test user
    const testUser = await createTestUser();
    const authToken = await generateAuthToken(testUser);
    
    // Test booking data (simulation)
    const bookingData = {
      venueName: 'Simulation Sports Arena',
      courtName: 'Court 1',
      sportType: 'Basketball',
      venueAddress: '123 Demo Street, Mumbai, Maharashtra, 400001, India',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // Tomorrow + 2 hours
      notes: 'Test booking simulation',
      checkOverlap: false // Skip overlap check for simulation
    };
    
    console.log('📋 Booking request data:');
    console.log(JSON.stringify(bookingData, null, 2));
    console.log();
    
    // Make API request
    console.log('📡 Making API request to /api/users/me/bookings...');
    const response = await fetch(`${BACKEND_URL}/api/users/me/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(bookingData)
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseData = await response.text();
    console.log('📊 Raw response:', responseData);
    
    try {
      const jsonData = JSON.parse(responseData);
      console.log('\n✅ Parsed response:');
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.success) {
        console.log('\n🎉 BOOKING SIMULATION SUCCESSFUL!');
        console.log(`📝 Booking ID: ${jsonData.data.id}`);
        if (jsonData.data.booking) {
          console.log(`🏟️ Venue: ${jsonData.data.booking.venue?.name || 'N/A'}`);
          console.log(`🏆 Court: ${jsonData.data.booking.court?.name || 'N/A'}`);
          console.log(`⏰ Time: ${new Date(jsonData.data.booking.startTime).toLocaleString()} - ${new Date(jsonData.data.booking.endTime).toLocaleString()}`);
          console.log(`💰 Total: ₹${jsonData.data.booking.totalPrice || 'N/A'}`);
        }
      } else {
        console.log('\n❌ BOOKING SIMULATION FAILED');
        console.log('Error:', jsonData.error);
        if (jsonData.details) {
          console.log('Details:', jsonData.details);
        }
      }
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError.message);
      console.error('Raw response was:', responseData);
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Handle uncaught promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  process.exit(1);
});

// Run the test
if (require.main === module) {
  testBookingAPI().then(() => {
    console.log('\n🏁 Test completed');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { testBookingAPI, createTestUser, generateAuthToken };
