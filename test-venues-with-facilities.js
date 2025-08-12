// Test the updated venues API that should include facilities
async function testVenuesWithFacilities() {
  try {
    console.log('Testing venues API with facilities...');
    
    // Test the venues API in card view
    const response = await fetch('http://localhost:3000/api/venues?view=card&limit=20');
    
    if (!response.ok) {
      console.error('API response not OK:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log(`Total venues/facilities found: ${data.venues.length}`);
    
    if (data.venues.length > 0) {
      console.log('\nVenues/Facilities:');
      data.venues.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
        console.log(`   Type: ${item.type || 'venue'}`);
        console.log(`   Location: ${item.location}`);
        console.log(`   Sports: ${item.sports.join(', ')}`);
        console.log(`   Price: ₹${item.price}`);
        console.log('---');
      });
      
      // Check if any facilities are included
      const facilities = data.venues.filter(item => item.type === 'facility');
      const venues = data.venues.filter(item => item.type === 'venue' || !item.type);
      
      console.log(`\nBreakdown:`);
      console.log(`- Venues: ${venues.length}`);
      console.log(`- Facilities: ${facilities.length}`);
      
      if (facilities.length > 0) {
        console.log('\n✅ Facilities are now showing in venues page!');
        console.log('Your approved facilities:');
        facilities.forEach(f => {
          console.log(`- ${f.name} (${f.location})`);
        });
      } else {
        console.log('\n❌ No facilities found. Make sure facilities are approved with status: "Active"');
      }
    } else {
      console.log('No venues or facilities found');
    }
    
  } catch (error) {
    console.error('Error testing venues API:', error);
  }
}

testVenuesWithFacilities();
