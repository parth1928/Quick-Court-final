const { MongoClient } = require('mongodb');

// MongoDB connection URL - update this to match your MongoDB setup
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickcourt';

async function createSampleData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Clear existing data
    await db.collection('venues').deleteMany({});
    await db.collection('courts').deleteMany({});
    console.log('Cleared existing venues and courts');
    
    // Create sample venues
    const venues = [
      {
        _id: new require('mongodb').ObjectId('507f1f77bcf86cd799439011'),
        name: 'Elite Sports Complex',
        description: 'Premium sports facility with state-of-the-art courts',
        address: {
          street: '123 Sports Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001'
        },
        location: 'Andheri, Mumbai',
        owner: new require('mongodb').ObjectId('507f1f77bcf86cd799439012'),
        status: 'approved',
        isActive: true,
        amenities: ['Parking', 'Restrooms', 'Cafeteria', 'Locker Rooms'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new require('mongodb').ObjectId('507f1f77bcf86cd799439013'),
        name: 'SportZone Arena',
        description: 'Modern sports arena with multiple indoor and outdoor courts',
        address: {
          street: '456 Game Street',
          city: 'Mumbai',
          state: 'Maharashtra', 
          zipCode: '400002'
        },
        location: 'Bandra, Mumbai',
        owner: new require('mongodb').ObjectId('507f1f77bcf86cd799439014'),
        status: 'approved',
        isActive: true,
        amenities: ['Parking', 'Restrooms', 'Pro Shop', 'Coaching'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const venueResult = await db.collection('venues').insertMany(venues);
    console.log('Created venues:', venueResult.insertedIds);
    
    // Create sample courts
    const courts = [
      // Courts for Elite Sports Complex
      {
        _id: new require('mongodb').ObjectId('507f1f77bcf86cd799439021'),
        name: 'Basketball Court A',
        venue: new require('mongodb').ObjectId('507f1f77bcf86cd799439011'),
        sportType: 'Basketball',
        pricing: {
          hourlyRate: 700,
          currency: 'INR'
        },
        pricePerHour: 700,
        isActive: true,
        status: 'active',
        availability: {
          monday: { open: '09:00', close: '22:00' },
          tuesday: { open: '09:00', close: '22:00' },
          wednesday: { open: '09:00', close: '22:00' },
          thursday: { open: '09:00', close: '22:00' },
          friday: { open: '09:00', close: '22:00' },
          saturday: { open: '09:00', close: '22:00' },
          sunday: { open: '09:00', close: '22:00' }
        },
        description: 'Professional basketball court with wooden flooring',
        amenities: ['Scoreboards', 'Lighting', 'Air Conditioning'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new require('mongodb').ObjectId('507f1f77bcf86cd799439022'),
        name: 'Tennis Court 1',
        venue: new require('mongodb').ObjectId('507f1f77bcf86cd799439011'),
        sportType: 'Tennis',
        pricing: {
          hourlyRate: 850,
          currency: 'INR'
        },
        pricePerHour: 850,
        isActive: true,
        status: 'active',
        availability: {
          monday: { open: '09:00', close: '22:00' },
          tuesday: { open: '09:00', close: '22:00' },
          wednesday: { open: '09:00', close: '22:00' },
          thursday: { open: '09:00', close: '22:00' },
          friday: { open: '09:00', close: '22:00' },
          saturday: { open: '09:00', close: '22:00' },
          sunday: { open: '09:00', close: '22:00' }
        },
        description: 'Hard court tennis with professional net and lighting',
        amenities: ['Net', 'Lighting', 'Ball Machine Available'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new require('mongodb').ObjectId('507f1f77bcf86cd799439023'),
        name: 'Volleyball Court',
        venue: new require('mongodb').ObjectId('507f1f77bcf86cd799439011'),
        sportType: 'Volleyball',
        pricing: {
          hourlyRate: 600,
          currency: 'INR'
        },
        pricePerHour: 600,
        isActive: true,
        status: 'active',
        availability: {
          monday: { open: '09:00', close: '22:00' },
          tuesday: { open: '09:00', close: '22:00' },
          wednesday: { open: '09:00', close: '22:00' },
          thursday: { open: '09:00', close: '22:00' },
          friday: { open: '09:00', close: '22:00' },
          saturday: { open: '09:00', close: '22:00' },
          sunday: { open: '09:00', close: '22:00' }
        },
        description: 'Indoor volleyball court with professional setup',
        amenities: ['Net', 'Lighting', 'Referee Stand'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Courts for SportZone Arena
      {
        _id: new require('mongodb').ObjectId('507f1f77bcf86cd799439024'),
        name: 'Badminton Court 1',
        venue: new require('mongodb').ObjectId('507f1f77bcf86cd799439013'),
        sportType: 'Badminton',
        pricing: {
          hourlyRate: 500,
          currency: 'INR'
        },
        pricePerHour: 500,
        isActive: true,
        status: 'active',
        availability: {
          monday: { open: '09:00', close: '22:00' },
          tuesday: { open: '09:00', close: '22:00' },
          wednesday: { open: '09:00', close: '22:00' },
          thursday: { open: '09:00', close: '22:00' },
          friday: { open: '09:00', close: '22:00' },
          saturday: { open: '09:00', close: '22:00' },
          sunday: { open: '09:00', close: '22:00' }
        },
        description: 'Professional badminton court with wooden flooring',
        amenities: ['Net', 'Lighting', 'Shuttlecocks Available'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new require('mongodb').ObjectId('507f1f77bcf86cd799439025'),
        name: 'Football Field',
        venue: new require('mongodb').ObjectId('507f1f77bcf86cd799439013'),
        sportType: 'Football',
        pricing: {
          hourlyRate: 1200,
          currency: 'INR'
        },
        pricePerHour: 1200,
        isActive: true,
        status: 'active',
        availability: {
          monday: { open: '09:00', close: '22:00' },
          tuesday: { open: '09:00', close: '22:00' },
          wednesday: { open: '09:00', close: '22:00' },
          thursday: { open: '09:00', close: '22:00' },
          friday: { open: '09:00', close: '22:00' },
          saturday: { open: '09:00', close: '22:00' },
          sunday: { open: '09:00', close: '22:00' }
        },
        description: 'Full-size football field with artificial turf',
        amenities: ['Goals', 'Lighting', 'Changing Rooms'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const courtResult = await db.collection('courts').insertMany(courts);
    console.log('Created courts:', courtResult.insertedIds);
    
    console.log('✅ Sample data created successfully!');
    console.log(`
Sample Venue IDs for testing:
- Elite Sports Complex: 507f1f77bcf86cd799439011
- SportZone Arena: 507f1f77bcf86cd799439013

You can now test booking at:
- http://localhost:3000/venues/507f1f77bcf86cd799439011/booking
- http://localhost:3000/venues/507f1f77bcf86cd799439013/booking
    `);
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await client.close();
  }
}

createSampleData();
