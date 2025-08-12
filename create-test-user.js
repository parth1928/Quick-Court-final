// Create a test user and get a valid JWT token
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const MONGODB_URI = 'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';
const JWT_SECRET = 'your-secret-key'; // Same as in auth.ts

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  phone: String,
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false }
}, { timestamps: true });

async function createTestUserAndToken() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    // Check if test user exists
    let testUser = await User.findOne({ email: 'testuser@example.com' });
    
    if (!testUser) {
      console.log('👤 Creating test user...');
      const hashedPassword = await bcrypt.hash('testpassword', 10);
      
      testUser = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: hashedPassword,
        role: 'user',
        phone: '+1234567890',
        isActive: true,
        emailVerified: true
      });
      
      console.log('✅ Test user created:', testUser._id);
    } else {
      console.log('✅ Test user found:', testUser._id);
    }
    
    // Create JWT token
    const tokenPayload = {
      userId: testUser._id.toString(),
      email: testUser.email,
      role: testUser.role
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
    
    console.log('🎫 Generated JWT token:');
    console.log(token);
    
    console.log('\n📋 Token payload:');
    console.log(JSON.stringify(tokenPayload, null, 2));
    
    // Test token verification
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      console.log('\n✅ Token verification successful:');
      console.log(JSON.stringify(verified, null, 2));
    } catch (verifyError) {
      console.log('❌ Token verification failed:', verifyError.message);
    }
    
    console.log('\n🧪 You can now use this token to test the API:');
    console.log(`Authorization: Bearer ${token}`);
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

createTestUserAndToken();
