const mongoose = require('mongoose');

// Use the same connection string from your db.ts
const MONGODB_URI = 'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';

// Define facility schema
const facilitySchema = new mongoose.Schema({}, { strict: false });
const Facility = mongoose.model('Facility', facilitySchema);

async function updateFacilityApprovalStatus() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all facilities
    const allFacilities = await Facility.find({});
    console.log(`Found ${allFacilities.length} facilities`);

    if (allFacilities.length === 0) {
      console.log('No facilities found in database');
      await mongoose.disconnect();
      return;
    }

    // Find facilities without approval status
    const facilitiesWithoutApprovalStatus = await Facility.find({
      $or: [
        { approvalStatus: { $exists: false } },
        { approvalStatus: null }
      ]
    });

    console.log(`Facilities without approval status: ${facilitiesWithoutApprovalStatus.length}`);

    if (facilitiesWithoutApprovalStatus.length === 0) {
      console.log('All facilities already have approval status');
      await mongoose.disconnect();
      return;
    }

    // Update facilities to have pending approval status
    const updateResult = await Facility.updateMany(
      {
        $or: [
          { approvalStatus: { $exists: false } },
          { approvalStatus: null }
        ]
      },
      {
        $set: {
          approvalStatus: 'pending'
        }
      }
    );

    console.log(`Updated ${updateResult.modifiedCount} facilities with pending approval status`);

    // Verify the update
    const pendingFacilities = await Facility.find({ approvalStatus: 'pending' });
    console.log(`Facilities now with pending status: ${pendingFacilities.length}`);

    // Show some examples
    if (pendingFacilities.length > 0) {
      console.log('\nFacilities now requiring approval:');
      pendingFacilities.slice(0, 5).forEach(facility => {
        console.log(`- ${facility.name} (ID: ${facility._id})`);
      });
    }

  } catch (error) {
    console.error('Error updating facilities:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateFacilityApprovalStatus();
