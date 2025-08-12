import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from '@/components/ui/star-rating'
import { Star, Send } from 'lucide-react'

interface ReviewFormProps {
  venueId: string
  venueName: string
  onReviewSubmitted?: (review: any) => void
  className?: string
}

export function ReviewForm({ venueId, venueName, onReviewSubmitted, className }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    
    if (comment.trim().length < 5) {
      setError('Please write at least 5 characters in your review')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to submit a review')
        return
      }

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://192.168.102.132:3000'
      const response = await fetch(`${baseUrl}/api/venues/${venueId}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim()
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Failed to submit review`)
      }

      if (result.success) {
        // Reset form
        setRating(0)
        setComment('')
        
        // Notify parent component
        if (onReviewSubmitted) {
          onReviewSubmitted(result.data.review)
        }
        
        alert('Review submitted successfully!')
      } else {
        throw new Error(result.error || 'Failed to submit review')
      }
    } catch (error: any) {
      console.error('Failed to submit review:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span>Write a Review for {venueName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating *
            </label>
            <StarRating
              rating={rating}
              readonly={false}
              onChange={setRating}
              size="lg"
              className="mb-2"
            />
            <p className="text-xs text-gray-500">
              {rating === 0 && 'Click on a star to rate'}
              {rating === 1 && '⭐ Poor - Really disappointed'}
              {rating === 2 && '⭐⭐ Fair - Could be better'}
              {rating === 3 && '⭐⭐⭐ Good - Met expectations'}
              {rating === 4 && '⭐⭐⭐⭐ Very Good - Exceeded expectations'}
              {rating === 5 && '⭐⭐⭐⭐⭐ Excellent - Outstanding experience!'}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this venue. What did you like? What could be improved?"
              rows={4}
              className="resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Minimum 5 characters</span>
              <span>{comment.length}/500</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={loading || rating === 0 || comment.trim().length < 5}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Review
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
