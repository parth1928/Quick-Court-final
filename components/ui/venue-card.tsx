'use client'

import React from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Star, 
  Clock, 
  Wifi, 
  Car, 
  Coffee, 
  Shield, 
  Zap,
  Droplets,
  Wind,
  Users,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VenueCardProps {
  venue: {
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
  onBook?: (venueId: string) => void
  onViewDetails?: (venueId: string) => void
  className?: string
}

// Amenity icons mapping
const amenityIcons = {
  'lights': Zap,
  'parking': Car,
  'showers': Droplets,
  'lockers': Shield,
  'cafeteria': Coffee,
  'first-aid': Shield,
  'ac': Wind,
  'wifi': Wifi,
  'equipment-rental': Users,
  'pro-shop': Users
}

// Sport colors for badges
const sportColors = {
  'badminton': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  'tennis': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'basketball': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  'cricket': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  'football': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  'volleyball': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
  'table-tennis': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
  'squash': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  'swimming': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400'
}

export function VenueCard({ venue, onBook, onViewDetails, className }: VenueCardProps) {
  const handleBookClick = () => {
    if (onBook) {
      onBook(venue._id)
    }
  }

  const handleViewDetailsClick = () => {
    if (onViewDetails) {
      onViewDetails(venue._id)
    }
  }

  const mainImage = venue.images?.[0] || '/placeholder.jpg'
  const isApproved = venue.approvalStatus === 'approved' && venue.isActive

  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      !isApproved && "opacity-75",
      className
    )}>
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={mainImage}
          alt={venue.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Status Badge */}
        {venue.approvalStatus !== 'approved' && (
          <div className="absolute top-3 right-3">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs font-medium",
                venue.approvalStatus === 'pending' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
                venue.approvalStatus === 'rejected' && "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
              )}
            >
              {venue.approvalStatus.charAt(0).toUpperCase() + venue.approvalStatus.slice(1)}
            </Badge>
          </div>
        )}

        {/* Rating Badge */}
        {venue.rating > 0 && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{venue.rating.toFixed(1)}</span>
              <span className="text-gray-300">({venue.totalReviews})</span>
            </div>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-white/90 dark:bg-black/70 text-black dark:text-white px-3 py-1 rounded-full text-sm font-semibold">
            ₹{venue.pricePerHour}/hr
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Venue Name */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{venue.name}</h3>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">
            {venue.address.street}, {venue.address.city}, {venue.address.state} {venue.address.pincode}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {venue.description}
        </p>

        {/* Sports Offered */}
        <div className="mb-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Sports Available</h4>
          <div className="flex flex-wrap gap-1">
            {venue.sportsOffered.slice(0, 3).map((sport) => (
              <Badge 
                key={sport} 
                variant="secondary" 
                className={cn(
                  "text-xs capitalize",
                  sportColors[sport as keyof typeof sportColors] || "bg-gray-100 text-gray-800"
                )}
              >
                {sport.replace('-', ' ')}
              </Badge>
            ))}
            {venue.sportsOffered.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{venue.sportsOffered.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Operating Hours */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Clock className="h-4 w-4" />
          <span>{venue.operatingHours.open} - {venue.operatingHours.close}</span>
        </div>

        {/* Amenities */}
        {venue.amenities.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {venue.amenities.slice(0, 4).map((amenity) => {
                const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons] || Users
                return (
                  <div key={amenity} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconComponent className="h-3 w-3" />
                    <span className="capitalize">{amenity.replace('-', ' ')}</span>
                  </div>
                )
              })}
              {venue.amenities.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{venue.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button 
          onClick={handleViewDetailsClick}
          variant="outline" 
          className="flex-1"
          size="sm"
        >
          View Details
        </Button>
        <Button 
          onClick={handleBookClick}
          className="flex-1"
          size="sm"
          disabled={!isApproved}
        >
          <Calendar className="h-4 w-4 mr-1" />
          {isApproved ? 'Book Now' : 'Not Available'}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default VenueCard
