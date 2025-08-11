import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Court from '@/models/Court';

import { isValidObjectId } from 'mongoose';

// GET /api/venues/[id]/courts - list active courts for a venue
export async function GET(
	_request: Request,
	context: { params: Promise<{ id: string }> | { id: string } }
) {
	try {
		await dbConnect();
		// Await params as per Next.js guidance
		const params = await context.params;
		const venueId = params.id;
		
		// Validate venue ID format
		if (!venueId || !isValidObjectId(venueId)) {
			return NextResponse.json(
				{ error: 'Invalid venue ID format' },
				{ status: 400 }
			);
		}

		// Find active courts for the venue
		const courts = await Court.find({ 
			venue: venueId,
			isActive: true,
			status: 'active'
		})
		.select('_id name sport sportType pricing pricePerHour')
		.lean();

		if (!courts || courts.length === 0) {
			console.log('No courts found for venue:', venueId);
			return NextResponse.json({ courts: [] });
		}

		// Format court data for response
		const formattedCourts = courts.map((c: any) => ({
			_id: c._id.toString(),
			name: c.name,
			sport: c.sportType || c.sport || 'Unknown', // Prefer sportType (string) over sport (ObjectId)
			pricePerHour: c.pricing?.hourlyRate || c.pricePerHour || 0
		}));

		console.log('Found courts for venue:', venueId, 'Courts:', formattedCourts.length);
		return NextResponse.json({ courts: formattedCourts });
	} catch (error: any) {
		console.error('Error fetching venue courts:', error);
		return NextResponse.json(
			{ error: error.message || 'Internal server error' },
			{ status: 500 }
		);
	}
}

