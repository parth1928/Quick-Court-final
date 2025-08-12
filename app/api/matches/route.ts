import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Match from '@/models/Match';
import Venue from '@/models/Venue';
import Court from '@/models/Court';
import User from '@/models/User';

// Input validation schema
interface CreateMatchInput {
  sport: string;
  venueId: string;
  courtId?: string;
  date: string;
  time: string;
  playersNeeded: string | number;
  prizeAmount?: string | number;
  courtFees?: string | number;
  description?: string;
  rules?: string[];
}

// Validation helper
function validateMatchInput(data: any): { isValid: boolean; errors: string[]; validData?: CreateMatchInput } {
  const errors: string[] = [];
  
  // Check if data exists
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Invalid request body'] };
  }

  // Required fields validation
  if (!data.sport || typeof data.sport !== 'string' || !data.sport.trim()) {
    errors.push('Sport is required and must be a non-empty string');
  }
  
  if (!data.venueId || typeof data.venueId !== 'string' || !data.venueId.trim()) {
    errors.push('Venue ID is required and must be a non-empty string');
  }
  
  if (!data.date || typeof data.date !== 'string' || !data.date.trim()) {
    errors.push('Date is required and must be a non-empty string');
  }
  
  if (!data.time || typeof data.time !== 'string' || !data.time.trim()) {
    errors.push('Time is required and must be a non-empty string');
  }
  
  if (!data.playersNeeded) {
    errors.push('Players needed is required');
  }

  // Date validation
  if (data.date) {
    const matchDate = new Date(data.date);
    if (isNaN(matchDate.getTime())) {
      errors.push('Invalid date format');
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (matchDate < today) {
        errors.push('Cannot create matches for past dates');
      }
    }
  }

  // Players needed validation
  if (data.playersNeeded) {
    const playersNum = parseInt(String(data.playersNeeded));
    if (isNaN(playersNum) || playersNum < 2 || playersNum > 50) {
      errors.push('Players needed must be a number between 2 and 50');
    }
  }

  // Time format validation
  if (data.time) {
    const timePattern = /^(\d{1,2}:\d{2}\s?(AM|PM))\s?-\s?(\d{1,2}:\d{2}\s?(AM|PM))$|^(\d{1,2}:\d{2})\s?-\s?(\d{1,2}:\d{2})$/i;
    if (!timePattern.test(data.time)) {
      errors.push('Time must be in format "6:00 PM - 8:00 PM" or "18:00 - 20:00"');
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    validData: {
      sport: data.sport.trim(),
      venueId: data.venueId.trim(),
      courtId: data.courtId?.trim() || undefined,
      date: data.date.trim(),
      time: data.time.trim(),
      playersNeeded: parseInt(String(data.playersNeeded)),
      prizeAmount: data.prizeAmount ? parseFloat(String(data.prizeAmount)) : 0,
      courtFees: data.courtFees ? parseFloat(String(data.courtFees)) : 0,
      description: data.description?.trim() || undefined,
      rules: Array.isArray(data.rules) ? data.rules.filter((r: any) => r?.trim()).map((r: any) => r.trim()) : []
    }
  };
}

