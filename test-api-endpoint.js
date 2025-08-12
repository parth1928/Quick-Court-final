// Test script to check if we can reach the API endpoint
async function testFacilityAPI() {
  try {
    console.log('Testing facility approval API...');
    
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/admin/facilities/approval?status=pending');
    
    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (data.facilities) {
      console.log(`Found ${data.facilities.length} facilities with pending status`);
      
      if (data.facilities.length > 0) {
        console.log('First facility:');
        console.log('- Name:', data.facilities[0].name);
        console.log('- Approval Status:', data.facilities[0].approvalStatus);
        console.log('- Owner:', data.facilities[0].owner?.name || 'No owner info');
      }
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testFacilityAPI();
