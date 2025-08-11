import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import User from '@/models/User';
import Booking from '@/models/Booking';

// GET /api/users/me - profile details
export const GET = withAuth(async (_req: Request, user: any) => {
  try {
    await dbConnect();
    const userDoc: any = await User.findById(user.userId).lean();
    if (!userDoc) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Trust bookingCount if present; fallback to count aggregation
    let totalBookings = userDoc.bookingCount;
    if (totalBookings == null) {
      totalBookings = await Booking.countDocuments({ user: user.userId, status: { $in: ['confirmed','completed'] } });
    }

    const memberSince = userDoc.createdAt;

    return NextResponse.json({
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      phone: userDoc.phone,
      avatar: userDoc.avatar,
      role: userDoc.role,
      memberSince,
      totalBookings,
      bookingCount: totalBookings
    });
  } catch (e) {
    console.error('Profile fetch error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}, []);

// PATCH /api/users/me - update profile (name, phone, avatar)
export const PATCH = withAuth(async (req: Request, user: any) => {
  try {
    await dbConnect();
    const body = await req.json();
    const allowed: any = {};
    if (typeof body.name === 'string' && body.name.trim()) allowed.name = body.name.trim();
    if (typeof body.phone === 'string' && body.phone.trim()) allowed.phone = body.phone.trim();
    if (typeof body.avatar === 'string' && body.avatar.trim()) allowed.avatar = body.avatar.trim();
    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }
    allowed.updatedAt = new Date();
    const updated: any = await User.findByIdAndUpdate(user.userId, { $set: allowed }, { new: true }).lean();
    if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({
      id: updated._id.toString(),
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      avatar: updated.avatar,
      role: updated.role
    });
  } catch (e) {
    console.error('Profile update error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}, []);
