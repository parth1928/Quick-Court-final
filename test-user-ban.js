// Test script to verify user ban/unban functionality
const testUserBan = async () => {
  console.log('Testing user ban/unban API...');
  
  try {
    // First, get a list of users
    console.log('1. Fetching users...');
    const usersResponse = await fetch('http://localhost:3000/api/admin/users?limit=5');
    const usersData = await usersResponse.json();
    
    console.log('Users response:', usersData);
    
    if (!usersData.success || !usersData.users || usersData.users.length === 0) {
      console.log('No users found or API error');
      return;
    }
    
    // Get the first active user
    const activeUser = usersData.users.find(user => user.status === 'active');
    
    if (!activeUser) {
      console.log('No active users found to test ban functionality');
      return;
    }
    
    console.log('2. Testing ban on user:', activeUser.name, activeUser._id);
    
    // Test ban
    const banResponse = await fetch(`http://localhost:3000/api/admin/users/${activeUser._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'ban'
      })
    });
    
    const banResult = await banResponse.json();
    console.log('Ban response:', banResult);
    
    if (banResult.success) {
      console.log('✅ User banned successfully');
      
      // Test unban
      console.log('3. Testing unban...');
      const unbanResponse = await fetch(`http://localhost:3000/api/admin/users/${activeUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'unban'
        })
      });
      
      const unbanResult = await unbanResponse.json();
      console.log('Unban response:', unbanResult);
      
      if (unbanResult.success) {
        console.log('✅ User unbanned successfully');
        console.log('🎉 Ban/Unban functionality working correctly!');
      } else {
        console.log('❌ Unban failed:', unbanResult.error);
      }
    } else {
      console.log('❌ Ban failed:', banResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testUserBan();
