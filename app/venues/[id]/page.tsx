"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Star, Clock, Phone, Users } from "lucide-react"
import { formatInr } from "@/lib/format"

interface ApiReview {
  id: string
  name: string
  rating: number
  comment: string
  date?: string
}

interface ApiVenueDetail {
  id: string
  name: string
  location: string
  rating: number
  reviewCount: number
  description: string
  images: string[]
  amenities: { name: string }[]
  sports: string[]
  hours: Record<string, any>
  startingPrice: number
  fullAddress: string
  contactNumber: string
  mapLink: string
  defaultAvailableSlots: string[]
  reviews: ApiReview[]
}

export default function VenueDetailPage({ params }: { params: { id: string } }) {
  const [venue, setVenue] = useState<ApiVenueDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVenue = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/venues/${params.id}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load venue')
        setVenue(json)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchVenue()
  }, [params.id])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading venue...</div>
  if (error || !venue) return <div className="min-h-screen flex items-center justify-center text-red-600">{error || 'Venue not found'}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/venues" className="hover:text-blue-600">Venues</Link>
          <span>/</span>
          <span className="text-gray-900">{venue.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{venue.name}</h1>
              <div className="flex items-center flex-wrap gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 font-semibold">{venue.rating?.toFixed(1)}</span>
                  <span className="ml-1 text-gray-500">({venue.reviewCount} reviews)</span>
                </div>
                {venue.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{venue.location}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {venue.sports?.map(sport => (
                  <Badge key={sport} variant="secondary">{sport}</Badge>
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <img
                  src={venue.images?.[0] || "/placeholder.svg"}
                  alt={venue.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </CardContent>
            </Card>

            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Venue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      {venue.description && (
                        <div>
                          <h4 className="font-semibold mb-2">Description</h4>
                          <p className="text-gray-600 whitespace-pre-line">{venue.description}</p>
                        </div>
                      )}
                      {venue.fullAddress && (
                        <div>
                          <h4 className="font-semibold mb-2">Address</h4>
                          <p className="text-gray-600">{venue.fullAddress}</p>
                        </div>
                      )}
                      {venue.contactNumber && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center"><Phone className="h-4 w-4 mr-2" />Contact</h4>
                          <p className="text-gray-600">{venue.contactNumber}</p>
                        </div>
                      )}
                      {venue.defaultAvailableSlots?.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center"><Clock className="h-4 w-4 mr-2" />Available Time Slots</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {venue.defaultAvailableSlots.map(slot => (
                              <Badge key={slot} variant="outline" className="text-center">{slot}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {venue.mapLink && (
                        <div>
                          <Button asChild className="w-full">
                            <Link href={venue.mapLink} target="_blank">View on Map</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities">
                <Card>
                  <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {venue.amenities?.length ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {venue.amenities.map(a => (
                          <div key={a.name} className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <span>{a.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No amenities listed.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {venue.reviews?.length ? venue.reviews.map(r => (
                        <div key={r.id} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{r.name}</h4>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          {r.date && <p className="text-xs text-gray-400 mb-1">{r.date}</p>}
                          <p className="text-gray-600 text-sm">{r.comment}</p>
                        </div>
                      )) : <p className="text-gray-500 text-sm">No reviews yet.</p>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book This Venue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-2xl font-bold">{formatInr(venue.startingPrice || 0)}</span>
                    <span className="text-gray-600">/hour</span>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/venues/${venue.id}/booking`}>Book Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Sports:</span><span>{venue.sports?.join(', ') || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Rating:</span><span>{venue.rating?.toFixed(1)}/5</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Reviews:</span><span>{venue.reviewCount}</span></div>
                  {venue.hours && Object.keys(venue.hours).length > 0 && (
                    <div>
                      <span className="text-gray-600 block mb-1">Hours:</span>
                      <div className="space-y-1 max-h-40 overflow-auto pr-1">
                        {Object.entries(venue.hours).map(([day, hrs]) => (
                          <div key={day} className="flex justify-between"><span className="capitalize text-gray-500">{day}</span><span className="ml-4">{typeof hrs === 'string' ? hrs : (hrs as any).open ? `${(hrs as any).open} - ${(hrs as any).close}` : '—'}</span></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
