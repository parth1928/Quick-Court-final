// Simple script to create sample pending venues for testing
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://parthoza19:Parthoza%401234@cluster0.wceuxdc.mongodb.net/quickCourtDB?retryWrites=true&w=majority&appName=Cluster0';

async function createSampleVenues() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get or create a sample owner user
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    
    let sampleOwner = await User.findOne({ email: 'owner@quickcourt.test' });
    if (!sampleOwner) {
      sampleOwner = await User.create({
        name: 'Sample Owner',
        email: 'owner@quickcourt.test',
        phone: '+919876543210',
        role: 'owner',
        password: 'hashedpassword123',
        status: 'active'
      });
      console.log('✅ Created sample owner user');
    }

    // Create sample venues
    const Venue = mongoose.model('Venue', new mongoose.Schema({}, { strict: false }), 'venues');
    
    const sampleVenues = [
      {
        name: 'Elite Sports Complex',
        description: 'Premium sports facility with multiple courts',
        owner: sampleOwner._id,
        shortLocation: 'Mumbai',
        fullAddress: '123 Sports Street, Mumbai, Maharashtra',
        sportsOffered: ['Tennis', 'Badminton', 'Basketball'],
        amenities: ['Parking', 'Cafeteria', 'Changing Rooms'],
        contactPhone: '+919876543211',
        contactEmail: 'contact@elitesports.com',
        approvalStatus: 'pending',
        status: 'pending',
        startingPrice: 500,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Premier Tennis Academy',
        description: 'Professional tennis training facility',
        owner: sampleOwner._id,
        shortLocation: 'Delhi',
        fullAddress: '456 Tennis Road, Delhi',
        sportsOffered: ['Tennis'],
        amenities: ['Pro Shop', 'Coaching', 'Equipment Rental'],
        contactPhone: '+919876543212',
        contactEmail: 'info@premiertennis.com',
        approvalStatus: 'pending',
        status: 'pending',
        startingPrice: 800,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const venueData of sampleVenues) {
      const existingVenue = await Venue.findOne({ name: venueData.name });
      if (!existingVenue) {
        await Venue.create(venueData);
        console.log(`✅ Created sample venue: ${venueData.name}`);
      } else {
        console.log(`📋 Venue already exists: ${venueData.name}`);
      }
    }

    console.log('🎉 Sample venues setup complete!');
    
  } catch (error) {
    console.error('❌ Error creating sample venues:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

createSampleVenues();
