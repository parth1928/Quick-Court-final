// Test the exact same request the frontend is making
async function testFrontendRequest() {
  try {
    console.log('Testing exact frontend request...');
    
    // Get a pending venue
    const pendingResponse = await fetch('http://localhost:3000/api/admin/venues/approval?status=pending');
    const pendingData = await pendingResponse.json();
    
    if (pendingData.venues.length === 0) {
      console.log('No pending venues to test');
      return;
    }
    
    const venue = pendingData.venues[0];
    console.log('Testing venue:', venue.name, 'ID:', venue._id);
    
    // Simulate the exact frontend request
    const requestBody = {
      action: 'approve',
      reason: undefined, // This is what frontend sends for approve
      adminId: 'admin_user_id' // This is the fallback value
    };
    
    console.log('Frontend request body:', requestBody);
    
    const response = await fetch(`http://localhost:3000/api/admin/venues/approval/${venue._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Read response as text first to see raw content
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    if (responseText) {
      try {
        const responseJson = JSON.parse(responseText);
        console.log('Parsed response:', responseJson);
      } catch (e) {
        console.error('Could not parse response as JSON:', e);
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testFrontendRequest();