// GET /api/matches - Get all matches
export const GET = withAuth(async (request: Request, user: any) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query: any = {};
    
    // Filter by sport
    const sport = searchParams.get('sport');
    if (sport) {
      query.sport = sport;
    }
    
    // Filter by status
    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    } else {
      // By default, only show Open matches
      query.status = { $in: ['Open', 'Full'] };
    }
    
    // Filter by date (future matches only by default)
    const includeAll = searchParams.get('includeAll');
    if (!includeAll) {
      query.date = { $gte: new Date() };
    }
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const matches = await Match.find(query)
      .populate('venue', 'name location address')
      .populate('court', 'name sport pricePerHour')
      .populate('createdBy', 'name avatar')
      .populate('participants.user', 'name avatar')
      .sort({ date: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Match.countDocuments(query);
    
    // Transform matches for frontend
    const transformedMatches = matches.map((match: any) => ({
      id: match._id.toString(),
      sport: match.sport,
      venue: match.venue?.name || 'Unknown Venue',
      venueId: match.venue?._id?.toString(),
      court: match.court?.name || null,
      courtId: match.court?._id?.toString() || null,
      courtFees: match.courtFees || 0,
      date: match.date.toISOString().split('T')[0],
      time: match.time,
      prizeAmount: match.prizeAmount || 0,
      playersJoined: match.participants?.length || 0,
      playersNeeded: match.playersNeeded,
      createdBy: match.createdBy?.name || 'Unknown User',
      createdById: match.createdBy?._id?.toString(),
      status: match.status,
      participants: (match.participants || []).map((p: any) => ({
        id: p.user?._id?.toString(),
        name: p.user?.name || 'Unknown User',
        joinedAt: p.joinedAt
      })),
      description: match.description,
      rules: match.rules || [],
      createdAt: match.createdAt,
      updatedAt: match.updatedAt
    }));
    
    return NextResponse.json({
      matches: transformedMatches,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['user', 'owner', 'admin']);

// POST /api/matches - Create a new match
export const POST = withAuth(async (request: Request, user: any) => {
  console.log('🚀 Match creation API called');
  console.log('👤 Authenticated user:', {
    userId: user.userId,
    email: user.email,
    role: user.role,
    name: user.name
  });
  
  try {
    // Check user role - allow users and owners to create matches
    if (user.role !== 'user' && user.role !== 'owner') {
      console.log('❌ Unauthorized role:', user.role);
      return NextResponse.json(
        { error: 'Only users and owners can create matches' },
        { status: 403 }
      );
    }
    
    console.log('✅ User role authorized:', user.role);
    
    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
      console.log('📝 Received data:', requestData);
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate input
    const validation = validateMatchInput(requestData);
    if (!validation.isValid) {
      console.log('❌ Validation errors:', validation.errors);
      return NextResponse.json(
        { 
          error: validation.errors.join('; '),
          errors: validation.errors,
          receivedData: requestData
        },
        { status: 400 }
      );
    }

    const validData = validation.validData!;
    console.log('✅ Validated data:', validData);

    // Connect to database
    try {
      console.log('🔌 Connecting to database...');
      await dbConnect();
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Verify venue exists
    let venueDoc;
    try {
      console.log('🏢 Verifying venue:', validData.venueId);
      
      // Check if this is an auto-create venue ID
      if (validData.venueId.startsWith('auto-create-')) {
        console.log('🔧 Auto-create venue detected:', validData.venueId);
        
        // Map of auto-create IDs to venue data
        const autoCreateVenues = {
          'auto-create-elite-sports': {
            name: 'Elite Sports Complex',
            description: 'Modern sports complex with multiple courts',
            sports: ['Basketball', 'Tennis', 'Badminton', 'Volleyball', 'Table Tennis'],
            address: {
              street: '123 Elite Street',
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
            contactEmail: 'info@elitesports.com'
          },
          'auto-create-premier-tennis': {
            name: 'Premier Tennis Club',
            description: 'Premium tennis facility',
            sports: ['Tennis', 'Badminton', 'Table Tennis'],
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
            contactEmail: 'info@premiertennis.com'
          },
          'auto-create-community-rec': {
            name: 'Community Recreation Center',
            description: 'Community sports facility',
            sports: ['Basketball', 'Volleyball', 'Football', 'Cricket', 'Table Tennis', 'Badminton'],
            address: {
              street: '789 Community Road',
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
            contactEmail: 'info@communityrec.com'
          },
          'auto-create-city-arena': {
            name: 'City Sports Arena',
            description: 'Large sports arena facility',
            sports: ['Football', 'Cricket', 'Hockey', 'Table Tennis'],
            address: {
              street: '101 Arena Boulevard',
              city: 'Chennai',
              state: 'Tamil Nadu',
              zipCode: '600001',
              country: 'India'
            },
            location: {
              type: 'Point',
              coordinates: [80.2707, 13.0827]
            },
            contactPhone: '9999999004',
            contactEmail: 'info@cityarena.com'
          },
          'auto-create-delhi-hub': {
            name: 'Delhi Indoor Sports Hub',
            description: 'Indoor sports facility',
            sports: ['Table Tennis', 'Badminton', 'Basketball', 'Volleyball'],
            address: {
              street: '202 Sports Hub Street',
              city: 'Delhi',
              state: 'Delhi',
              zipCode: '110002',
              country: 'India'
            },
            location: {
              type: 'Point',
              coordinates: [77.2090, 28.6139]
            },
            contactPhone: '9999999005',
            contactEmail: 'info@delhihub.com'
          },
          'auto-create-hyderabad-arena': {
            name: 'Hyderabad Smash Arena',
            description: 'Badminton and table tennis facility',
            sports: ['Table Tennis', 'Tennis', 'Badminton'],
            address: {
              street: '303 Smash Avenue',
              city: 'Hyderabad',
              state: 'Telangana',
              zipCode: '500001',
              country: 'India'
            },
            location: {
              type: 'Point',
              coordinates: [78.4867, 17.3850]
            },
            contactPhone: '9999999006',
            contactEmail: 'info@hyderabadarena.com'
          }
        };
        
        const venueTemplate = (autoCreateVenues as any)[validData.venueId];
        if (venueTemplate) {
          console.log('🌱 Creating auto venue:', venueTemplate.name);
          
          // First check if venue already exists by name to avoid duplicate slug error
          const existingVenue = await Venue.findOne({ 
            name: venueTemplate.name,
            isActive: true 
          }).lean();
          
          if (existingVenue) {
            console.log('✅ Using existing venue:', (existingVenue as any).name, (existingVenue as any)._id);
            venueDoc = existingVenue;
          } else {
            try {
              // Ensure all required fields are present
              const venueData = {
                name: venueTemplate.name,
                owner: user.userId,
                description: venueTemplate.description,
                sports: venueTemplate.sports,
                address: venueTemplate.address,
                location: {
                  type: 'Point',
                  coordinates: venueTemplate.location.coordinates // Required field
                },
                contactPhone: venueTemplate.contactPhone,
                contactEmail: venueTemplate.contactEmail,
                approvalStatus: 'approved',
                status: 'approved', // Also set the alias field
                isActive: true,
                startingPrice: 300,
                createdBy: user.userId,
                updatedBy: user.userId,
                // Add timestamp to make slug unique if needed
                slug: `${venueTemplate.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
              };
              
              console.log('🔧 Creating venue with data:', venueData.name);
              venueDoc = await Venue.create(venueData);
              console.log('✅ Auto-created venue:', venueDoc._id);
            } catch (createError: any) {
              console.error('❌ Failed to auto-create venue:', createError);
              console.error('❌ Venue creation error details:', createError.message);
              if (createError.errors) {
                console.error('❌ Validation errors:', createError.errors);
              }
              
              // If it's still a duplicate error, try to find the existing venue
              if (createError.message && (createError.message.includes('E11000') || createError.message.includes('duplicate'))) {
                console.log('🔍 Duplicate error, trying to find existing venue...');
                const fallbackVenue = await Venue.findOne({ 
                  name: venueTemplate.name 
                }).lean();
                
                if (fallbackVenue) {
                  console.log('✅ Found existing venue after duplicate error:', (fallbackVenue as any)._id);
                  venueDoc = fallbackVenue;
                } else {
                  return NextResponse.json(
                    { error: 'Failed to create venue automatically: ' + createError.message },
                    { status: 500 }
                  );
                }
              } else {
                return NextResponse.json(
                  { error: 'Failed to create venue automatically: ' + createError.message },
                  { status: 500 }
                );
              }
            }
          }
        } else {
          return NextResponse.json(
            { error: 'Unknown auto-create venue ID: ' + validData.venueId },
            { status: 400 }
          );
        }
      } else {
        // Check if the venueId is a valid ObjectId format
        if (!validData.venueId.match(/^[0-9a-fA-F]{24}$/)) {
          console.log('❌ Invalid venue ID format:', validData.venueId);
          return NextResponse.json(
            { 
              error: 'Invalid venue ID format. Expected a 24-character hexadecimal string (MongoDB ObjectId) or auto-create ID.',
              received: validData.venueId,
              example: '507f1f77bcf86cd799439011',
              hint: 'Try using the "Seed DB" button to create test venues with proper IDs.'
            },
            { status: 400 }
          );
        }
        
        // Valid ObjectId format, try to find it
        venueDoc = await Venue.findById(validData.venueId).lean();
        if (!venueDoc) {
          console.log('❌ Venue not found in database:', validData.venueId);
          return NextResponse.json(
            { error: `Venue with ID ${validData.venueId} not found. Please check the venue ID or use the "Seed DB" button to create test data.` },
            { status: 404 }
          );
        }
      }
      
      console.log('✅ Venue found/created:', venueDoc.name, 'Sports:', venueDoc.sports);
      
      // Check if venue supports the sport
      if (!venueDoc.sports || !Array.isArray(venueDoc.sports) || !venueDoc.sports.includes(validData.sport)) {
        console.log('❌ Venue does not support sport:', validData.sport, 'Available sports:', venueDoc.sports);
        return NextResponse.json(
          { error: `Venue "${venueDoc.name}" does not support ${validData.sport}. Available sports: ${venueDoc.sports?.join(', ') || 'None'}` },
          { status: 400 }
        );
      }
      
    } catch (venueError) {
      console.error('❌ Venue lookup error:', venueError);
      return NextResponse.json(
        { error: 'Error verifying venue: ' + (venueError instanceof Error ? venueError.message : 'Unknown error') },
        { status: 500 }
      );
    }

    // Verify court if provided
    let courtDoc = null;
    if (validData.courtId) {
      try {
        console.log('🏟️ Verifying court:', validData.courtId);
        
        // Check if this is an auto-create court or the venue was auto-created
        if (validData.courtId.startsWith('auto-create-') || validData.venueId.startsWith('auto-create-')) {
          console.log('🔧 Auto-create court detected or auto-created venue needs courts');
          
          // Map auto-create court IDs to court names
          const courtNameMap = {
            'auto-create-basketball-1': 'Basketball Court 1',
            'auto-create-tennis-1': 'Tennis Court 1', 
            'auto-create-badminton-1': 'Badminton Court 1',
            'auto-create-football-1': 'Football Field 1',
            'auto-create-cricket-1': 'Cricket Ground 1',
            'auto-create-volleyball-1': 'Volleyball Court 1',
            'auto-create-tabletennis-1': 'Table Tennis Table 1'
          };
          
          // Try to find any court for this venue and sport first
          courtDoc = await Court.findOne({ 
            venue: venueDoc._id, 
            sportType: validData.sport, // Use sportType instead of sport
            isActive: true 
          }).lean();
          
          if (!courtDoc) {
            console.log('🌱 No courts found for venue, creating auto court');
            const courtName = (courtNameMap as any)[validData.courtId] || `${validData.sport} Court 1`;
            
            try {
              courtDoc = await Court.create({
                venue: venueDoc._id,
                name: courtName,
                sportType: validData.sport, // Use sportType (string) instead of sport (ObjectId)
                description: `Auto-generated ${validData.sport} court`,
                surfaceType: 'Synthetic',
                isActive: true,
                pricing: {
                  hourlyRate: 500,
                  currency: 'INR'
                },
                pricePerHour: 500,
                availability: {
                  monday: { open: '06:00', close: '22:00' },
                  tuesday: { open: '06:00', close: '22:00' },
                  wednesday: { open: '06:00', close: '22:00' },
                  thursday: { open: '06:00', close: '22:00' },
                  friday: { open: '06:00', close: '22:00' },
                  saturday: { open: '06:00', close: '22:00' },
                  sunday: { open: '06:00', close: '22:00' }
                },
                status: 'active'
              });
              console.log('✅ Auto-created court:', courtDoc._id, courtDoc.name);
            } catch (createError) {
              console.error('❌ Failed to create auto court:', createError);
              // Continue without court - it's optional
              console.log('⚠️ Continuing without court (optional field)');
            }
          } else {
            console.log('✅ Using existing court:', (courtDoc as any)._id, (courtDoc as any).name);
          }
        } else {
          // Check if the courtId is a valid ObjectId format
          if (!validData.courtId.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('❌ Invalid court ID format:', validData.courtId);
            return NextResponse.json(
              { 
                error: 'Invalid court ID format. Expected a 24-character hexadecimal string (MongoDB ObjectId).',
                received: validData.courtId,
                example: '507f1f77bcf86cd799439021',
                hint: 'Court ID is optional - you can leave it empty to create a match without a specific court.'
              },
              { status: 400 }
            );
          }
          
          // Valid ObjectId format, try to find it
          courtDoc = await Court.findOne({
            _id: validData.courtId,
            venue: venueDoc._id,
            sportType: validData.sport, // Use sportType instead of sport
            isActive: true
          }).lean();
          
          if (!courtDoc) {
            console.log('❌ Court not found or not associated with venue/sport');
            return NextResponse.json(
              { error: `Court with ID ${validData.courtId} not found for this venue and sport. Please check the court ID or leave it empty.` },
              { status: 404 }
            );
          }
          
          console.log('✅ Court found:', (courtDoc as any).name);
        }
        
      } catch (courtError) {
        console.error('❌ Court lookup error:', courtError);
        return NextResponse.json(
          { error: 'Error verifying court: ' + (courtError instanceof Error ? courtError.message : 'Unknown error') },
          { status: 500 }
        );
      }
    } else {
      console.log('ℹ️ No court specified (optional)');
    }

    // Create match data
    const matchData = {
      sport: validData.sport,
      venue: venueDoc._id, // Use the actual venue ObjectId, not the auto-create ID
      court: courtDoc?._id || null,
      courtFees: validData.courtFees || 0,
      date: new Date(validData.date),
      time: validData.time,
      playersNeeded: validData.playersNeeded,
      prizeAmount: validData.prizeAmount || 0,
      description: validData.description || undefined,
      rules: validData.rules || [],
      createdBy: user.userId,
      status: 'Open'
    };

    console.log('💾 Creating match with data:', {
      ...matchData,
      venue: matchData.venue.toString(),
      court: matchData.court?.toString()
    });

    // Create match in database
    let match;
    try {
      match = await Match.create(matchData);
      console.log('✅ Match created successfully with ID:', match._id);
    } catch (createError: any) {
      console.error('❌ Match creation error:', {
        message: createError.message,
        name: createError.name,
        errors: createError.errors
      });
      
      // Handle validation errors
      if (createError.name === 'ValidationError') {
        const validationErrors = Object.values(createError.errors || {}).map((err: any) => err.message);
        return NextResponse.json(
          { error: 'Validation failed: ' + validationErrors.join('; ') },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create match: ' + createError.message },
        { status: 500 }
      );
    }

    // Populate and return the created match
    let populatedMatch;
    try {
      populatedMatch = await Match.findById(match._id)
        .populate('venue', 'name location address')
        .populate('court', 'name sport pricePerHour')
        .populate('createdBy', 'name avatar')
        .populate('participants.user', 'name avatar')
        .lean();
      
      if (!populatedMatch) {
        throw new Error('Failed to retrieve created match');
      }
      
      console.log('✅ Match populated successfully');
    } catch (populateError) {
      console.error('❌ Match population error:', populateError);
      // Return basic match data if population fails
      populatedMatch = match.toObject();
    }

    // Transform response
    const transformedMatch = {
      id: populatedMatch._id.toString(),
      sport: populatedMatch.sport,
      venue: populatedMatch.venue?.name || 'Unknown Venue',
      venueId: populatedMatch.venue?._id?.toString() || validData.venueId,
      court: populatedMatch.court?.name || null,
      courtId: populatedMatch.court?._id?.toString() || validData.courtId || null,
      courtFees: populatedMatch.courtFees || 0,
      date: populatedMatch.date.toISOString().split('T')[0],
      time: populatedMatch.time,
      prizeAmount: populatedMatch.prizeAmount || 0,
      playersJoined: populatedMatch.participants?.length || 1,
      playersNeeded: populatedMatch.playersNeeded,
      createdBy: populatedMatch.createdBy?.name || 'You',
      createdById: populatedMatch.createdBy?._id?.toString() || user.userId,
      status: populatedMatch.status,
      participants: (populatedMatch.participants || []).map((p: any) => ({
        id: p.user?._id?.toString() || user.userId,
        name: p.user?.name || 'You',
        joinedAt: p.joinedAt || new Date()
      })),
      description: populatedMatch.description,
      rules: populatedMatch.rules || [],
      createdAt: populatedMatch.createdAt || new Date(),
      updatedAt: populatedMatch.updatedAt || new Date()
    };

    console.log('🎉 Match creation completed successfully');
    
    return NextResponse.json({
      success: true,
      match: transformedMatch,
      message: 'Match created successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    // This is the final catch-all for any unexpected errors
    console.error('💥 Unexpected error in match creation:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while creating the match',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}, ['user', 'owner']); // Allow both users and owners to create matches