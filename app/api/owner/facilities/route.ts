import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Venue from '@/models/Venue';
import { withAuth, ROLES } from '@/lib/auth';

// GET /api/owner/facilities - Get owner's facilities
async function handleFacilitiesGet(request: Request, user: any) {
  try {
    await dbConnect();
    
    console.log('🏢 Fetching facilities for owner:', user.userId);
    
    const venues = await Venue.find({ 
      owner: user.userId
      // Removed isActive filter in case venues don't have this field set
    })
    .select('name description location sports amenities images status createdAt approvalStatus isActive')
    .sort('-createdAt');

    console.log('✅ Found', venues.length, 'venues for owner', user.userId);
    
    return NextResponse.json({ venues });
  } catch (error: any) {
    console.error('❌ Error fetching owner facilities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/owner/facilities - Create a new facility
async function handleFacilitiesPost(request: Request, user: any) {
  try {
    await dbConnect();
    
    const data = await request.json();
    
    // Generate a unique slug from name
    let slug = data.name?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!slug) {
      return NextResponse.json(
        { error: 'Invalid facility name' },
        { status: 400 }
      );
    }

    // Check if slug exists and append number if needed
    let slugExists = true;
    let slugCounter = 1;
    let finalSlug = slug;
    while (slugExists) {
      const existingVenue = await Venue.findOne({ slug: finalSlug });
      if (!existingVenue) {
        slugExists = false;
      } else {
        finalSlug = `${slug}-${slugCounter}`;
        slugCounter++;
      }
    }

    const venue = new Venue({
      ...data,
      owner: user.userId,
      createdBy: user.userId,
      updatedBy: user.userId,
      slug: finalSlug
    });

    await venue.save();

    return NextResponse.json(venue);
  } catch (error: any) {
    console.error('Error creating facility:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/owner/facilities - Update a facility
async function handleFacilitiesPatch(request: Request, user: any) {
  try {
    await dbConnect();
    
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Facility ID is required' },
        { status: 400 }
      );
    }

    // If name is being updated, update slug too
    if (updateData.name) {
      let newSlug = updateData.name.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      
      // Check if new slug would conflict with existing venues (except this one)
      let slugExists = true;
      let slugCounter = 1;
      let finalSlug = newSlug;
      while (slugExists) {
        const existingVenue = await Venue.findOne({ 
          slug: finalSlug,
          _id: { $ne: id }
        });
        if (!existingVenue) {
          slugExists = false;
        } else {
          finalSlug = `${newSlug}-${slugCounter}`;
          slugCounter++;
        }
      }
      updateData.slug = finalSlug;
    }

    const venue = await Venue.findOneAndUpdate(
      { _id: id, owner: user.userId },
      { 
        ...updateData,
        updatedBy: user.userId,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!venue) {
      return NextResponse.json(
        { error: 'Facility not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(venue);
  } catch (error: any) {
    console.error('Error updating facility:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleFacilitiesGet, [ROLES.OWNER]);
export const POST = withAuth(handleFacilitiesPost, [ROLES.OWNER]);
export const PATCH = withAuth(handleFacilitiesPatch, [ROLES.OWNER]);
