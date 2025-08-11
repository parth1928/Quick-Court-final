"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MapPin, Star, Clock } from "lucide-react"

const popularVenues = [
  {
    id: 1,
    name: "Elite Sports Complex",
    location: "Downtown NYC",
    sports: ["Basketball", "Tennis"],
    price: "$25/hour",
    rating: 4.8,
    image: "/placeholder.svg?height=200&width=300&text=Elite+Sports+Complex",
  },
  {
    id: 2,
    name: "Community Recreation Center",
    location: "Brooklyn",
    sports: ["Volleyball", "Badminton"],
    price: "$15/hour",
    rating: 4.6,
    image: "/placeholder.svg?height=200&width=300&text=Community+Center",
  },
  {
    id: 3,
    name: "Premier Tennis Club",
    location: "Manhattan",
    sports: ["Tennis"],
    price: "$40/hour",
    rating: 4.9,
    image: "/placeholder.svg?height=200&width=300&text=Tennis+Club",
  },
  {
    id: 4,
    name: "Urban Basketball Arena",
    location: "Queens",
    sports: ["Basketball"],
    price: "$20/hour",
    rating: 4.7,
    image: "/placeholder.svg?height=200&width=300&text=Basketball+Arena",
  },
]

const popularSports = [
  {
    id: 1,
    name: "Basketball",
    venues: 45,
    image: "/placeholder.svg?height=150&width=200&text=Basketball",
  },
  {
    id: 2,
    name: "Tennis",
    venues: 32,
    image: "/placeholder.svg?height=150&width=200&text=Tennis",
  },
  {
    id: 3,
    name: "Volleyball",
    venues: 28,
    image: "/placeholder.svg?height=150&width=200&text=Volleyball",
  },
  {
    id: 4,
    name: "Badminton",
    venues: 22,
    image: "/placeholder.svg?height=150&width=200&text=Badminton",
  },
  {
    id: 5,
    name: "Football",
    venues: 18,
    image: "/placeholder.svg?height=150&width=200&text=Football",
  },
]

function CarouselSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [scrollPosition, setScrollPosition] = useState(0)

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById(`carousel-${title.replace(/\s+/g, "-").toLowerCase()}`)
    if (container) {
      const scrollAmount = 300
      const newPosition =
        direction === "left" ? Math.max(0, scrollPosition - scrollAmount) : scrollPosition + scrollAmount

      container.scrollTo({ left: newPosition, behavior: "smooth" })
      setScrollPosition(newPosition)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={() => scroll("left")} disabled={scrollPosition === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scroll("right")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        id={`carousel-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAuthenticated={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome back! Ready to play?</h1>
            <p className="text-lg mb-6 text-blue-100">
              Discover amazing sports venues near you and book your next game instantly.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="secondary">
                Book Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Browse Venues
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">150+</div>
              <div className="text-sm text-gray-600">Venues</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">25+</div>
              <div className="text-sm text-gray-600">Sports</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">5K+</div>
              <div className="text-sm text-gray-600">Bookings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">4.8</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Venues Carousel */}
        <CarouselSection title="Popular Venues">
          {popularVenues.map((venue) => (
            <Card
              key={venue.id}
              className="flex-shrink-0 w-80 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            >
              <img src={venue.image || "/placeholder.svg"} alt={venue.name} className="w-full h-48 object-cover" />
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{venue.name}</h3>
                <p className="text-gray-600 text-sm mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {venue.location}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {venue.sports.map((sport) => (
                    <Badge key={sport} variant="secondary" className="text-xs">
                      {sport}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-blue-600">{venue.price}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm ml-1">{venue.rating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CarouselSection>

        {/* Popular Sports Carousel */}
        <CarouselSection title="Popular Sports">
          {popularSports.map((sport) => (
            <Card
              key={sport.id}
              className="flex-shrink-0 w-64 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            >
              <img src={sport.image || "/placeholder.svg"} alt={sport.name} className="w-full h-32 object-cover" />
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-lg mb-1">{sport.name}</h3>
                <p className="text-gray-600 text-sm">{sport.venues} venues available</p>
              </CardContent>
            </Card>
          ))}
        </CarouselSection>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Recent Activity</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Elite Sports Complex</h3>
                  <Badge variant="outline">Completed</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">Basketball Court A</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  Jan 20, 2024 • 2:00 PM - 3:00 PM
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Community Recreation Center</h3>
                  <Badge>Upcoming</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">Tennis Court 2</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  Jan 25, 2024 • 4:00 PM - 5:00 PM
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
