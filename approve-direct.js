const mongoose = require('mongoose');

// Use the same connection string from your db.ts
const MONGODB_URI = 'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';

// Define facility schema
const facilitySchema = new mongoose.Schema({}, { strict: false });
const Facility = mongoose.model('Facility', facilitySchema);

async function approveYoooooFacilityDirectly() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const facilityId = '689a51c5b72c130ade86471b';
    
    // First check if the facility exists
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      console.log('❌ Facility not found with ID:', facilityId);
      await mongoose.disconnect();
      return;
    }
    
    console.log('Found facility:', facility.name);
    console.log('Current status:', facility.status);
    console.log('Current approval status:', facility.approvalStatus);
    
    // Update the facility to approved status
    const updateResult = await Facility.updateOne(
      { _id: facilityId },
      { 
        $set: {
          approvalStatus: 'approved',
          status: 'Active',
          approvedAt: new Date(),
          approvedBy: '6899b79e3678b456043aca84', // Admin user ID
          updatedAt: new Date()
        }
      }
    );
    
    console.log('Update result:', updateResult);
    
    // Check the updated facility
    const updatedFacility = await Facility.findById(facilityId);
    console.log('\n✅ Facility updated successfully!');
    console.log('- Name:', updatedFacility.name);
    console.log('- Approval Status:', updatedFacility.approvalStatus);
    console.log('- Status:', updatedFacility.status);
    console.log('- Approved At:', updatedFacility.approvedAt);
    
    // Check all active facilities
    const activeFacilities = await Facility.find({ status: 'Active' });
    console.log(`\nTotal active facilities that should show in user panel: ${activeFacilities.length}`);
    activeFacilities.forEach(f => {
      console.log(`- ${f.name} (${f.location || f.shortLocation})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

approveYoooooFacilityDirectly();
