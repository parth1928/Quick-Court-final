// Test the facility approval API
const mongoose = require('mongoose');

// Simple connection without deprecated options
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://parthsarthi:quickcourt@quickcourt.kfm4l.mongodb.net/quickcourt');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define facility schema
const facilitySchema = new mongoose.Schema({}, { strict: false });
const Facility = mongoose.model('Facility', facilitySchema);

async function testFacilities() {
  await connectDB();
  
  try {
    // Check all facilities
    const allFacilities = await Facility.find({});
    console.log(`\nTotal facilities in database: ${allFacilities.length}`);
    
    if (allFacilities.length === 0) {
      console.log('No facilities found in database');
      await mongoose.disconnect();
      return;
    }
    
    // Check approval status distribution
    const statusCounts = {};
    allFacilities.forEach(facility => {
      const status = facility.approvalStatus || 'no_approval_status';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    console.log('\nApproval Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    
    // Show facilities with pending status
    const pendingFacilities = await Facility.find({ approvalStatus: 'pending' });
    console.log(`\nPending facilities: ${pendingFacilities.length}`);
    
    if (pendingFacilities.length > 0) {
      console.log('Pending facilities:');
      pendingFacilities.forEach(f => {
        console.log(`  - ${f.name} (ID: ${f._id})`);
      });
    }
    
    // Show facilities without approval status
    const noStatusFacilities = await Facility.find({ 
      $or: [
        { approvalStatus: { $exists: false } },
        { approvalStatus: null }
      ]
    });
    
    console.log(`\nFacilities without approval status: ${noStatusFacilities.length}`);
    if (noStatusFacilities.length > 0) {
      console.log('Facilities needing approval status update:');
      noStatusFacilities.slice(0, 3).forEach(f => {
        console.log(`  - ${f.name} (status: ${f.status})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testFacilities();
