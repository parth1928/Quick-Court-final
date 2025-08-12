// Test the venue approval system
async function testVenueApproval() {
  try {
    console.log('Testing venue approval system...');
    
    // 1. Check pending venues
    console.log('1. Fetching pending venues...');
    const pendingResponse = await fetch('http://localhost:3000/api/admin/venues/approval?status=pending');
    
    if (!pendingResponse.ok) {
      console.error('Failed to fetch pending venues:', pendingResponse.status);
      return;
    }
    
    const pendingData = await pendingResponse.json();
    console.log(`Found ${pendingData.venues.length} pending venues:`);
    
    pendingData.venues.forEach((venue, index) => {
      console.log(`${index + 1}. ${venue.name}`);
      console.log(`   Owner: ${venue.owner.name} (${venue.owner.email})`);
      console.log(`   Location: ${venue.shortLocation}`);
      console.log(`   Sports: ${venue.sports.join(', ')}`);
      console.log(`   Status: ${venue.status} / Approval: ${venue.approvalStatus}`);
      console.log(`   ID: ${venue._id}`);
      console.log('---');
    });
    
    // 2. Check approved venues
    console.log('\n2. Fetching approved venues...');
    const approvedResponse = await fetch('http://localhost:3000/api/admin/venues/approval?status=approved');
    
    if (approvedResponse.ok) {
      const approvedData = await approvedResponse.json();
      console.log(`Found ${approvedData.venues.length} approved venues`);
      
      if (approvedData.venues.length > 0) {
        console.log('First few approved venues:');
        approvedData.venues.slice(0, 3).forEach((venue, index) => {
          console.log(`${index + 1}. ${venue.name} (${venue.shortLocation})`);
        });
      }
    }
    
    // 3. If there are pending venues, test approval
    if (pendingData.venues.length > 0) {
      const testVenue = pendingData.venues[0];
      console.log(`\n3. Testing approval of venue: ${testVenue.name}`);
      
      const approvalResponse = await fetch(`http://localhost:3000/api/admin/venues/approval/${testVenue._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          adminId: '6899b79e3678b456043aca84' // Use admin user ID
        })
      });
      
      if (approvalResponse.ok) {
        const result = await approvalResponse.json();
        console.log('✅ Venue approved successfully!');
        console.log(`   Name: ${result.venue.name}`);
        console.log(`   Status: ${result.venue.status}`);
        console.log(`   Approval Status: ${result.venue.approvalStatus}`);
      } else {
        const error = await approvalResponse.json();
        console.error('❌ Approval failed:', error);
      }
    } else {
      console.log('\n3. No pending venues to test approval');
    }
    
  } catch (error) {
    console.error('Error testing venue approval:', error);
  }
}

testVenueApproval();
