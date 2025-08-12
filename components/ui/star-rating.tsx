import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
  readonly?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  showNumber = false, 
  readonly = true,
  onChange,
  className 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const handleStarClick = (starRating: number) => {
    if (!readonly && onChange) {
      onChange(starRating)
    }
  }

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, i) => {
          const starRating = i + 1
          const isHalfStar = rating >= i + 0.5 && rating < starRating
          const isFullStar = rating >= starRating
          
          return (
            <button
              key={i}
              type="button"
              disabled={readonly}
              onClick={() => handleStarClick(starRating)}
              className={cn(
                'relative transition-colors',
                !readonly && 'hover:scale-110 cursor-pointer',
                readonly && 'cursor-default'
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-colors',
                  isFullStar 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'fill-gray-200 text-gray-200'
                )}
              />
              {isHalfStar && (
                <Star
                  className={cn(
                    sizeClasses[size],
                    'absolute top-0 left-0 fill-yellow-400 text-yellow-400 transition-colors'
                  )}
                  style={{
                    clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
      {showNumber && (
        <span className={cn('font-medium text-gray-700', textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

interface RatingDistributionProps {
  distribution: Array<{
    rating: number
    count: number
  }>
  totalReviews: number
  className?: string
}

export function RatingDistribution({ distribution, totalReviews, className }: RatingDistributionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {distribution.map(({ rating, count }) => {
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
        
        return (
          <div key={rating} className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1 w-12">
              <span className="text-gray-600">{rating}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-gray-600 w-8 text-right">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

interface ReviewSummaryProps {
  averageRating: number
  totalReviews: number
  distribution: Array<{
    rating: number
    count: number
  }>
  className?: string
}

export function ReviewSummary({ averageRating, totalReviews, distribution, className }: ReviewSummaryProps) {
  return (
    <div className={cn('bg-white p-6 rounded-lg border', className)}>
      <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
      
      <div className="flex items-start space-x-6">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={averageRating} size="lg" className="justify-center mb-2" />
          <div className="text-sm text-gray-600">
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </div>
        </div>
        
        {/* Rating Distribution */}
        <div className="flex-1">
          <RatingDistribution 
            distribution={distribution}
            totalReviews={totalReviews}
          />
        </div>
      </div>
    </div>
  )
}
