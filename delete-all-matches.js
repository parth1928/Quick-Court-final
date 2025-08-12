const dbConnect = require('./lib/db/connect.js').default;
const Match = require('./models/Match.js').default;

(async () => {
  try {
    console.log('🔌 Connecting to database...');
    await dbConnect();
    
    console.log('🔍 Checking current matches...');
    const currentCount = await Match.countDocuments();
    console.log(`📊 Found ${currentCount} matches in database`);
    
    if (currentCount === 0) {
      console.log('✅ No matches to delete');
      process.exit(0);
    }
    
    console.log('🗑️ Deleting all matches...');
    const result = await Match.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} matches`);
    console.log('🧹 Database cleaned - all matches removed');
    
    // Verify deletion
    const finalCount = await Match.countDocuments();
    if (finalCount === 0) {
      console.log('✅ Verification: Database is now clean');
    } else {
      console.warn(`⚠️ Warning: ${finalCount} matches still remain`);
    }
    
  } catch (error) {
    console.error('❌ Error deleting matches:', error.message);
    console.error(error.stack);
  }
  
  process.exit(0);
})();
