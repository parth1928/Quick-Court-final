import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Venue from '@/models/Venue';
import { withAuth, ROLES } from '@/lib/auth';

// Get all venues for approval based on status (admin only)
export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    console.log('🔐 Admin venue approval request from:', user.email || user.userId);
    
    await connectDB();
    console.log('✅ Database connected successfully');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    console.log(`🔍 Admin ${user.email} fetching venues with status: ${status}`);

    const venues = await Venue.find({ 
      approvalStatus: status 
    })
    .populate('owner', 'name email phone')
    .sort({ createdAt: -1 })
    .lean();

    console.log(`📊 Found ${venues.length} venues with status ${status}`);

    // Log first venue for debugging if exists
    if (venues.length > 0) {
      console.log('🏗️ Sample venue data:', {
        id: venues[0]._id,
        name: venues[0].name,
        status: venues[0].approvalStatus,
        owner: venues[0].owner
      });
    }

    // Ensure consistent data format
    const formattedVenues = venues.map((venue: any) => ({
      _id: venue._id.toString(),
      name: venue.name,
      owner: venue.owner ? {
        _id: venue.owner._id?.toString(),
        name: venue.owner.name,
        email: venue.owner.email,
        phone: venue.owner.phone
      } : null,
      shortLocation: venue.shortLocation || venue.address?.city || '',
      fullAddress: venue.fullAddress || venue.address?.street || '',
      createdAt: venue.createdAt,
      approvalStatus: venue.approvalStatus,
      status: venue.status || venue.approvalStatus,
      description: venue.description || '',
      address: venue.address || {},
      sports: venue.sports || venue.sportsOffered || [],
      amenities: venue.amenities || [],
      images: venue.images || venue.photos || [],
      photos: venue.photos || venue.images || [],
      startingPrice: venue.startingPrice || venue.pricePerHour || 0,
      rating: venue.rating || 0,
      reviewCount: venue.reviewCount || venue.totalReviews || 0,
      contactPhone: venue.contactPhone || venue.contactNumber || '',
      contactEmail: venue.contactEmail || '',
      approvedAt: venue.approvedAt,
      rejectionReason: venue.rejectionReason
    }));

    console.log('✅ Successfully formatted venue data for response');
    
    return NextResponse.json({
      success: true,
      venues: formattedVenues,
      count: formattedVenues.length,
      status: status
    });

  } catch (error: any) {
    console.error('❌ Error in venue approval API:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Provide specific error messages
    let errorMessage = 'Failed to fetch venues';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Invalid request parameters';
      statusCode = 400;
    } else if (error.name === 'MongoError' || error.name === 'MongooseError') {
      errorMessage = 'Database connection error';
      statusCode = 503;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}, [ROLES.ADMIN]);
