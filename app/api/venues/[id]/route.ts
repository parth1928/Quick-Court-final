import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Venue from '@/models/Venue';
import Review from '@/models/Review';

// GET /api/venues/:id - public venue detail (no auth needed for viewing)
export async function GET(req: Request, context: { params: { id: string } }) {
  const { params } = context;
  try {
    await dbConnect();
    const venueDoc = await Venue.findById(params.id).lean();
    if (!venueDoc) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }
    const venue: any = venueDoc as any;

    // Pull latest 5 reviews (if Review model present)
  const reviews: any[] = await Review.find({ venue: params.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('rating comment createdAt user')
      .populate('user', 'name')
      .lean()
      .catch(() => []);

    // Normalize fields expected by frontend
    const data: any = {
      id: venue._id.toString(),
      name: venue.name,
      location: venue.shortLocation || (venue.address ? `${venue.address.street ? venue.address.street + ', ' : ''}${venue.address.city || ''}${venue.address.state ? ', ' + venue.address.state : ''}` : ''),
      rating: venue.rating || 0,
      reviewCount: venue.reviewCount || 0,
      description: venue.description || '',
      images: venue.images?.length ? venue.images : venue.photos || [],
      amenities: (venue.amenities || []).map((a: string) => ({ name: a })),
      sports: venue.sports || [],
      hours: venue.openingHours || {},
      startingPrice: venue.startingPrice || 0,
      fullAddress: venue.fullAddress || '',
      contactNumber: venue.contactNumber || venue.contactPhone || '',
      mapLink: venue.mapLink || '',
      defaultAvailableSlots: venue.defaultAvailableSlots || [],
      reviews: reviews.map((r: any) => ({
        id: r._id?.toString?.() || '',
        name: r.user?.name || 'User',
        rating: r.rating,
        date: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : '',
        comment: r.comment
      })).concat((venue.embeddedReviews || []).map((er: any, idx: number) => ({
        id: `e-${idx}`,
        name: er.userName,
        rating: er.rating,
        date: er.createdAt ? new Date(er.createdAt).toISOString().split('T')[0] : '',
        comment: er.comment
      })))
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching venue detail', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
