import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Tournament from '@/models/Tournament';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (_req: Request, _user: any, { params }: any) => {
  await dbConnect();
  const tournament = await Tournament.findById(params.id).lean();
  if (!tournament) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ tournament });
}, []);

export const PATCH = withAuth(async (req: Request, user: any, { params }: any) => {
  await dbConnect();
  const tournament = await Tournament.findById(params.id);
  if (!tournament) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (tournament.createdBy.toString() !== user.userId && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const updates = await req.json();
  Object.assign(tournament, updates, { updatedAt: new Date() });
  await tournament.save();
  return NextResponse.json({ tournament });
}, []);

export const DELETE = withAuth(async (_req: Request, user: any, { params }: any) => {
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await dbConnect();
  await Tournament.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}, []);
