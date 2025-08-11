"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star } from "lucide-react"
import { venues } from "@/lib/venuesData"

const venue = venues.find(v => v.id === 5)

export default function VenueDetailPage() {
  if (!venue) return <div className="p-8">Venue not found.</div>
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <img src={venue.image} alt={venue.name} className="w-full h-64 object-cover rounded-t-lg" />
        <CardHeader>
          <CardTitle>{venue.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4" />
            <span>{venue.location}</span>
          </div>
          <div className="flex gap-2 mb-2">
            {venue.sports.map(sport => (
              <Badge key={sport}>{sport}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span>{venue.rating}</span>
            <span className="text-xs text-gray-500">({venue.reviews} reviews)</span>
          </div>
          <div className="mb-2 font-semibold">Price: ₹{venue.price}/hour</div>
          <div className="mb-2">Amenities: {venue.amenities.join(", ")}</div>
        </CardContent>
      </Card>
    </div>
  )
}
