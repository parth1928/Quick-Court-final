'use client'

import React, { useState, useEffect } from 'react'
import { VenueCard } from '@/components/ui/venue-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search, 
  Filter, 
  MapPin, 
  SlidersHorizontal,
  Grid3X3,
  List
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Venue {
  _id: string
  name: string
  description: string
  sportsOffered: string[]
  address: {
    street: string
    city: string
    state: string
    pincode: string
    country: string
  }
  geoLocation: {
    lat: number
    lng: number
  }
  amenities: string[]
  pricePerHour: number
  images: string[]
  approvalStatus: 'pending' | 'approved' | 'rejected'
  isActive: boolean
  rating: number
  totalReviews: number
  operatingHours: {
    open: string
    close: string
  }
  owner?: {
    name: string
    email: string
  }
}

interface VenuesGridProps {
  className?: string
}

const sportsOptions = [
  'badminton', 'tennis', 'basketball', 'cricket', 'football', 
  'volleyball', 'table-tennis', 'squash', 'swimming'
]

const cityOptions = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi'
]

export function VenuesGrid({ className }: VenuesGridProps) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedSport, setSelectedSport] = useState<string>('')
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch venues from API
  const fetchVenues = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams()
      if (selectedCity) params.append('city', selectedCity)
      if (selectedSport) params.append('sport', selectedSport)
      if (priceRange.min) params.append('minPrice', priceRange.min)
      if (priceRange.max) params.append('maxPrice', priceRange.max)

      const response = await fetch(`/api/venues/new?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch venues: ${response.statusText}`)
      }

      const data = await response.json()
      setVenues(data.venues || [])
    } catch (err) {
      console.error('Error fetching venues:', err)
      setError(err instanceof Error ? err.message : 'Failed to load venues')
    } finally {
      setLoading(false)
    }
  }

  // Initial load and when filters change
  useEffect(() => {
    fetchVenues()
  }, [selectedCity, selectedSport, priceRange.min, priceRange.max])

  // Filter venues by search term
  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.sportsOffered.some(sport => 
      sport.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleBookVenue = (venueId: string) => {
    // Implement booking logic here
    console.log('Booking venue:', venueId)
    // You can navigate to booking page or open booking modal
    // Example: router.push(`/booking/${venueId}`)
  }

  const handleViewDetails = (venueId: string) => {
    // Implement view details logic here
    console.log('Viewing details for venue:', venueId)
    // You can navigate to venue details page or open details modal
    // Example: router.push(`/venues/${venueId}`)
  }

  const clearFilters = () => {
    setSelectedCity('')
    setSelectedSport('')
    setPriceRange({ min: '', max: '' })
    setSearchTerm('')
  }

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Loading Header */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        
        {/* Loading Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="text-red-500 mb-4">
          <h3 className="text-lg font-semibold">Error Loading Venues</h3>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={fetchVenues} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Available Venues</h1>
            <p className="text-muted-foreground">
              {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search venues, sports, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {(selectedCity || selectedSport || priceRange.min || priceRange.max) && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </Button>

            {(selectedCity || selectedSport || priceRange.min || priceRange.max) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Sport" />
                </SelectTrigger>
                <SelectContent>
                  {sportsOptions.map(sport => (
                    <SelectItem key={sport} value={sport}>
                      {sport.charAt(0).toUpperCase() + sport.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Min Price (₹)"
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              />

              <Input
                placeholder="Max Price (₹)"
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              />
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {filteredVenues.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No venues found</h3>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
          {(searchTerm || selectedCity || selectedSport || priceRange.min || priceRange.max) && (
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        )}>
          {filteredVenues.map((venue) => (
            <VenueCard
              key={venue._id}
              venue={venue}
              onBook={handleBookVenue}
              onViewDetails={handleViewDetails}
              className={viewMode === 'list' ? "max-w-none" : ""}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default VenuesGrid
