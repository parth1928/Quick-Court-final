const mongoose = require('mongoose');

// Use the same connection string from your db.ts
const MONGODB_URI = 'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';

// Define facility schema
const facilitySchema = new mongoose.Schema({}, { strict: false });
const Facility = mongoose.model('Facility', facilitySchema);

async function findYoooooFacility() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Search for facilities by name
    const yoooooFacilities = await Facility.find({ 
      name: { $regex: /yoo/i } 
    });
    
    console.log(`Found ${yoooooFacilities.length} facilities with "yoo" in name:`);
    yoooooFacilities.forEach(f => {
      console.log(`- ID: ${f._id}`);
      console.log(`  Name: ${f.name}`);
      console.log(`  Status: ${f.status}`);
      console.log(`  Approval Status: ${f.approvalStatus}`);
      console.log(`  Location: ${f.location || f.shortLocation}`);
      console.log('---');
    });
    
    // Also check all pending facilities
    const pendingFacilities = await Facility.find({ 
      $or: [
        { status: 'pending' },
        { approvalStatus: 'pending' }
      ]
    });
    
    console.log(`\nAll pending facilities (${pendingFacilities.length}):`);
    pendingFacilities.forEach(f => {
      console.log(`- ID: ${f._id}`);
      console.log(`  Name: ${f.name}`);
      console.log(`  Status: ${f.status}`);
      console.log(`  Approval Status: ${f.approvalStatus}`);
      console.log('---');
    });
    
    // Show all facilities created recently
    const recentFacilities = await Facility.find({})
      .sort({ createdAt: -1 })
      .limit(5);
      
    console.log(`\nMost recent 5 facilities:`);
    recentFacilities.forEach(f => {
      console.log(`- ID: ${f._id}`);
      console.log(`  Name: ${f.name}`);
      console.log(`  Created: ${f.createdAt}`);
      console.log(`  Status: ${f.status}`);
      console.log(`  Approval Status: ${f.approvalStatus}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

findYoooooFacility();
