import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Venue from '@/models/Venue';
import { withAuth, ROLES } from '@/lib/auth';

// PUT /api/admin/venues/approval/[id] - Approve or reject venue
export const PUT = withAuth(async (request: Request, user: any) => {
  try {
    await dbConnect();
    
    // Extract venue ID from URL
    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const venueId = segments[segments.length - 1];
    
    if (!venueId) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { action, reason, adminId } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Valid action (approve/reject) is required' }, { status: 400 });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Update venue status based on action
    if (action === 'approve') {
      venue.approvalStatus = 'approved';
      venue.status = 'approved';
    } else if (action === 'reject') {
      venue.approvalStatus = 'rejected';
      venue.status = 'rejected';
      if (reason) {
        venue.rejectionReason = reason;
      }
    }

    venue.updatedAt = new Date();
    venue.reviewedBy = adminId || user.userId;
    venue.reviewedAt = new Date();

    await venue.save();

    const message = action === 'approve' 
      ? `Venue "${venue.name}" has been approved successfully`
      : `Venue "${venue.name}" has been rejected`;

    return NextResponse.json({ 
      success: true, 
      message,
      venue: {
        _id: venue._id,
        name: venue.name,
        approvalStatus: venue.approvalStatus,
        status: venue.status
      }
    });

  } catch (error: any) {
    console.error('Venue approval error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update venue status' },
      { status: 500 }
    );
  }
}, [ROLES.ADMIN]);