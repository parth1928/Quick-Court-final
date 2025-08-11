import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Tournament from '@/models/Tournament';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (_req: Request, user: any) => {
  await dbConnect();
  const tournaments = await Tournament.find({ 'participants.user': user.userId })
    .sort({ startDate: 1 })
    .lean();

  const now = new Date();
  const registrations = tournaments.map((t: any) => {
    let derivedStatus: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' = 'upcoming';
    if (t.status === 'completed') derivedStatus = 'completed';
    else if (t.status === 'cancelled') derivedStatus = 'cancelled';
    else if (t.status === 'ongoing') derivedStatus = 'ongoing';
    else if (t.status === 'open') {
      if (new Date(t.startDate) <= now && new Date(t.endDate) >= now) derivedStatus = 'ongoing';
      else if (new Date(t.endDate) < now) derivedStatus = 'completed';
      else derivedStatus = 'upcoming';
    }

    const participant = (t.participants as any[])?.find(p => p.user.toString() === user.userId);

    return {
      id: t._id.toString(),
      tournamentId: t._id.toString(),
      tournamentName: t.name,
      sport: t.sport,
      venue: t.venue || 'TBA',
      location: t.location || 'TBA',
      startDate: t.startDate,
      endDate: t.endDate,
      status: derivedStatus,
      registrationDate: participant?.registrationDate || t.createdAt,
      entryFee: t.entryFee || 0,
      participationType: 'individual',
      image: '/placeholder.svg?height=200&width=300&text=' + encodeURIComponent(t.sport + '+Tournament'),
      position: undefined,
      prize: undefined,
      matchesPlayed: undefined,
      matchesWon: undefined,
      points: undefined,
      nextMatch: undefined,
    };
  });

  return NextResponse.json({ registrations });
}, ['user']);
