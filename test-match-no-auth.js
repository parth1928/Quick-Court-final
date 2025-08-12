// Test match creation using the test API (no auth required)

async function testMatchCreationNoAuth() {
  try {
    console.log('🧪 Testing match creation API (no auth)...');
    
    // First test: GET matches to see current state
    console.log('\n📖 Getting current matches...');
    const getResponse = await fetch('http://localhost:3000/api/matches-test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`GET Status: ${getResponse.status}`);
    const getResult = await getResponse.text();
    console.log('Current matches:', getResult);
    
    // Create a test venue first
    console.log('\n🏢 Creating test venue...');
    const venueData = {
      name: 'Test Sports Complex',
      description: 'Test venue for match creation',
      sports: ['Basketball', 'Tennis', 'Badminton'],
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'India'
      },
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      },
      contactPhone: '1234567890',
      contactEmail: 'test@venue.com'
    };
    
    const venueResponse = await fetch('http://localhost:3000/api/venues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(venueData)
    });
    
    console.log(`Venue creation status: ${venueResponse.status}`);
    let venueId = '507f1f77bcf86cd799439012'; // fallback ID
    
    if (venueResponse.ok) {
      const venueResult = await venueResponse.json();
      console.log('Venue created:', venueResult);
      venueId = venueResult.data?._id || venueResult._id || venueId;
    } else {
      console.log('Venue creation failed, using fallback ID');
    }
    
    // Test data for match creation
    const testData = {
      sport: 'Basketball',
      venueId: venueId,
      date: '2025-08-15',
      time: '6:00 PM - 8:00 PM',
      playersNeeded: 4,
      prizeAmount: 100,
      description: 'Test match creation without auth'
    };
    
    console.log('\n📝 Creating match...');
    console.log('Match data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/matches-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`\n📡 Response status: ${response.status}`);
    
    const result = await response.text();
    console.log('Response body:', result);
    
    if (response.ok) {
      try {
        const jsonResult = JSON.parse(result);
        console.log('\n✅ Match created successfully!');
        console.log('Match details:', JSON.stringify(jsonResult, null, 2));
      } catch (parseError) {
        console.log('✅ Match created (non-JSON response)');
      }
    } else {
      console.log('\n❌ Match creation failed');
    }
    
    // Test GET again to see if match was added
    console.log('\n📖 Getting matches after creation...');
    const getResponse2 = await fetch('http://localhost:3000/api/matches-test', {
      method: 'GET'
    });
    
    const getResult2 = await getResponse2.text();
    console.log('Updated matches:', getResult2);
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testMatchCreationNoAuth();
