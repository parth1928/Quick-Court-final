// Test status filtering
console.log('Testing status filter...');

async function testStatusFilter() {
  try {
    console.log('1. Testing filter by active status...');
    const activeResponse = await fetch('/api/admin/users?status=active&limit=5');
    const activeData = await activeResponse.json();
    console.log('Active users count:', activeData.users?.length || 0);
    console.log('Active users:', activeData.users?.map(u => ({ name: u.name, status: u.status })) || []);
    
    console.log('\n2. Testing filter by banned status...');
    const bannedResponse = await fetch('/api/admin/users?status=banned&limit=5');
    const bannedData = await bannedResponse.json();
    console.log('Banned users count:', bannedData.users?.length || 0);
    console.log('Banned users:', bannedData.users?.map(u => ({ name: u.name, status: u.status })) || []);
    
    console.log('\n3. Testing all users (no filter)...');
    const allResponse = await fetch('/api/admin/users?status=all&limit=5');
    const allData = await allResponse.json();
    console.log('All users count:', allData.users?.length || 0);
    console.log('All users statuses:', allData.users?.map(u => ({ name: u.name, status: u.status })) || []);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run in browser console
if (typeof window !== 'undefined') {
  testStatusFilter();
}
