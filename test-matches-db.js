const dbConnect = require('./lib/db/connect.js').default;
const Match = require('./models/Match.js').default;

(async () => {
  try {
    console.log('🔌 Connecting to database...');
    await dbConnect();
    
    console.log('📊 Fetching matches from database...');
    const matches = await Match.find({})
      .populate('venue', 'name location')
      .populate('createdBy', 'name email')
      .populate('participants.user', 'name email')
      .lean();
    
    console.log(`📋 Total matches in database: ${matches.length}`);
    
    if (matches.length === 0) {
      console.log('⚠️ No matches found in database');
    } else {
      console.log('\n🔍 Match details:');
      matches.forEach((match, i) => {
        console.log(`\n${i+1}. ${match.sport} Match`);
        console.log(`   Venue: ${match.venue?.name || 'Unknown'} (${match.venue?.location || 'No location'})`);
        console.log(`   Date & Time: ${match.date?.toDateString()} at ${match.time}`);
        console.log(`   Created by: ${match.createdBy?.name || 'Unknown'} (${match.createdBy?.email || 'No email'})`);
        console.log(`   Status: ${match.status}`);
        console.log(`   Players: ${match.participants?.length || 0}/${match.playersNeeded}`);
        console.log(`   Prize: ₹${match.prizeAmount || 0}`);
        if (match.description) {
          console.log(`   Description: ${match.description}`);
        }
      });
    }
    
    // Check for common issues
    const openMatches = matches.filter(m => m.status === 'Open');
    const futureMatches = matches.filter(m => new Date(m.date) >= new Date());
    
    console.log(`\n📈 Statistics:`);
    console.log(`   Open matches: ${openMatches.length}`);
    console.log(`   Future matches: ${futureMatches.length}`);
    console.log(`   Past matches: ${matches.length - futureMatches.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
  
  process.exit(0);
})();
