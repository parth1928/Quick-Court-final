import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Venue from '@/models/Venue';
import Court from '@/models/Court';
import User from '@/models/User';

// GET /api/seed - Seed test data for development
export async function GET() {
  try {
    console.log('🌱 Starting database seeding...');
    await dbConnect();

    // Create a test user to own venues
    let testUser;
    try {
      testUser = await User.findOne({ email: 'testowner@example.com' });
      if (!testUser) {
        testUser = await User.create({
          name: 'Test Owner',
          email: 'testowner@example.com',
          password: 'test123456', // Add required password
          phone: '9999999999', // Add required phone
          role: 'owner',
          isVerified: true
        });
        console.log('✅ Test owner created');
      } else {
        console.log('✅ Test owner already exists');
      }
    } catch (userError) {
      console.error('❌ Error creating test user:', userError);
      console.error('❌ User error details:', userError.message);
      return NextResponse.json(
        { error: 'Failed to create test user: ' + userError.message },
        { status: 500 }
      );
    }

    // Seed venues
    const testVenues = [
      {
        name: 'SportsPlex Arena',
        owner: testUser._id,
        description: 'Modern sports complex with multiple courts',
        sports: ['Tennis', 'Badminton', 'Table Tennis', 'Squash'],
        address: {
          street: '123 Sports Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760]
        },
        contactPhone: '9999999001',
        contactEmail: 'info@sportsplexarena.com',
        approvalStatus: 'approved',
        isActive: true,
        startingPrice: 300
      },
      {
        name: 'Elite Tennis Club',
        owner: testUser._id,
        description: 'Premium tennis facility with professional courts',
        sports: ['Tennis'],
        address: {
          street: '456 Tennis Lane',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India'
        },
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139]
        },
        contactPhone: '9999999002',
        contactEmail: 'info@elitetennisclub.com',
        approvalStatus: 'approved',
        isActive: true,
        startingPrice: 500
      },
      {
        name: 'Champions Badminton Center',
        owner: testUser._id,
        description: 'State-of-the-art badminton courts',
        sports: ['Badminton', 'Table Tennis'],
        address: {
          street: '789 Badminton Boulevard',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India'
        },
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716]
        },
        contactPhone: '9999999003',
        contactEmail: 'info@championsbadminton.com',
        approvalStatus: 'approved',
        isActive: true,
        startingPrice: 250
      }
    ];

    const createdVenues = [];
    for (const venueData of testVenues) {
      try {
        // Check if venue already exists by name or slug to avoid duplicates
        const existingVenue = await Venue.findOne({ 
          $or: [
            { name: venueData.name },
            { slug: venueData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
          ]
        });
        
        if (!existingVenue) {
          // Ensure all required fields are present
          const completeVenueData = {
            ...venueData,
            owner: testUser._id,
            createdBy: testUser._id,
            updatedBy: testUser._id,
            status: 'approved', // Add alias field
            // Ensure location coordinates are properly formatted
            location: {
              type: 'Point',
              coordinates: venueData.location.coordinates
            },
            // Add timestamp to make slug unique
            slug: `${venueData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
          };
          
          console.log('🏗️ Creating venue with data:', completeVenueData.name);
          const venue = await Venue.create(completeVenueData);
          createdVenues.push(venue);
          console.log(`✅ Created venue: ${venue.name}`);
        } else {
          console.log(`ℹ️ Venue already exists: ${venueData.name}`);
          createdVenues.push(existingVenue);
        }
      } catch (venueError) {
        console.error(`❌ Error creating venue ${venueData.name}:`, venueError);
        console.error(`❌ Venue error details:`, venueError.message);
        if (venueError.errors) {
          console.error(`❌ Validation errors:`, venueError.errors);
        }
        
        // If it's a duplicate error, try to find the existing venue
        if (venueError.message.includes('E11000') || venueError.message.includes('duplicate')) {
          console.log(`🔍 Duplicate error for ${venueData.name}, finding existing venue...`);
          const existingVenue = await Venue.findOne({ name: venueData.name });
          if (existingVenue) {
            console.log(`✅ Found existing venue: ${existingVenue.name}`);
            createdVenues.push(existingVenue);
          }
        }
      }
    }

    // Seed courts for each venue
    for (const venue of createdVenues) {
      const courtPromises = venue.sports.map(async (sport, index) => {
        try {
          const existingCourt = await Court.findOne({ 
            venue: venue._id, 
            sportType: sport // Use sportType instead of sport
          });
          
          if (!existingCourt) {
            const court = await Court.create({
              name: `${sport} Court ${index + 1}`,
              venue: venue._id,
              sportType: sport, // Use sportType (string) instead of sport (ObjectId)
              surfaceType: 'Synthetic', // Add required surfaceType
              pricing: {
                hourlyRate: venue.startingPrice + (index * 50),
                currency: 'INR'
              },
              pricePerHour: venue.startingPrice + (index * 50),
              description: `Professional ${sport.toLowerCase()} court`,
              isActive: true,
              status: 'active',
              availability: {
                monday: { open: '06:00', close: '22:00' },
                tuesday: { open: '06:00', close: '22:00' },
                wednesday: { open: '06:00', close: '22:00' },
                thursday: { open: '06:00', close: '22:00' },
                friday: { open: '06:00', close: '22:00' },
                saturday: { open: '06:00', close: '22:00' },
                sunday: { open: '06:00', close: '22:00' }
              }
            });
            console.log(`✅ Created court: ${court.name} at ${venue.name}`);
            return court;
          } else {
            console.log(`ℹ️ Court already exists: ${sport} at ${venue.name}`);
            return existingCourt;
          }
        } catch (courtError) {
          console.error(`❌ Error creating court for ${sport} at ${venue.name}:`, courtError);
          return null;
        }
      });

      await Promise.all(courtPromises);
    }

    const venueCount = await Venue.countDocuments({ isActive: true });
    const courtCount = await Court.countDocuments({ isActive: true });

    console.log('🎉 Database seeding completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        venues: venueCount,
        courts: courtCount,
        testUser: testUser.email
      }
    });

  } catch (error: any) {
    console.error('💥 Seeding error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to seed database',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
