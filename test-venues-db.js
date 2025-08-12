const mongoose = require('mongoose');

// Use the same URI from your lib/db/connect.ts
const MONGODB_URI = 'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
    
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📂 Available collections:', collections.map(c => c.name));
    
    // Check venues collection
    const venuesCollection = db.collection('venues');
    const venueCount = await venuesCollection.countDocuments();
    console.log(`📊 Total venues in database: ${venueCount}`);
    
    if (venueCount > 0) {
      console.log('\n🔍 Sample venue data:');
      const sampleVenue = await venuesCollection.findOne();
      console.log(JSON.stringify(sampleVenue, null, 2));
      
      // Check approved venues
      const approvedCount = await venuesCollection.countDocuments({ approvalStatus: 'approved' });
      console.log(`\n✅ Approved venues: ${approvedCount}`);
      
      if (approvedCount > 0) {
        const approvedVenue = await venuesCollection.findOne({ approvalStatus: 'approved' });
        console.log('\n🔍 Sample approved venue:');
        console.log(JSON.stringify(approvedVenue, null, 2));
      }
    } else {
      console.log('⚠️ No venues found in database');
      
      // Create a test venue
      console.log('Creating a test venue...');
      const testVenue = {
        name: 'Test Sports Complex',
        description: 'A test venue for demonstration',
        sports: ['Basketball', 'Tennis'],
        sportsOffered: ['Basketball', 'Tennis'],
        startingPrice: 500,
        pricePerHour: 500,
        rating: 4.5,
        images: ['/placeholder.svg'],
        address: {
          city: 'Mumbai',
          state: 'Maharashtra',
          street: 'Test Street',
          zipCode: '400001',
          country: 'India'
        },
        shortLocation: 'Mumbai',
        operatingHours: {
          open: '06:00',
          close: '22:00'
        },
        approvalStatus: 'approved',
        status: 'approved',
        isActive: true,
        amenities: ['Parking', 'Restrooms', 'Drinking Water'],
        totalReviews: 50,
        reviewCount: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await venuesCollection.insertOne(testVenue);
      console.log('✅ Test venue created successfully');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 This looks like a DNS/network issue. Check your internet connection and MongoDB Atlas configuration.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testConnection();
