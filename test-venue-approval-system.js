// Test the complete venue approval system
async function testVenueApprovalSystem() {
  try {
    console.log('=== TESTING VENUE APPROVAL SYSTEM ===\n');
    
    // 1. Test fetching pending venues
    console.log('1. Testing API: Get pending venues');
    const pendingResponse = await fetch('http://localhost:3000/api/admin/venues/approval?status=pending');
    
    if (!pendingResponse.ok) {
      console.error('❌ Failed to fetch pending venues:', pendingResponse.status);
      return;
    }
    
    const pendingData = await pendingResponse.json();
    console.log(`✅ Found ${pendingData.venues.length} pending venues`);
    
    if (pendingData.venues.length > 0) {
      console.log('\nPending venues:');
      pendingData.venues.slice(0, 3).forEach((venue, index) => {
        console.log(`${index + 1}. ${venue.name}`);
        console.log(`   Owner: ${venue.owner.name}`);
        console.log(`   Location: ${venue.shortLocation}`);
        console.log(`   Sports: ${venue.sports.join(', ')}`);
        console.log(`   Status: ${venue.status} / Approval: ${venue.approvalStatus}`);
        console.log('---');
      });
      
      // 2. Test approving a venue
      const testVenue = pendingData.venues[0];
      console.log(`\n2. Testing approval of venue: ${testVenue.name}`);
      
      const approvalResponse = await fetch(`http://localhost:3000/api/admin/venues/approval/${testVenue._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          adminId: '6899b79e3678b456043aca84'
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
      
      // 3. Test checking approved venues
      console.log('\n3. Testing API: Get approved venues');
      const approvedResponse = await fetch('http://localhost:3000/api/admin/venues/approval?status=approved');
      const approvedData = await approvedResponse.json();
      console.log(`✅ Found ${approvedData.venues.length} approved venues`);
      
      // 4. Test if approved venue appears in public venues list
      console.log('\n4. Testing if approved venues appear in public venues list');
      const publicVenuesResponse = await fetch('http://localhost:3000/api/venues?view=card&limit=50');
      
      if (publicVenuesResponse.ok) {
        const publicData = await publicVenuesResponse.json();
        const publicVenues = publicData.venues.filter(v => v.type === 'venue' || !v.type);
        console.log(`✅ Public venues list has ${publicVenues.length} venues`);
        
        // Check if our approved venue is there
        const ourVenue = publicVenues.find(v => v.name === testVenue.name);
        if (ourVenue) {
          console.log(`✅ Approved venue "${testVenue.name}" is visible in public venues list!`);
        } else {
          console.log(`❌ Approved venue "${testVenue.name}" not found in public list`);
        }
      } else {
        console.log('❌ Could not check public venues list');
      }
      
    } else {
      console.log('No pending venues to test with');
    }
    
    console.log('\n=== VENUE APPROVAL SYSTEM TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Error testing venue approval system:', error);
  }
}

testVenueApprovalSystem();
