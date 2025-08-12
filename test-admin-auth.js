// Test script to verify admin authentication for venue approval API
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testAdminAuth() {
  console.log('🧪 Testing Admin Authentication for Venue Approval API');
  console.log('='.repeat(60));
  
  // You can get this token by:
  // 1. Login as admin in browser
  // 2. Open DevTools -> Application -> Local Storage -> token
  rl.question('Enter your admin JWT token: ', async (token) => {
    if (!token) {
      console.log('❌ No token provided');
      rl.close();
      return;
    }
    
    try {
      console.log('🔍 Testing venue approval API...');
      
      const response = await fetch('http://localhost:3000/api/admin/venues/approval?status=pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response Status:', response.status);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.text();
      console.log('📄 Response Body:', data);
      
      if (response.ok) {
        const jsonData = JSON.parse(data);
        console.log('✅ API Test Successful!');
        console.log('📊 Venues found:', jsonData.venues?.length || 0);
      } else {
        console.log('❌ API Test Failed');
      }
      
    } catch (error) {
      console.error('💥 Test Error:', error.message);
    }
    
    rl.close();
  });
}

testAdminAuth();
