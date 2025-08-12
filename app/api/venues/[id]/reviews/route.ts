import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Review from '@/models/Review';
import Venue from '@/models/Venue';
import User from '@/models/User';
import { Types } from 'mongoose';

// GET /api/venues/[id]/reviews - Get all reviews for a venue
export const GET = async (request: NextRequest) => {
  try {
    await dbConnect();
    
    // Extract venue ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const venueId = pathSegments[pathSegments.length - 2]; // venues/[id]/reviews
    
    console.log('📝 Fetching reviews for venue:', venueId);
    
    if (!Types.ObjectId.isValid(venueId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid venue ID format' },
        { status: 400 }
      );
    }

    // Get query parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get reviews with pagination
    const reviews = await Review.find({ 
      venue: venueId,
      deletedAt: null 
    })
    .populate('user', 'firstName lastName email')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

    // Get total count for pagination
    const total = await Review.countDocuments({ 
      venue: venueId,
      deletedAt: null 
    });

    // Transform reviews for frontend
    const transformedReviews = reviews.map(review => {
      const user = review.user as any;
      return {
        id: review._id.toString(),
        rating: review.rating,
        comment: review.comment,
        userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Anonymous',
        userEmail: user?.email || '',
        userId: user?._id?.toString() || '',
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        timeAgo: getTimeAgo(review.createdAt)
      };
    });

    // Get venue rating stats
    const venue = await Venue.findById(venueId).select('rating reviewCount');
    const ratingStats = await Review.aggregate([
      { $match: { venue: new Types.ObjectId(venueId), deletedAt: null } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Create rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: ratingStats.find(stat => stat._id === rating)?.count || 0
    }));

    console.log('✅ Found reviews:', transformedReviews.length);

    return NextResponse.json({
      success: true,
      data: {
        reviews: transformedReviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        stats: {
          averageRating: venue?.rating || 0,
          totalReviews: venue?.reviewCount || 0,
          ratingDistribution
        }
      }
    });

  } catch (error: any) {
    console.error('💥 Error fetching reviews:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch reviews',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
};

// POST /api/venues/[id]/reviews - Create a new review (requires auth)
export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();
    
    // Extract venue ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const venueId = pathSegments[pathSegments.length - 2];
    
    console.log('📝 Creating review for venue:', venueId, 'by user:', user.userId);
    
    if (!Types.ObjectId.isValid(venueId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid venue ID format' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { rating, comment } = data;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Comment must be at least 5 characters long' },
        { status: 400 }
      );
    }

    // Check if venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return NextResponse.json(
        { success: false, error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Check if user already reviewed this venue
    const existingReview = await Review.findOne({
      venue: venueId,
      user: user.userId,
      deletedAt: null
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this venue. You can update your existing review.' },
        { status: 409 }
      );
    }

    // Create new review
    const review = new Review({
      venue: venueId,
      user: user.userId,
      rating: parseInt(rating),
      comment: comment.trim(),
      createdBy: user.userId
    });

    await review.save();

    // Populate user data for response
    await review.populate('user', 'firstName lastName email');

    const reviewUser = review.user as any;
    const transformedReview = {
      id: review._id.toString(),
      rating: review.rating,
      comment: review.comment,
      userName: reviewUser ? `${reviewUser.firstName || ''} ${reviewUser.lastName || ''}`.trim() : 'Anonymous',
      userEmail: reviewUser?.email || '',
      userId: reviewUser?._id?.toString() || '',
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      timeAgo: getTimeAgo(review.createdAt)
    };

    console.log('✅ Review created successfully:', review._id);

    return NextResponse.json({
      success: true,
      data: {
        review: transformedReview,
        message: 'Review added successfully'
      }
    });

  } catch (error: any) {
    console.error('💥 Error creating review:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create review',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}, []);

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffMonths / 12)}y ago`;
}
