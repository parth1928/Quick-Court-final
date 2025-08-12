// Reset the facility to pending and test approval again
async function resetAndTestApproval() {
  try {
    console.log('Resetting facility to pending status...');
    
    // Reset to pending first
    const resetResponse = await fetch('http://localhost:3000/api/admin/facilities/approval/689a31f8412c0ff73c65cfaa', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'reject',
        reason: 'Reset for testing',
        adminId: '6899b79e3678b456043aca84'
      })
    });

    if (resetResponse.ok) {
      console.log('Reset to rejected status');
    }

    // Set back to pending manually for testing
    const mongoose = require('mongoose');
    const MONGODB_URI = 'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(MONGODB_URI);
    const facilitySchema = new mongoose.Schema({}, { strict: false });
    const Facility = mongoose.model('Facility', facilitySchema);
    
    await Facility.updateOne(
      { _id: '689a31f8412c0ff73c65cfaa' },
      { $set: { approvalStatus: 'pending', status: 'pending' } }
    );
    
    console.log('Reset facility to pending status');
    await mongoose.disconnect();

    // Now test approval through API
    console.log('\nTesting approval through API...');
    
    const approvalResponse = await fetch('http://localhost:3000/api/admin/facilities/approval/689a31f8412c0ff73c65cfaa', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'approve',
        adminId: '6899b79e3678b456043aca84'
      })
    });
    
    console.log('Approval response status:', approvalResponse.status);
    
    if (approvalResponse.ok) {
      const result = await approvalResponse.json();
      console.log('Approval result:');
      console.log('- approvalStatus:', result.facility.approvalStatus);
      console.log('- status:', result.facility.status);
      
      // Check if it now appears in approved list
      const approvedResponse = await fetch('http://localhost:3000/api/admin/facilities/approval?status=approved');
      const approvedData = await approvedResponse.json();
      console.log('Approved facilities count:', approvedData.facilities.length);
      
    } else {
      const error = await approvalResponse.json();
      console.error('Approval failed:', error);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

resetAndTestApproval();
