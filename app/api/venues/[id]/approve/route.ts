import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Venue from '@/models/Venue';
import { withAuth, ROLES } from '@/lib/auth';

// PATCH /api/venues/:id/approve  (admin only)
export const PATCH = withAuth(async (req: Request, _user: any, context?: any) => {
  try {
    await dbConnect();
    // Extract id from URL path (because context.params may not be passed through wrapper reliably)
    const url = new URL(req.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const id = segments[segments.length - 2] === 'approve' ? segments[segments.length - 3] : segments[segments.length - 1];

    const venue = await Venue.findById(id);
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    venue.approvalStatus = 'approved';
    venue.status = 'approved';
    venue.updatedAt = new Date();
    await venue.save();

    return NextResponse.json({ success: true, venue });
  } catch (e: any) {
    console.error('Venue approval error:', e);
    return NextResponse.json({ error: 'Failed to approve venue' }, { status: 500 });
  }
}, [ROLES.ADMIN]);
