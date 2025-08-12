import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StarRating, ReviewSummary } from '@/components/ui/star-rating'
import { ReviewForm } from '@/components/ui/review-form'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle, ThumbsUp, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Review {
  id: string
  rating: number
  comment: string
  userName: string
  userEmail: string
  userId: string
  createdAt: string
  updatedAt: string
  timeAgo: string
}

interface ReviewsListProps {
  venueId: string
  venueName: string
  showForm?: boolean
  className?: string
}

export function ReviewsList({ venueId, venueName, showForm = true, className }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  })

  const loadReviews = async (page = 1) => {
    try {
      setLoading(true)
      setError('')

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://192.168.102.132:3000'
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
        sortBy,
        sortOrder
      })

      const response = await fetch(`${baseUrl}/api/venues/${venueId}/reviews?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Failed to load reviews`)
      }

      if (result.success) {
        setReviews(result.data.reviews)
        setStats(result.data.stats)
        setPagination(result.data.pagination)
        setCurrentPage(page)
      } else {
        throw new Error(result.error || 'Failed to load reviews')
      }
    } catch (error: any) {
      console.error('Failed to load reviews:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews(1)
  }, [venueId, sortBy, sortOrder])

  const handleReviewSubmitted = (newReview: Review) => {
    // Add new review to the beginning of the list
    setReviews(prev => [newReview, ...prev])
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalReviews: prev.totalReviews + 1,
      // Note: averageRating will be recalculated on next load
    }))

    // Hide form
    setShowReviewForm(false)
    
    // Reload reviews to get updated stats
    setTimeout(() => loadReviews(1), 1000)
  }

  const handlePageChange = (page: number) => {
    loadReviews(page)
  }

  if (loading && reviews.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Review Summary */}
      {stats.totalReviews > 0 && (
        <ReviewSummary
          averageRating={stats.averageRating}
          totalReviews={stats.totalReviews}
          distribution={stats.ratingDistribution}
        />
      )}

      {/* Review Form Toggle */}
      {showForm && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          <Button
            variant="outline"
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="flex items-center space-x-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{showReviewForm ? 'Cancel' : 'Write Review'}</span>
            {showReviewForm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Review Form */}
      {showForm && showReviewForm && (
        <ReviewForm
          venueId={venueId}
          venueName={venueName}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Filters and Sort */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="rating-desc">Highest Rating</SelectItem>
                <SelectItem value="rating-asc">Lowest Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-gray-600">
            {pagination.total} review{pagination.total !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {/* User Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {review.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{review.userName}</h4>
                      <div className="flex items-center space-x-2">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-sm text-gray-500">{review.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  
                  {/* Review Actions */}
                  <div className="flex items-center space-x-4 mt-3">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Helpful
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Reviews Message */}
      {!loading && reviews.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your experience with {venueName}!
            </p>
            {showForm && (
              <Button onClick={() => setShowReviewForm(true)}>
                Write the First Review
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrev}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNext}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
