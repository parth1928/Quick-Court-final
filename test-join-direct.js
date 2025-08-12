const fs = require('fs');
const path = require('path');

// Simple test to check join API directly
async function testJoinAPI() {
  console.log('🧪 Testing join API directly...');
  
  try {
    // Read package.json to see if we're in the right directory
    const packagePath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packagePath)) {
      console.log('❌ Not in project root, looking for package.json...');
      return;
    }
    
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log('📦 Project:', packageData.name);
    
    // Check if we have a .env file
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      console.log('✅ Found .env.local file');
    } else {
      console.log('❌ No .env.local file found');
    }
    
    // Try to import and test the join route directly
    console.log('🔍 Looking for join route file...');
    const joinRoutePath = path.join(process.cwd(), 'app', 'api', 'matches', '[id]', 'join', 'route.ts');
    
    if (fs.existsSync(joinRoutePath)) {
      console.log('✅ Found join route at:', joinRoutePath);
      console.log('📄 File size:', fs.statSync(joinRoutePath).size, 'bytes');
    } else {
      console.log('❌ Join route file not found at:', joinRoutePath);
    }
    
    // Check database connection
    console.log('🔌 Testing database connection...');
    try {
      const mongoose = require('mongoose');
      const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quick-court';
      
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Database connected successfully');
      
      // Check if we have Match model
      const Match = mongoose.models.Match;
      if (Match) {
        const matchCount = await Match.countDocuments();
        console.log('📊 Total matches in database:', matchCount);
        
        // Get a sample match
        const sampleMatch = await Match.findOne();
        if (sampleMatch) {
          console.log('🎯 Sample match ID:', sampleMatch._id);
          console.log('🎯 Sample match participants:', sampleMatch.participants?.length || 0);
        }
      } else {
        console.log('❌ Match model not found');
      }
      
      await mongoose.disconnect();
      
    } catch (dbError) {
      console.error('💥 Database error:', dbError.message);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

testJoinAPI();
