// Test script for tournament registration with simplified payment flow
const testTournamentRegistration = async () => {
  console.log('🎯 Testing Tournament Registration Flow...')
  
  try {
    // Test payload similar to what PaySimulator will send
    const registrationPayload = {
      participantType: "individual",
      individualName: "John Doe",
      individualEmail: "john@example.com", 
      individualPhone: "+91 98765 43210",
      emergencyContact: "Jane Doe",
      emergencyPhone: "+91 98765 43211",
      medicalConditions: "",
      previousTournaments: "",
      paymentMethod: "card",
      paymentId: "tx_" + Date.now(),
      paymentStatus: "paid",
      entryFee: 3500,
      termsAccepted: true,
      waiverAccepted: true,
      emailUpdates: true
    }
    
    console.log('📝 Registration payload:', JSON.stringify(registrationPayload, null, 2))
    
    // Get auth token
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
    
    console.log('🔑 Using token:', token.substring(0, 20) + '...')
    
    // Test the registration API
    const response = await fetch('/api/tournaments/1/register', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationPayload)
    })
    
    console.log('📡 Response status:', response.status)
    
    const result = await response.json()
    console.log('📋 Response body:', result)
    
    if (response.ok && result.success) {
      console.log('✅ Tournament registration successful!')
      console.log('🎉 Registration ID:', result.data?.id)
    } else {
      console.log('❌ Registration failed:', result.error || result.message)
    }
    
  } catch (error) {
    console.error('💥 Error testing registration:', error)
  }
}

// Export for browser testing
if (typeof window !== 'undefined') {
  window.testTournamentRegistration = testTournamentRegistration
  console.log('🧪 Tournament registration test loaded. Run: testTournamentRegistration()')
}

module.exports = { testTournamentRegistration }
