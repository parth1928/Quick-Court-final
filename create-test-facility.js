/**
 * Create Test Facility with Owner for Admin Approval
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://parthsenapati:parthsenapati@quickcourt.h8jmq.mongodb.net/quickcourt?retryWrites=true&w=majority&appName=QuickCourt';

async function createTestFacilityWithOwner() {
  console.log('🔌 Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  try {
    // Create a test owner user first
    let ownerUser = await db.collection('users').findOne({ email: 'owner@example.com' });
    
    if (!ownerUser) {
      console.log('👤 Creating test owner user...');
      const result = await db.collection('users').insertOne({
        username: 'facilityowner',
        email: 'owner@example.com',
        name: 'John Smith',
        password: 'hashedpassword123',
        role: 'owner',
        phone: '+91-9876543210',
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      ownerUser = { _id: result.insertedId, name: 'John Smith', email: 'owner@example.com' };
      console.log('✅ Test owner created:', ownerUser._id);
    } else {
      console.log('✅ Test owner found:', ownerUser._id);
    }

    // Create a test facility
    console.log('🏢 Creating test facility...');
    const facility = {
      name: 'Elite Sports Arena',
      owner: ownerUser._id,
      location: 'Mumbai Central',
      fullAddress: '123 Sports Complex Road, Mumbai Central, Mumbai, Maharashtra, 400001',
      sports: ['Basketball', 'Tennis', 'Badminton'],
      description: 'A premium sports facility with multiple courts and modern amenities.',
      amenities: ['Parking', 'Cafeteria', 'Locker Rooms', 'Air Conditioning'],
      rating: 4.5,
      totalBookings: 0,
      monthlyRevenue: 0,
      image: '/placeholder-facility.jpg',
      status: 'pending',
      approvalStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existingFacility = await db.collection('facilities').findOne({ name: facility.name });
    if (existingFacility) {
      console.log('✅ Test facility already exists:', existingFacility._id);
    } else {
      const result = await db.collection('facilities').insertOne(facility);
      console.log('✅ Test facility created:', result.insertedId);
    }

    // Create another facility with different status for testing
    console.log('🏢 Creating approved facility for testing...');
    const approvedFacility = {
      name: 'Champion Sports Club',
      owner: ownerUser._id,
      location: 'Andheri West',
      fullAddress: '456 Victory Lane, Andheri West, Mumbai, Maharashtra, 400058',
      sports: ['Cricket', 'Football', 'Swimming'],
      description: 'Top-tier facility with Olympic-standard equipment.',
      amenities: ['Pool', 'Gym', 'Restaurant', 'Pro Shop'],
      rating: 4.8,
      totalBookings: 150,
      monthlyRevenue: 50000,
      image: '/placeholder-facility2.jpg',
      status: 'Active',
      approvalStatus: 'approved',
      approvedBy: new ObjectId(),
      approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Approved 7 days ago
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    };

    const existingApproved = await db.collection('facilities').findOne({ name: approvedFacility.name });
    if (existingApproved) {
      console.log('✅ Approved facility already exists:', existingApproved._id);
    } else {
      const result = await db.collection('facilities').insertOne(approvedFacility);
      console.log('✅ Approved facility created:', result.insertedId);
    }

    console.log('\n🎉 Test facilities with proper owner data created successfully!');
    console.log('📋 Summary:');
    console.log(`- Owner: ${ownerUser.name} (${ownerUser.email})`);
    console.log('- Pending Facility: Elite Sports Arena');
    console.log('- Approved Facility: Champion Sports Club');

  } catch (error) {
    console.error('❌ Error creating test facility:', error);
  } finally {
    await client.close();
  }
}

// Run the script
if (require.main === module) {
  createTestFacilityWithOwner().then(() => {
    console.log('\n🏁 Script completed');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = { createTestFacilityWithOwner };
