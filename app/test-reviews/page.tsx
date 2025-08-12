"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ReviewsList } from '@/components/ui/reviews-list'
import { ReviewForm } from '@/components/ui/review-form'
import { StarRating } from '@/components/ui/star-rating'

export default function ReviewTestPage() {
  const [venueId, setVenueId] = useState('')
  const [showReviews, setShowReviews] = useState(false)

  const handleTest = () => {
    if (venueId.trim()) {
      setShowReviews(true)
    } else {
      alert('Please enter a venue ID')
    }
  }

  const sampleVenueId = '674ef8e15ae6a12ecaee63c8' // Replace with actual venue ID from your database

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Review System Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Venue ID (get this from your database)
            </label>
            <div className="flex space-x-2">
              <Input
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                placeholder="Enter venue ID (e.g., 674ef8e15ae6a12ecaee63c8)"
                className="flex-1"
              />
              <Button onClick={handleTest}>Test Reviews</Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>To test:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>First run: <code>node scripts/setup-sample-reviews.js</code></li>
              <li>Get a venue ID from your database</li>
              <li>Enter the venue ID above and click "Test Reviews"</li>
              <li>Try writing a review (you need to be logged in)</li>
            </ol>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Star Rating Demo:</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="w-16">Read-only:</span>
                <StarRating rating={4.5} showNumber size="md" />
              </div>
              <div className="flex items-center space-x-4">
                <span className="w-16">Interactive:</span>
                <StarRating rating={0} readonly={false} onChange={(rating) => alert(`Selected ${rating} stars`)} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showReviews && venueId && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Reviews for Venue: {venueId}</h2>
          
          <ReviewsList 
            venueId={venueId}
            venueName="Test Venue"
            showForm={true}
          />
        </div>
      )}
      
      {!showReviews && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Enter a venue ID above to test the review system</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
