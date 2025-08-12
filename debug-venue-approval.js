// Test the venue approval API directly to see what error is occurring
async function testVenueApprovalAPI() {
  try {
    console.log('Testing venue approval API directly...');
    
    // First get a pending venue
    const pendingResponse = await fetch('http://localhost:3000/api/admin/venues/approval?status=pending');
    
    if (!pendingResponse.ok) {
      console.error('Failed to get pending venues:', pendingResponse.status);
      return;
    }
    
    const pendingData = await pendingResponse.json();
    console.log(`Found ${pendingData.venues.length} pending venues`);
    
    if (pendingData.venues.length === 0) {
      console.log('No pending venues to test with');
      return;
    }
    
    const venue = pendingData.venues[0];
    console.log(`Testing approval of: ${venue.name} (ID: ${venue._id})`);
    
    // Try to approve it
    const approvalData = {
      action: 'approve',
      adminId: '6899b79e3678b456043aca84'
    };
    
    console.log('Sending approval request:', approvalData);
    
    const approvalResponse = await fetch(`http://localhost:3000/api/admin/venues/approval/${venue._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(approvalData)
    });
    
    console.log('Response status:', approvalResponse.status);
    console.log('Response headers:', [...approvalResponse.headers.entries()]);
    
    if (!approvalResponse.ok) {
      const errorText = await approvalResponse.text();
      console.error('Error response body:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Parsed error:', errorJson);
      } catch (e) {
        console.error('Could not parse error as JSON');
      }
    } else {
      const result = await approvalResponse.json();
      console.log('✅ Success:', result);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testVenueApprovalAPI();
