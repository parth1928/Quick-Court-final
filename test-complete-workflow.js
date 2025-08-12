// Test the complete facility approval workflow
async function testCompleteWorkflow() {
  try {
    console.log('=== COMPLETE FACILITY APPROVAL WORKFLOW TEST ===\n');
    
    // 1. Check pending facilities
    console.log('1. Checking pending facilities...');
    const pendingResponse = await fetch('http://localhost:3000/api/admin/facilities/approval?status=pending');
    const pendingData = await pendingResponse.json();
    console.log(`   Pending facilities: ${pendingData.facilities.length}`);
    
    // 2. Check approved facilities
    console.log('2. Checking approved facilities...');
    const approvedResponse = await fetch('http://localhost:3000/api/admin/facilities/approval?status=approved');
    const approvedData = await approvedResponse.json();
    console.log(`   Approved facilities: ${approvedData.facilities.length}`);
    
    if (approvedData.facilities.length > 0) {
      const approvedFacility = approvedData.facilities[0];
      console.log(`   First approved facility: ${approvedFacility.name}`);
      console.log(`   - Status: ${approvedFacility.status}`);
      console.log(`   - Approval Status: ${approvedFacility.approvalStatus}`);
      console.log(`   - Owner: ${approvedFacility.owner.name}`);
      
      // 3. Check if it appears in user dashboard (facilities with Active status)
      console.log('\n3. Checking if approved facility appears in general facilities...');
      const facilitiesResponse = await fetch('http://localhost:3000/api/facilities');
      
      if (facilitiesResponse.ok) {
        const facilitiesData = await facilitiesResponse.json();
        const activeFacilities = facilitiesData.filter(f => f.status === 'Active');
        console.log(`   Total active facilities in system: ${activeFacilities.length}`);
        
        const ourFacility = activeFacilities.find(f => f._id === approvedFacility._id);
        if (ourFacility) {
          console.log(`   ✅ Approved facility "${ourFacility.name}" is visible in user dashboard!`);
        } else {
          console.log(`   ❌ Approved facility not found in user dashboard`);
        }
      } else {
        console.log('   Could not check general facilities API');
      }
    }
    
    console.log('\n=== WORKFLOW TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Error in workflow test:', error);
  }
}

testCompleteWorkflow();
