"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  PriceRangeSlider, 
  RatingSlider, 
  DurationSlider, 
  TimeRangeSlider, 
  MinimalSlider 
} from "@/components/ui/enhanced-slider"
import { Badge } from "@/components/ui/badge"

export default function SliderShowcase() {
  const [priceRange, setPriceRange] = useState([20, 80])
  const [ratingRange, setRatingRange] = useState([3.5])
  const [durationRange, setDurationRange] = useState([2])
  const [timeRange, setTimeRange] = useState([9, 18])
  const [utilizationRange, setUtilizationRange] = useState([75])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Enhanced Slider Components
          </h1>
          <p className="text-gray-600 text-lg">
            Origin UI inspired sliders integrated into Quick Court application
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price Range Slider */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Price Range Slider
                <Badge variant="secondary">Venues Filter</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Used in venue filtering to set price range for court bookings
              </p>
              <PriceRangeSlider 
                value={priceRange} 
                onValueChange={setPriceRange} 
                max={100} 
                min={0} 
                step={5}
                currency="$"
              />
              <div className="text-xs text-gray-500 text-center">
                Current range: ${priceRange[0]} - ${priceRange[1]} per hour
              </div>
            </CardContent>
          </Card>

          {/* Rating Slider */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Rating Filter Slider
                <Badge variant="secondary">Venues Filter</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Filter venues by minimum rating threshold
              </p>
              <RatingSlider 
                value={ratingRange} 
                onValueChange={setRatingRange} 
                max={5}
              />
              <div className="text-xs text-gray-500 text-center">
                Showing venues with {ratingRange[0]}+ stars
              </div>
            </CardContent>
          </Card>

          {/* Duration Slider */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Duration Slider
                <Badge variant="secondary">Booking</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Set preferred booking duration for court reservations
              </p>
              <DurationSlider 
                value={durationRange} 
                onValueChange={setDurationRange} 
                min={1} 
                max={8}
              />
              <div className="text-xs text-gray-500 text-center">
                Preferred duration: {durationRange[0]} hour{durationRange[0] !== 1 ? 's' : ''}
              </div>
            </CardContent>
          </Card>

          {/* Time Range Slider */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Time Range Slider
                <Badge variant="secondary">Time Management</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Configure daily operating hours for facilities
              </p>
              <TimeRangeSlider 
                value={timeRange} 
                onValueChange={setTimeRange} 
                min={6} 
                max={23}
              />
              <div className="text-xs text-gray-500 text-center">
                Operating hours: {timeRange[0] > 12 ? timeRange[0] - 12 : timeRange[0]}:00 {timeRange[0] >= 12 ? 'PM' : 'AM'} - {timeRange[1] > 12 ? timeRange[1] - 12 : timeRange[1]}:00 {timeRange[1] >= 12 ? 'PM' : 'AM'}
              </div>
            </CardContent>
          </Card>

          {/* Minimal Slider */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Minimal Slider
                <Badge variant="secondary">Reports & Analytics</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Clean, minimal slider for filtering utilization rates in reports
              </p>
              <div className="max-w-md mx-auto">
                <MinimalSlider 
                  value={utilizationRange} 
                  onValueChange={setUtilizationRange} 
                  max={100} 
                  min={0} 
                  color="green"
                />
                <div className="text-xs text-gray-500 text-center mt-2">
                  Minimum utilization rate: {utilizationRange[0]}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Pages Enhanced</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                    <strong>Venues Page:</strong> Price range & rating filters
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <strong>Booking Page:</strong> Duration selection slider
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    <strong>Time Management:</strong> Operating hours slider
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    <strong>Tournament Hosting:</strong> Entry fee & prize pool sliders
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    <strong>Reports:</strong> Revenue, time, and utilization filters
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Slider Features</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    Dual thumb support for ranges
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    Custom formatting (currency, time, ratings)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    Color-coded for different contexts
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    Accessible with ARIA labels
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    Origin UI inspired design
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
