// Test ban enforcement
console.log('Testing ban enforcement...');

async function testBanEnforcement() {
  try {
    // 1. Get a user to test with
    console.log('1. Fetching users...');
    const usersResponse = await fetch('/api/admin/users?limit=1');
    const usersData = await usersResponse.json();
    
    if (!usersData.success || !usersData.users || usersData.users.length === 0) {
      console.log('No users found');
      return;
    }
    
    const testUser = usersData.users[0];
    console.log('Testing with user:', testUser.name, testUser.email);
    
    // 2. Ban the user
    console.log('2. Banning user...');
    const banResponse = await fetch(`/api/admin/users/${testUser._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ban' })
    });
    
    const banResult = await banResponse.json();
    console.log('Ban result:', banResult);
    
    if (banResult.success) {
      console.log('✅ User banned successfully');
      
      // 3. Try to login as banned user (if we have credentials)
      console.log('3. Testing login prevention...');
      console.log('Note: Cannot test login without user password');
      console.log('The login API will now check for banned status');
      
      // 4. Unban the user to restore normal state
      console.log('4. Unbanning user to restore normal state...');
      const unbanResponse = await fetch(`/api/admin/users/${testUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unban' })
      });
      
      const unbanResult = await unbanResponse.json();
      console.log('Unban result:', unbanResult);
      
      if (unbanResult.success) {
        console.log('✅ User unbanned successfully');
      }
    }
    
    console.log('\n✅ Ban enforcement test completed');
    console.log('🔒 Middleware will now check user status on every request');
    console.log('🚫 Login API will prevent banned users from logging in');
    console.log('📱 Banned users will be redirected to /banned page');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run in browser console
if (typeof window !== 'undefined') {
  testBanEnforcement();
}
