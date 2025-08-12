// Approve the "yooooo" facility
async function approveYoooooFacility() {
  try {
    console.log('Approving the "yooooo" facility...');
    
    const facilityId = '689a51c5b72c130ade86471b';
    const adminId = '6899b79e3678b456043aca84'; // Use the admin user ID
    
    // Approve the facility through API
    const approvalResponse = await fetch(`http://localhost:3000/api/admin/facilities/approval/${facilityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'approve',
        adminId: adminId
      })
    });
    
    console.log('Approval response status:', approvalResponse.status);
    
    if (approvalResponse.ok) {
      const result = await approvalResponse.json();
      console.log('✅ Facility approved successfully!');
      console.log('- Name:', result.facility.name);
      console.log('- Approval Status:', result.facility.approvalStatus);
      console.log('- Status:', result.facility.status);
      console.log('- Owner:', result.facility.owner.name);
      
      // Check if it now appears in approved list
      const approvedResponse = await fetch('http://localhost:3000/api/admin/facilities/approval?status=approved');
      const approvedData = await approvedResponse.json();
      console.log('\nTotal approved facilities:', approvedData.facilities.length);
      
      // Show all approved facilities
      console.log('\nApproved facilities:');
      approvedData.facilities.forEach(f => {
        console.log(`- ${f.name} (Status: ${f.status}, Approval: ${f.approvalStatus})`);
      });
      
    } else {
      const error = await approvalResponse.json();
      console.error('❌ Approval failed:', error);
    }
    
  } catch (error) {
    console.error('Error approving facility:', error);
  }
}

approveYoooooFacility();
