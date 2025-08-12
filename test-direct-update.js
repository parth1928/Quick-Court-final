const mongoose = require('mongoose');

// Use the same connection string from your db.ts
const MONGODB_URI = 'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';

// Define facility schema (using the same as your model)
const facilitySchema = new mongoose.Schema({
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'Active', 'Inactive', 'Maintenance'],
    default: 'pending'
  }
}, { strict: false });

const Facility = mongoose.model('Facility', facilitySchema);

async function testDirectUpdate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const facilityId = '689a31f8412c0ff73c65cfaa';
    
    // Check current status
    const beforeUpdate = await Facility.findById(facilityId);
    console.log('Before update:');
    console.log('- approvalStatus:', beforeUpdate?.approvalStatus);
    console.log('- status:', beforeUpdate?.status);
    
    // Try direct update
    const updateResult = await Facility.updateOne(
      { _id: facilityId },
      { 
        $set: {
          approvalStatus: 'approved',
          status: 'Active',
          approvedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    console.log('\nUpdate result:', updateResult);
    
    // Check after update
    const afterUpdate = await Facility.findById(facilityId);
    console.log('\nAfter update:');
    console.log('- approvalStatus:', afterUpdate?.approvalStatus);
    console.log('- status:', afterUpdate?.status);
    console.log('- approvedAt:', afterUpdate?.approvedAt);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testDirectUpdate();
