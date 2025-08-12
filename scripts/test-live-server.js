// Simple database connection test for live server
console.log('🔄 Starting Database Connection Test...');

// Test using fetch to your API endpoint
async function testDatabaseConnection() {
  try {
    console.log('📡 Testing database via API endpoint...');
    
    const response = await fetch('http://localhost:3000/api/test/db');
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Database connection successful!');
      console.log('   Status:', result.status);
      console.log('   Database:', result.database);
      console.log('   Host:', result.host);
    } else {
      console.log('❌ Database connection failed:', result.error);
    }
    
  } catch (error) {
    console.log('❌ API test failed:', error.message);
    console.log('💡 Make sure your Next.js server is running with: npm run dev');
  }
}

// Also test creating an admin user via API
async function testAdminCreation() {
  try {
    console.log('\n📝 Testing admin user creation...');
    
    const adminData = {
      name: 'Test Admin',
      email: `testadmin${Date.now()}@example.com`,
      password: 'testpassword123',
      phone: '+1234567890',
      department: 'operations',
      canManageUsers: true,
      canManageFacilities: true,
      canViewReports: true,
      notes: 'Test admin created by live server test'
    };
    
    const response = await fetch('http://localhost:3000/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Admin user created successfully!');
      console.log('   User ID:', result.data.user._id);
      console.log('   Name:', result.data.user.name);
      console.log('   Department:', result.data.adminProfile.department);
    } else {
      console.log('❌ Admin creation failed:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Admin creation test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await testDatabaseConnection();
  await testAdminCreation();
  
  console.log('\n🎉 Live Server Tests Completed!');
  console.log('💡 If tests failed, make sure:');
  console.log('   1. Your Next.js server is running (npm run dev)');
  console.log('   2. MongoDB connection string is correct');
  console.log('   3. Your live server has internet access');
}

runTests();
