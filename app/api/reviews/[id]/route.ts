import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Review from '@/models/Review';
import { Types } from 'mongoose';

// PUT /api/reviews/[id] - Update a review
export const PUT = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();
    
    // Extract review ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const reviewId = pathSegments[pathSegments.length - 1];
    
    console.log('📝 Updating review:', reviewId, 'by user:', user.userId);
    
    if (!Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid review ID format' },
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

    // Find the review
    const review = await Review.findOne({
      _id: reviewId,
      user: user.userId,
      deletedAt: null
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    // Update the review
    review.rating = parseInt(rating);
    review.comment = comment.trim();
    review.updatedBy = user.userId;
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
      timeAgo: getTimeAgo(review.updatedAt)
    };

    console.log('✅ Review updated successfully:', review._id);

    return NextResponse.json({
      success: true,
      data: {
        review: transformedReview,
        message: 'Review updated successfully'
      }
    });

  } catch (error: any) {
    console.error('💥 Error updating review:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update review',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}, []);

// DELETE /api/reviews/[id] - Delete a review
export const DELETE = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();
    
    // Extract review ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const reviewId = pathSegments[pathSegments.length - 1];
    
    console.log('🗑️ Deleting review:', reviewId, 'by user:', user.userId);
    
    if (!Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid review ID format' },
        { status: 400 }
      );
    }

    // Find the review
    const review = await Review.findOne({
      _id: reviewId,
      user: user.userId,
      deletedAt: null
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Soft delete the review
    review.deletedAt = new Date();
    review.updatedBy = user.userId;
    await review.save();

    console.log('✅ Review deleted successfully:', review._id);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Review deleted successfully'
      }
    });

  } catch (error: any) {
    console.error('💥 Error deleting review:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete review',
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
