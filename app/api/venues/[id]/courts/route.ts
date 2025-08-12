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
		
		console.log('🔍 Courts API called for venue:', venueId);
		
		// Validate venue ID format
		if (!venueId || !isValidObjectId(venueId)) {
			console.log('❌ Invalid venue ID format:', venueId);
			return NextResponse.json(
				{ error: 'Invalid venue ID format' },
				{ status: 400 }
			);
		}

		console.log('🔎 Searching for courts with venue:', venueId);
		
		// Find active courts for the venue
		const courts = await Court.find({ 
			venue: venueId,
			isActive: true
		})
		.select('_id name sport sportType pricing pricePerHour availability')
		.lean();

		console.log('📋 Found courts from DB:', courts?.length || 0, courts);

		if (!courts || courts.length === 0) {
			console.log('No courts found for venue:', venueId);
			return NextResponse.json({ courts: [] });
		}

		// Format court data for response
		const formattedCourts = courts.map((c: any) => ({
			_id: c._id.toString(),
			name: c.name,
			sportType: c.sportType || c.sport || 'Unknown', // Prefer sportType (string) over sport (ObjectId)
			pricing: {
				hourlyRate: c.pricing?.hourlyRate || c.pricePerHour || 0,
				currency: c.pricing?.currency || 'INR'
			},
			pricePerHour: c.pricing?.hourlyRate || c.pricePerHour || 0,
			isActive: c.isActive,
			availability: c.availability || {
				monday: { open: '09:00', close: '22:00' },
				tuesday: { open: '09:00', close: '22:00' },
				wednesday: { open: '09:00', close: '22:00' },
				thursday: { open: '09:00', close: '22:00' },
				friday: { open: '09:00', close: '22:00' },
				saturday: { open: '09:00', close: '22:00' },
				sunday: { open: '09:00', close: '22:00' }
			}
		}));

		console.log('✅ Formatted courts response:', formattedCourts.length, 'courts');
		return NextResponse.json({ courts: formattedCourts });
	} catch (error: any) {
		console.error('Error fetching venue courts:', error);
		return NextResponse.json(
			{ error: error.message || 'Internal server error' },
			{ status: 500 }
		);
	}
}

