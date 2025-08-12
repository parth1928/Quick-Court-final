const dbConnect = require('./lib/db/connect.js').default;
const Match = require('./models/Match.js').default;
const User = require('./models/User.js').default;

(async () => {
  try {
    console.log('🔌 Connecting to database...');
    await dbConnect();
    
    console.log('👥 Checking users...');
    const users = await User.find({}).lean();
    console.log(`Found ${users.length} users in database`);
    if (users.length > 0) {
      users.slice(0, 3).forEach((user, i) => {
        console.log(`  ${i+1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }
    
    console.log('\n🎯 Checking matches...');
    const matches = await Match.find({}).populate('createdBy', 'name email').lean();
    console.log(`Found ${matches.length} matches in database`);
    
    if (matches.length > 0) {
      matches.slice(0, 3).forEach((match, i) => {
        console.log(`\n${i+1}. ${match.sport} Match`);
        console.log(`   ID: ${match._id}`);
        console.log(`   Created by: ${match.createdBy?.name || 'Unknown'} (${match.createdBy?.email || 'No email'})`);
        console.log(`   Status: ${match.status}`);
        console.log(`   Players: ${match.participants?.length || 0}/${match.playersNeeded}`);
        console.log(`   Date: ${match.date}`);
        console.log(`   Participants:`, match.participants?.map(p => p.user?.toString()) || []);
      });
      
      // Test case: Check if we can find a match by ID
      const firstMatch = matches[0];
      if (firstMatch) {
        console.log(`\n🔍 Testing match lookup for ID: ${firstMatch._id}`);
        const foundMatch = await Match.findById(firstMatch._id);
        if (foundMatch) {
          console.log('✅ Match found by ID successfully');
        } else {
          console.log('❌ Match NOT found by ID');
        }
      }
    } else {
      console.log('ℹ️ No matches found - create a match first to test joining');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
})();
