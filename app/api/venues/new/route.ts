import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Venue from '@/models/Venue';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to verify JWT token
function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  const authToken = request.cookies.get('authToken')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!authToken) {
    return null;
  }
  
  const decoded = verifyToken(authToken);
  if (!decoded) {
    return null;
  }
  
  await connectDB();
  const user = await User.findById(decoded.userId).select('-password');
  return user;
}

// POST - Create new venue
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Get authenticated user
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is owner or admin
    if (user.role !== 'owner' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only venue owners can create venues' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const {
      name,
      description,
      sportsOffered,
      address,
      geoLocation,
      amenities,
      pricePerHour,
      images,
      operatingHours
    } = body;
    
    // Validation
    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { error: 'Venue name must be at least 3 characters long' },
        { status: 400 }
      );
    }
    
    if (!sportsOffered || !Array.isArray(sportsOffered) || sportsOffered.length === 0) {
      return NextResponse.json(
        { error: 'At least one sport must be offered' },
        { status: 400 }
      );
    }
    
    if (!address || !address.street || !address.city || !address.state || !address.pincode) {
      return NextResponse.json(
        { error: 'Complete address is required (street, city, state, pincode)' },
        { status: 400 }
      );
    }
    
    if (!geoLocation || typeof geoLocation.lat !== 'number' || typeof geoLocation.lng !== 'number') {
      return NextResponse.json(
        { error: 'Valid geo location (lat, lng) is required' },
        { status: 400 }
      );
    }
    
    if (!pricePerHour || pricePerHour <= 0) {
      return NextResponse.json(
        { error: 'Price per hour must be greater than 0' },
        { status: 400 }
      );
    }
    
    // Validate pincode format
    if (!/^[0-9]{6}$/.test(address.pincode)) {
      return NextResponse.json(
        { error: 'Pincode must be 6 digits' },
        { status: 400 }
      );
    }
    
    // Create venue object
    const venueData = {
      name: name.trim(),
      description: description?.trim(),
      owner: user._id,
      sportsOffered,
      address: {
        street: address.street.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
        country: address.country?.trim() || 'India'
      },
      geoLocation,
      amenities: amenities || [],
      pricePerHour,
      images: images || [],
      operatingHours: operatingHours || { open: '06:00', close: '22:00' },
      approvalStatus: 'pending',
      isActive: true
    };
    
    // Create venue
    const venue = new Venue(venueData);
    await venue.save();
    
    // Populate owner details for response
    await venue.populate('owner', 'name email phone');
    
    return NextResponse.json(
      {
        data: venue,
        error: null
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Error creating venue:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          data: null,
          error: `Validation failed: ${errors.join(', ')}`
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        data: null,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// GET - Fetch venues with filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const city = searchParams.get('city');
    const sport = searchParams.get('sport');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const approvalStatus = searchParams.get('approvalStatus');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    
    // Build filter object
    const filter: any = { isActive: true };
    
    // City filter
    if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' };
    }
    
    // Sport filter
    if (sport) {
      filter.sportsOffered = { $in: [sport] };
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.pricePerHour = {};
      if (minPrice) filter.pricePerHour.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerHour.$lte = parseFloat(maxPrice);
    }
    
    // Approval status filter (default to approved for public access)
    if (approvalStatus) {
      filter.approvalStatus = approvalStatus;
    } else {
      filter.approvalStatus = 'approved'; // Only show approved venues by default
    }
    
    // Location-based filter
    if (lat && lng && radius) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusKm = parseFloat(radius);
      
      filter['geoLocation.lat'] = {
        $gte: latitude - (radiusKm / 111),
        $lte: latitude + (radiusKm / 111)
      };
      filter['geoLocation.lng'] = {
        $gte: longitude - (radiusKm / (111 * Math.cos(latitude * Math.PI / 180))),
        $lte: longitude + (radiusKm / (111 * Math.cos(latitude * Math.PI / 180)))
      };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder;
    
    // Execute queries
    const [venues, totalCount] = await Promise.all([
      Venue.find(filter)
        .populate('owner', 'name email phone')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Venue.countDocuments(filter)
    ]);
    
    // Calculate distances if location provided
    if (lat && lng && venues.length > 0) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      venues.forEach((venue: any) => {
        if (venue.geoLocation) {
          const R = 6371; // Earth's radius in kilometers
          const dLat = (latitude - venue.geoLocation.lat) * Math.PI / 180;
          const dLng = (longitude - venue.geoLocation.lng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(venue.geoLocation.lat * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          venue.distance = R * c; // Distance in kilometers
        }
      });
      
      // Sort by distance if location provided
      if (!searchParams.get('sortBy')) {
        venues.sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));
      }
    }
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      success: true,
      venues: venues.map((venue: any) => ({
        _id: venue._id.toString(),
        name: venue.name,
        description: venue.description,
        location: venue.address?.city || 'Unknown Location',
        shortLocation: venue.address?.city || 'Unknown Location',
        sports: venue.sportsOffered || [],
        sportsOffered: venue.sportsOffered || [],
        startingPrice: venue.pricePerHour || 0,
        pricePerHour: venue.pricePerHour || 0,
        rating: venue.rating || 0,
        images: venue.images || [],
        image: venue.images?.[0] || '/placeholder.svg',
        address: venue.address || {},
        operatingHours: venue.operatingHours || { open: '06:00', close: '22:00' },
        approvalStatus: venue.approvalStatus,
        status: venue.approvalStatus,
        isActive: venue.isActive,
        amenities: venue.amenities || [],
        totalReviews: venue.totalReviews || 0
      })),
      count: venues.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching venues:', error);
    return NextResponse.json(
      { 
        data: null,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
