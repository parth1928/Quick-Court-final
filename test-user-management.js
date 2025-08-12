// Test script for user ban functionality
const API_BASE = 'http://localhost:3000';

async function testUserBan() {
  console.log('Testing user ban/unban API...');

  try {
    // 1. First get users to see current data
    console.log('\n1. Fetching users...');
    const usersResponse = await fetch(`${API_BASE}/api/admin/users?limit=5`);
    const usersData = await usersResponse.json();
    console.log('Users response:', JSON.stringify(usersData, null, 2));

    if (!usersData.success || !usersData.users || usersData.users.length === 0) {
      console.log('No users found or API error');
      return;
    }

    // Find a user to test with (look for any active user, case insensitive)
    const testUser = usersData.users.find(user => 
      user.status && user.status.toLowerCase() === 'active'
    );

    if (!testUser) {
      console.log('No active users found to test ban functionality');
      console.log('Available users:', usersData.users.map(u => ({
        id: u._id || u.id,
        name: u.name,
        status: u.status
      })));
      return;
    }

    console.log(`\n2. Testing ban functionality with user: ${testUser.name} (${testUser._id || testUser.id})`);

    // 2. Test banning the user
    const banResponse = await fetch(`${API_BASE}/api/admin/users/${testUser._id || testUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'ban'
      }),
    });

    const banResult = await banResponse.json();
    console.log('Ban response:', banResult);

    if (banResult.success) {
      console.log('✅ User banned successfully');

      // 3. Verify the user is banned
      console.log('\n3. Verifying user is banned...');
      const verifyResponse = await fetch(`${API_BASE}/api/admin/users?limit=5`);
      const verifyData = await verifyResponse.json();
      
      const bannedUser = verifyData.users.find(u => (u._id || u.id) === (testUser._id || testUser.id));
      if (bannedUser) {
        console.log(`User status: ${bannedUser.status}`);
        if (bannedUser.status.toLowerCase() === 'banned') {
          console.log('✅ Ban verified successfully');
        } else {
          console.log('❌ User status not updated to banned');
        }
      }

      // 4. Test unbanning the user
      console.log('\n4. Testing unban functionality...');
      const unbanResponse = await fetch(`${API_BASE}/api/admin/users/${testUser._id || testUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'unban'
        }),
      });

      const unbanResult = await unbanResponse.json();
      console.log('Unban response:', unbanResult);

      if (unbanResult.success) {
        console.log('✅ User unbanned successfully');

        // 5. Verify the user is unbanned
        console.log('\n5. Verifying user is unbanned...');
        const finalVerifyResponse = await fetch(`${API_BASE}/api/admin/users?limit=5`);
        const finalVerifyData = await finalVerifyResponse.json();
        
        const unbannedUser = finalVerifyData.users.find(u => (u._id || u.id) === (testUser._id || testUser.id));
        if (unbannedUser) {
          console.log(`User status: ${unbannedUser.status}`);
          if (unbannedUser.status.toLowerCase() === 'active') {
            console.log('✅ Unban verified successfully');
          } else {
            console.log('❌ User status not restored to active');
          }
        }
      } else {
        console.log('❌ Failed to unban user:', unbanResult.error);
      }

    } else {
      console.log('❌ Failed to ban user:', banResult.error);
    }

  } catch (error) {
    console.error('Error testing ban functionality:', error.message);
  }
}

// Test role change functionality
async function testRoleChange() {
  console.log('\n\n=== Testing Role Change Functionality ===');

  try {
    // Get a user to test with
    const usersResponse = await fetch(`${API_BASE}/api/admin/users?limit=5`);
    const usersData = await usersResponse.json();

    if (!usersData.success || !usersData.users || usersData.users.length === 0) {
      console.log('No users found for role change test');
      return;
    }

    // Find a regular user to promote
    const testUser = usersData.users.find(user => 
      user.role && user.role.toLowerCase() === 'user'
    );

    if (!testUser) {
      console.log('No regular users found to test role change');
      return;
    }

    console.log(`Testing role change with user: ${testUser.name} (${testUser._id || testUser.id})`);

    // Change role to owner
    const roleChangeResponse = await fetch(`${API_BASE}/api/admin/users/${testUser._id || testUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'changeRole',
        newRole: 'owner'
      }),
    });

    const roleChangeResult = await roleChangeResponse.json();
    console.log('Role change response:', roleChangeResult);

    if (roleChangeResult.success) {
      console.log('✅ Role changed successfully');

      // Verify the role change
      const verifyResponse = await fetch(`${API_BASE}/api/admin/users?limit=5`);
      const verifyData = await verifyResponse.json();
      
      const updatedUser = verifyData.users.find(u => (u._id || u.id) === (testUser._id || testUser.id));
      if (updatedUser) {
        console.log(`User role: ${updatedUser.role}`);
        if (updatedUser.role.toLowerCase() === 'owner') {
          console.log('✅ Role change verified successfully');
        } else {
          console.log('❌ User role not updated');
        }
      }

      // Change back to user
      const revertResponse = await fetch(`${API_BASE}/api/admin/users/${testUser._id || testUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'changeRole',
          newRole: 'user'
        }),
      });

      const revertResult = await revertResponse.json();
      if (revertResult.success) {
        console.log('✅ Role reverted successfully');
      }

    } else {
      console.log('❌ Failed to change role:', roleChangeResult.error);
    }

  } catch (error) {
    console.error('Error testing role change:', error.message);
  }
}

// Run the tests
testUserBan().then(() => {
  return testRoleChange();
}).then(() => {
  console.log('\n=== Tests completed ===');
}).catch(console.error);
