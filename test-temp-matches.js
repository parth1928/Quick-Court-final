// Test the temporary matches endpoint (no auth required)

async function testTempMatches() {
  try {
    console.log('🧪 Testing temporary matches API (no auth)...');
    
    // Test GET first
    console.log('\n📖 Testing GET matches...');
    const getResponse = await fetch('http://localhost:3000/api/matches-temp', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`GET Status: ${getResponse.status}`);
    if (getResponse.ok) {
      const getResult = await getResponse.json();
      console.log('✅ Current matches:', getResult.matches?.length || 0);
      if (getResult.matches?.length > 0) {
        console.log('Latest match:', getResult.matches[0]);
      }
    } else {
      const error = await getResponse.text();
      console.log('❌ GET failed:', error);
    }
    
    // Test POST - create new match
    console.log('\n📝 Testing POST match creation...');
    const testData = {
      sport: 'Basketball',
      venueId: 'auto-create-elite-sports',
      date: '2025-08-15',
      time: '6:00 PM - 8:00 PM',
      playersNeeded: 4,
      prizeAmount: 100,
      courtFees: 50,
      description: 'Test match via temp API'
    };
    
    console.log('Sending data:', JSON.stringify(testData, null, 2));
    
    const postResponse = await fetch('http://localhost:3000/api/matches-temp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`POST Status: ${postResponse.status}`);
    
    if (postResponse.ok) {
      const postResult = await postResponse.json();
      console.log('✅ Match created successfully!');
      console.log('New match:', JSON.stringify(postResult.match, null, 2));
    } else {
      const error = await postResponse.text();
      console.log('❌ POST failed:', error);
    }
    
    // Test GET again to see if match was added
    console.log('\n📖 Testing GET matches again...');
    const getResponse2 = await fetch('http://localhost:3000/api/matches-temp');
    
    if (getResponse2.ok) {
      const getResult2 = await getResponse2.json();
      console.log(`✅ Total matches now: ${getResult2.matches?.length || 0}`);
    }
    
    console.log('\n🎉 Temporary API test completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testTempMatches();
