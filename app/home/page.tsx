"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MapPin, Star, Clock } from "lucide-react"
import { ScrollXCarousel, ScrollXCarouselContainer, ScrollXCarouselProgress, ScrollXCarouselWrap } from "@/components/ui/scroll-x-carousel"
import { CardHoverReveal, CardHoverRevealContent, CardHoverRevealMain } from "@/components/ui/reveal-on-hover"

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

const featuredFacilities = [
  {
    id: 'facility-1',
    title: 'Elite Basketball Courts',
    description: 'Professional-grade basketball courts with regulation dimensions and premium flooring.',
    services: ['5v5 games', 'Training', 'Tournaments'],
    type: 'Premium',
    price: '$35/hour',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2490&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'facility-2',
    title: 'Championship Tennis Courts',
    description: 'Premium tennis courts with professional surface and advanced lighting systems.',
    services: ['Singles', 'Doubles', 'Coaching', 'Leagues'],
    type: 'Professional',
    price: '$45/hour',
    imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=2489&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'facility-3',
    title: 'Multi-Sport Arena',
    description: 'Versatile indoor arena supporting volleyball, badminton, and futsal with premium amenities.',
    services: ['Volleyball', 'Badminton', 'Futsal', 'Events'],
    type: 'Multi-Sport',
    price: '$30/hour',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2490&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'facility-4',
    title: 'Olympic Swimming Pool',
    description: '50-meter Olympic standard swimming pool with advanced filtration and heating systems.',
    services: ['Lap swimming', 'Training', 'Competitions', 'Lessons'],
    type: 'Aquatic',
    price: '$25/hour',
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=2490&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
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

  <Header />


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

        {/* Featured Facilities Carousel */}
        <div className="mb-12">
          <ScrollXCarousel className="h-[120vh]">
            <ScrollXCarouselContainer className="h-dvh place-content-center flex flex-col gap-6 py-8">
              {/* Gradient Overlays */}
              <div className="pointer-events-none w-[8vw] h-[103%] absolute inset-[0_auto_0_0] z-10 bg-[linear-gradient(90deg,_rgb(249_250_251)_35%,_transparent)]" />
              <div className="pointer-events-none bg-[linear-gradient(270deg,_rgb(249_250_251)_35%,_transparent)] w-[10vw] h-[103%] absolute inset-[0_0_0_auto] z-10" />

              {/* Section Header */}
              <div className="text-center mb-6 px-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Premium Facilities</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Discover our top-rated sports facilities with professional equipment and premium amenities
                </p>
              </div>

              <ScrollXCarouselWrap className="flex space-x-6 [&>*:first-child]:ml-8">
                {featuredFacilities.map((facility) => (
                  <CardHoverReveal
                    key={facility.id}
                    className="min-w-[85vw] md:min-w-[45vw] xl:min-w-[35vw] shadow-lg border rounded-xl bg-white"
                  >
                    <CardHoverRevealMain>
                      <img
                        alt={facility.title}
                        src={facility.imageUrl}
                        className="size-full aspect-[4/3] object-cover rounded-xl"
                      />
                    </CardHoverRevealMain>
                    <CardHoverRevealContent className="space-y-3 rounded-xl bg-[rgba(0,0,0,.8)] backdrop-blur-xl p-5">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className="capitalize rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                            {facility.type}
                          </Badge>
                          <span className="text-white font-bold text-lg">{facility.price}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm text-white/80">Available Services</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {facility.services.map((service) => (
                            <Badge
                              key={service}
                              className="capitalize rounded-full bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs"
                              variant={'outline'}
                            >
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-white font-semibold text-lg">
                          {facility.title}
                        </h3>
                        <p className="text-white/90 text-sm leading-relaxed">{facility.description}</p>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          size="sm" 
                          className="w-full bg-white text-black hover:bg-gray-100"
                        >
                          Book Now
                        </Button>
                      </div>
                    </CardHoverRevealContent>
                  </CardHoverReveal>
                ))}
              </ScrollXCarouselWrap>
              
              {/* Progress Bar */}
              <ScrollXCarouselProgress
                className="bg-gray-200 mx-8 h-1.5 rounded-full overflow-hidden"
                progressStyle="size-full bg-blue-600 rounded-full"
              />
            </ScrollXCarouselContainer>
          </ScrollXCarousel>
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
