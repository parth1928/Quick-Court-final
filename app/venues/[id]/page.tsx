"use client"

import { useState } from "react"
import { formatInr } from "@/lib/format"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Star, Clock, Wifi, Car, Coffee, Users, ChevronLeft, ChevronRight, Phone, Mail } from "lucide-react"

const venue = {
  id: 1,
  name: "Elite Sports Complex",
  location: "12 Sports Avenue, Koramangala, Bengaluru, KA 560095",
  rating: 4.8,

  reviewCount: 124,

  description:
    "Elite Sports Complex is a premier sports facility offering state-of-the-art courts and amenities. Perfect for both casual players and serious athletes, our facility features professional-grade equipment and excellent customer service.",
  images: [
    "/placeholder.svg?height=400&width=600&text=Elite+Sports+Complex+Main",
    "/placeholder.svg?height=400&width=600&text=Basketball+Court",
    "/placeholder.svg?height=400&width=600&text=Tennis+Court",
    "/placeholder.svg?height=400&width=600&text=Locker+Room",
    "/placeholder.svg?height=400&width=600&text=Reception+Area",
  ],
  amenities: [
    { name: "Free Parking", icon: Car },
    { name: "WiFi", icon: Wifi },
    { name: "Locker Rooms", icon: Users },
    { name: "Cafeteria", icon: Coffee },
    { name: "Pro Shop", icon: Users },
    { name: "Air Conditioning", icon: Users },
  ],
  sports: ["Basketball", "Tennis", "Volleyball"],
  hours: {
    monday: "6:00 AM - 11:00 PM",
    tuesday: "6:00 AM - 11:00 PM",
    wednesday: "6:00 AM - 11:00 PM",
    thursday: "6:00 AM - 11:00 PM",
    friday: "6:00 AM - 12:00 AM",
    saturday: "7:00 AM - 12:00 AM",
    sunday: "7:00 AM - 10:00 PM",
  },
  contact: {
    phone: "+91 98765 43210",
    email: "info@elitesportsarena.in",
  },
  reviews: [
    {
      id: 1,
      name: "John Smith",
      rating: 5,
      date: "2024-01-15",
      comment: "Excellent facility with top-notch equipment. The staff is very friendly and helpful. Highly recommend!",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      rating: 4,
      date: "2024-01-10",
      comment: "Great courts and clean facilities. The only downside is that it can get quite busy during peak hours.",
    },
    {
      id: 3,
      name: "Mike Wilson",
      rating: 5,
      date: "2024-01-08",
      comment: "Been coming here for months. Consistently great experience. The booking system is easy to use.",
    },
  ],
}

export default function VenueDetailPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % venue.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + venue.images.length) % venue.images.length)
  }

  return (
    <div className="min-h-screen bg-gray-50">

  <Header />


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/venues" className="hover:text-blue-600">
            Venues
          </Link>
          <span>/</span>
          <span className="text-gray-900">{venue.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Venue Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{venue.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 font-semibold">{venue.rating}</span>

                  <span className="ml-1 text-gray-500">({venue.reviews.length} reviews)</span>

                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{venue.location}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {venue.sports.map((sport) => (
                  <Badge key={sport} variant="secondary">
                    {sport}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={venue.images[currentImageIndex] || "/placeholder.svg"}
                    alt={`${venue.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {venue.images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Venue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{venue.description}</p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Operating Hours
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Monday - Thursday:</span>
                            <span>{venue.hours.monday}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Friday - Saturday:</span>
                            <span>{venue.hours.friday}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sunday:</span>
                            <span>{venue.hours.sunday}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Contact Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{venue.contact.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{venue.contact.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos">
                <Card>
                  <CardHeader>
                    <CardTitle>Photo Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {venue.images.map((image, index) => (
                        <img
                          key={index}
                          src={image || "/placeholder.svg"}
                          alt={`${venue.name} - Photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities">
                <Card>
                  <CardHeader>
                    <CardTitle>Amenities & Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {venue.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <amenity.icon className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium">{amenity.name}</span>
                        </div>
                      ))}
                    </div>
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
                      {venue.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{review.name}</span>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Book This Venue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <span className="text-3xl font-bold text-blue-600">{formatInr(950)}</span>
                  <span className="text-gray-600">/hour (incl. taxes)</span>
                </div>

                <Button className="w-full" size="lg" asChild>
                  <Link href={`/venues/${venue.id}/booking`}>Book Now</Link>
                </Button>

                <div className="text-center text-sm text-gray-500">
                  <p>Free cancellation up to 24 hours before</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Quick Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Available Sports:</span>
                      <span>{venue.sports.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amenities:</span>
                      <span>{venue.amenities.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rating:</span>
                      <span>{venue.rating}/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
