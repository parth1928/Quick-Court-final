"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Phone, CalendarDays, Map } from "lucide-react"
import { venues } from "@/lib/venuesData"

const venue = venues.find(v => v.id === 1)

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
          <div className="mb-2 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{venue.contact}</span>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <Map className="h-4 w-4" />
            <a href={venue.map} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View on Map</a>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>{venue.address}</span>
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
          {/* Time slots as mini calendar */}
          <div className="mb-4">
            <div className="font-semibold mb-1">Available Time Slots</div>
            <div className="grid grid-cols-4 gap-2">
              {venue.timeSlots?.map(slot => (
                <span key={slot} className="bg-gray-100 rounded px-2 py-1 text-xs text-gray-700 text-center">
                  {slot}
                </span>
              ))}
            </div>
          </div>
          {/* Written reviews */}
          <div className="mb-2">
            <div className="font-semibold mb-1">User Reviews</div>
            <div className="space-y-2">
              {venue.reviewsList?.map((r, i) => (
                <div key={i} className="border rounded p-2 bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="font-medium text-sm">{r.name}</span>
                    <span className="text-xs text-gray-500">({r.rating}★)</span>
                  </div>
                  <div className="text-xs text-gray-700">{r.comment}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
