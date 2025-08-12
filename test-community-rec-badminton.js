// Test script to verify Community Recreation Center now supports Badminton
const testMatchCreation = async () => {
  try {
    console.log('🏸 Testing Community Recreation Center with Badminton support...')
    
    const matchData = {
      sport: "Badminton",
      venueId: "auto-create-community-rec", 
      date: "2024-01-20",
      time: "10:00",
      playersNeeded: "4",
      prizeAmount: "500",
      courtFees: "200",
      description: "Test badminton match"
    }

    console.log('📝 Creating match with data:', matchData)

    const response = await fetch('http://localhost:3000/api/matches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.TEST_AUTH_TOKEN // You may need to set this
      },
      body: JSON.stringify(matchData)
    })

    const result = await response.json()
    console.log('📥 Response status:', response.status)
    console.log('📥 Response data:', result)

    if (response.ok) {
      console.log('✅ SUCCESS: Community Recreation Center now supports Badminton!')
      console.log('✅ Match created successfully:', result.match?.id)
    } else {
      console.log('❌ FAILED:', result.error)
    }

  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

// Also test venue sport compatibility check
const testVenueSupport = () => {
  console.log('\n🏟️ Testing venue sport compatibility:')
  
  const venues = {
    'auto-create-community-rec': ['Basketball', 'Volleyball', 'Football', 'Cricket', 'Table Tennis', 'Badminton'],
    'auto-create-delhi-hub': ['Table Tennis', 'Badminton', 'Basketball', 'Volleyball'],
    'auto-create-hyderabad-arena': ['Table Tennis', 'Tennis', 'Badminton']
  }
  
  const testSport = 'Badminton'
  
  for (const [venueId, sports] of Object.entries(venues)) {
    const supports = sports.includes(testSport)
    console.log(`${supports ? '✅' : '❌'} ${venueId}: ${supports ? 'SUPPORTS' : 'DOES NOT SUPPORT'} ${testSport}`)
    console.log(`   Available sports: ${sports.join(', ')}`)
  }
}

console.log('🚀 Starting Community Recreation Center Badminton support test...')
testVenueSupport()
testMatchCreation()
