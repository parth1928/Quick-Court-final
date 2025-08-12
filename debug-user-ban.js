// Debug test for user ban functionality
console.log('Starting user ban debug test...');

async function debugUserBan() {
  try {
    // First, get the list of users
    console.log('1. Fetching users...');
    const usersResponse = await fetch('/api/admin/users?limit=3');
    console.log('Users response status:', usersResponse.status);
    
    const usersData = await usersResponse.json();
    console.log('Users data:', usersData);
    
    if (!usersData.success || !usersData.users || usersData.users.length === 0) {
      console.error('No users found');
      return;
    }
    
    // Try to ban the first user
    const testUser = usersData.users[0];
    console.log('2. Testing ban on user:', {
      id: testUser._id,
      name: testUser.name,
      currentStatus: testUser.status
    });
    
    const banResponse = await fetch(`/api/admin/users/${testUser._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action: 'ban'
      }),
    });
    
    console.log('Ban response status:', banResponse.status);
    console.log('Ban response headers:', Object.fromEntries(banResponse.headers.entries()));
    
    const banResult = await banResponse.json();
    console.log('Ban response data:', banResult);
    
    if (banResponse.ok && banResult.success) {
      console.log('✅ Ban successful');
      
      // Try to unban
      console.log('3. Testing unban...');
      const unbanResponse = await fetch(`/api/admin/users/${testUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'unban'
        }),
      });
      
      const unbanResult = await unbanResponse.json();
      console.log('Unban response status:', unbanResponse.status);
      console.log('Unban response data:', unbanResult);
      
      if (unbanResponse.ok && unbanResult.success) {
        console.log('✅ Unban successful');
      } else {
        console.log('❌ Unban failed:', unbanResult);
      }
    } else {
      console.log('❌ Ban failed:', banResult);
    }
    
  } catch (error) {
    console.error('❌ Debug test error:', error);
  }
}

// Run in browser console
if (typeof window !== 'undefined') {
  debugUserBan();
}
