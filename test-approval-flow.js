// Test the facility approval functionality
async function testFacilityApproval() {
  try {
    console.log('Testing facility approval...');
    
    // First, get the pending facility
    const getResponse = await fetch('http://localhost:3000/api/admin/facilities/approval?status=pending');
    const getData = await getResponse.json();
    
    if (!getData.facilities || getData.facilities.length === 0) {
      console.log('No pending facilities to test with');
      return;
    }
    
    const facility = getData.facilities[0];
    console.log('Found pending facility:', facility.name, 'ID:', facility._id);
    
    // Try to approve it
    const approvalResponse = await fetch(`http://localhost:3000/api/admin/facilities/approval/${facility._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'approve',
        adminId: '6899b79e3678b456043aca84' // Use actual admin ID
      })
    });
    
    console.log('Approval response status:', approvalResponse.status);
    
    if (!approvalResponse.ok) {
      const error = await approvalResponse.json();
      console.error('Approval failed:', error);
      return;
    }
    
    const result = await approvalResponse.json();
    console.log('Approval successful:', result);
    
    // Check if it's now approved
    const checkResponse = await fetch('http://localhost:3000/api/admin/facilities/approval?status=approved');
    const checkData = await checkResponse.json();
    
    console.log('Approved facilities count:', checkData.facilities.length);
    
    // Also check if it appears in pending (should be 0 now)
    const pendingResponse = await fetch('http://localhost:3000/api/admin/facilities/approval?status=pending');
    const pendingData = await pendingResponse.json();
    
    console.log('Pending facilities count after approval:', pendingData.facilities.length);
    
  } catch (error) {
    console.error('Error testing approval:', error);
  }
}

testFacilityApproval();
