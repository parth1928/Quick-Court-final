// Debug tournament registration API
const debugTournamentRegistration = async () => {
  console.log('🔍 Debugging Tournament Registration...')
  
  try {
    // First check if tournament exists and its status
    const tournamentResponse = await fetch('/api/tournaments/1')
    console.log('📊 Tournament fetch status:', tournamentResponse.status)
    
    if (tournamentResponse.ok) {
      const tournamentData = await tournamentResponse.json()
      console.log('🏆 Tournament data:', JSON.stringify(tournamentData, null, 2))
      
      // Check specific fields that might cause 400 error
      if (tournamentData.tournament) {
        const tournament = tournamentData.tournament
        console.log('📋 Key validation fields:')
        console.log('  - Status:', tournament.status)
        console.log('  - Registration deadline:', tournament.registrationDeadline)
        console.log('  - Current participants:', tournament.participants?.length || 0)
        console.log('  - Max participants:', tournament.maxParticipants)
        console.log('  - Current date:', new Date().toISOString())
        console.log('  - Deadline passed?', new Date() > new Date(tournament.registrationDeadline))
      }
    } else {
      console.error('❌ Failed to fetch tournament:', await tournamentResponse.text())
    }
    
    // Now test registration
    const getAuthToken = () => {
      let token = localStorage.getItem('token')
      if (token) return token
      
      const value = `; ${document.cookie}`;
      const parts = value.split(`; authToken=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        if (cookieValue) return decodeURIComponent(cookieValue);
      }
      return null;
    }
    
    const token = getAuthToken();
    if (!token) {
      console.error('❌ No auth token found')
      return
    }
    
    // Minimal registration payload
    const registrationPayload = {
      participantType: "individual",
      individualName: "Test User",
      individualEmail: "test@example.com",
      individualPhone: "+91 98765 43210",
      emergencyContact: "Emergency Contact",
      emergencyPhone: "+91 98765 43211",
      paymentMethod: "card",
      paymentId: "tx_test_" + Date.now(),
      paymentStatus: "paid",
      termsAccepted: true,
      waiverAccepted: true,
      emailUpdates: true
    }
    
    console.log('📝 Sending registration payload:', JSON.stringify(registrationPayload, null, 2))
    
    const response = await fetch('/api/tournaments/1/register', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationPayload)
    })
    
    console.log('📡 Registration response status:', response.status)
    console.log('📡 Registration response headers:', Object.fromEntries(response.headers.entries()))
    
    const result = await response.json()
    console.log('📋 Registration response body:', JSON.stringify(result, null, 2))
    
    if (!response.ok) {
      console.error('❌ Registration failed with status:', response.status)
      console.error('❌ Error details:', result)
    } else {
      console.log('✅ Registration successful!')
    }
    
  } catch (error) {
    console.error('💥 Debug error:', error)
  }
}

// Export for browser testing
if (typeof window !== 'undefined') {
  window.debugTournamentRegistration = debugTournamentRegistration
  console.log('🔍 Debug loaded. Run: debugTournamentRegistration()')
}

module.exports = { debugTournamentRegistration }
