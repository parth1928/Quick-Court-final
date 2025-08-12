import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Venue from '@/models/Venue';

// POST /api/test-venue - Quick test venue creation
export const POST = withAuth(async (request: Request, user: any) => {
  try {
    console.log('🧪 Testing venue creation...');
    
    await dbConnect();
    console.log('✅ Database connected successfully');
    
    const testVenueName = `Test Venue ${Date.now()}`;
    
    console.log('🏢 Creating test venue:', testVenueName);
    
    // Map sport type to valid enum values
    const mapSportType = (sport: string) => {
      const sportLower = (sport || 'badminton').toLowerCase();
      const validSports = ['badminton', 'tennis', 'basketball', 'cricket', 'football', 'volleyball', 'table-tennis', 'squash', 'swimming'];
      return validSports.includes(sportLower) ? sportLower : 'badminton';
    };

    const venue = await Venue.create({
      name: testVenueName,
      owner: user.userId,
      description: `Test venue created via test endpoint`,
      sportsOffered: [mapSportType('badminton')],
      address: {
        street: 'Test Street 123',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      geoLocation: {
        lat: 19.0760,
        lng: 72.8777
      },
      contactInfo: {
        phone: '+91-9999999999',
        email: 'test@venue.com',
        website: ''
      },
      operatingHours: {
        monday: { open: '06:00', close: '22:00', closed: false },
        tuesday: { open: '06:00', close: '22:00', closed: false },
        wednesday: { open: '06:00', close: '22:00', closed: false },
        thursday: { open: '06:00', close: '22:00', closed: false },
        friday: { open: '06:00', close: '22:00', closed: false },
        saturday: { open: '08:00', close: '20:00', closed: false },
        sunday: { open: '08:00', close: '20:00', closed: false }
      },
      amenities: ['lights', 'parking'],
      images: ['/placeholder.jpg'],
      approvalStatus: 'approved',
      status: 'approved',
      isActive: true
    });
    
    console.log('✅ Test venue created successfully:', venue._id);
    
    return NextResponse.json({
      success: true,
      message: 'Test venue created successfully',
      data: {
        id: venue._id.toString(),
        name: venue.name
      }
    });
    
  } catch (error: any) {
    console.error('💥 Test venue creation failed:', error);
    console.error('💥 Error details:', error.message);
    console.error('💥 Error stack:', error.stack);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create test venue',
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    }, { status: 500 });
  }
}, []);
