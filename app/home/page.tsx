"use client"

import type React from "react"
import { useMemo, useRef, useState } from "react"

import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, MapPin, Star, Clock, Search } from "lucide-react"

const popularVenues = [
  { id: 1, name: "Elite Sports Complex", location: "Andheri, Mumbai", sports: ["Basketball", "Tennis"], price: "₹500/hour", rating: 4.8, image: "/placeholder.svg?height=200&width=300&text=Elite+Sports+Complex" },
  { id: 2, name: "Community Recreation Center", location: "Koramangala, Bengaluru", sports: ["Volleyball", "Badminton"], price: "₹300/hour", rating: 4.6, image: "/placeholder.svg?height=200&width=300&text=Community+Center" },
  { id: 3, name: "Premier Tennis Club", location: "CP, Delhi", sports: ["Tennis"], price: "₹800/hour", rating: 4.9, image: "/placeholder.svg?height=200&width=300&text=Tennis+Club" },
  { id: 4, name: "Urban Basketball Arena", location: "Bandra, Mumbai", sports: ["Basketball"], price: "₹400/hour", rating: 4.7, image: "/placeholder.svg?height=200&width=300&text=Basketball+Arena" },
]

const popularSports = [
  { id: 1, name: "Basketball", venues: 45, image: "/placeholder.svg?height=150&width=200&text=Basketball" },
  { id: 2, name: "Tennis", venues: 32, image: "/placeholder.svg?height=150&width=200&text=Tennis" },
  { id: 3, name: "Volleyball", venues: 28, image: "/placeholder.svg?height=150&width=200&text=Volleyball" },
  { id: 4, name: "Badminton", venues: 22, image: "/placeholder.svg?height=150&width=200&text=Badminton" },
  { id: 5, name: "Football", venues: 18, image: "/placeholder.svg?height=150&width=200&text=Football" },
]

function CarouselSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    const el = containerRef.current
    if (!el) return
    const amount = Math.min(360, el.clientWidth * 0.9)
    el.scrollTo({ left: dir === "left" ? el.scrollLeft - amount : el.scrollLeft + amount, behavior: "smooth" })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => scroll("left")} aria-label={`${title} previous`}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scroll("right")} aria-label={`${title} next`}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none]"
        style={{ scrollbarWidth: "none" } as React.CSSProperties}
      >
        {/* hide scrollbar (webkit) */}
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {children}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [query, setQuery] = useState("")

  const filteredVenues = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return popularVenues
    return popularVenues.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.sports.some((s) => s.toLowerCase().includes(q))
    )
  }, [query])

  const filteredSports = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return popularSports
    return popularSports.filter((s) => s.name.toLowerCase().includes(q))
  }, [query])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome / Hero */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-sm">
          <div className="max-w-2xl">
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">Welcome back! Ready to play?</h1>
            <p className="mb-6 text-lg text-blue-100">
              Discover amazing sports venues near you and book your next game instantly.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="secondary">
                Book Now
              </Button>
              {/* <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white hover:bg-white hover:text-blue-600"
              >
                Browse Venues
              </Button> */}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">150+</div>
              <div className="text-sm text-gray-600">Venues</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">25+</div>
              <div className="text-sm text-gray-600">Sports</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">5K+</div>
              <div className="text-sm text-gray-600">Bookings</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">4.8</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar with icon */}
        <div className="mb-8">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search venues or sports…"
              className="h-12 rounded-xl border-gray-300 pl-12 shadow-sm focus-visible:ring-blue-500"
              aria-label="Search venues or sports"
            />
          </div>
          {query && (
            <p className="mt-2 text-sm text-gray-500">
              Showing results for <span className="font-medium text-gray-700">“{query}”</span>
            </p>
          )}
        </div>

        {/* Popular Venues Carousel */}
        <CarouselSection title="Popular Venues">
          {filteredVenues.map((venue) => (
            <Card
              key={venue.id}
              className="w-80 shrink-0 overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <img
                src={venue.image || "/placeholder.svg"}
                alt={venue.name}
                className="h-48 w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
              />
              <CardContent className="p-4">
                <h3 className="mb-2 line-clamp-1 text-lg font-semibold">{venue.name}</h3>
                <p className="mb-2 flex items-center text-sm text-gray-600">
                  <MapPin className="mr-1.5 h-4 w-4" />
                  <span className="line-clamp-1">{venue.location}</span>
                </p>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {venue.sports.map((sport) => (
                    <Badge key={sport} variant="secondary" className="rounded-full text-xs">
                      {sport}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-600">{venue.price}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm">{venue.rating}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <Button className="w-full rounded-xl">Book</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CarouselSection>

        {/* Popular Sports Carousel */}
        <CarouselSection title="Popular Sports">
          {filteredSports.map((sport) => (
            <Card
              key={sport.id}
              className="w-64 shrink-0 overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <img
                src={sport.image || "/placeholder.svg"}
                alt={sport.name}
                className="h-32 w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
              />
              <CardContent className="p-4 text-center">
                <h3 className="mb-1 text-lg font-semibold">{sport.name}</h3>
                <p className="text-sm text-gray-600">{sport.venues} venues available</p>
              </CardContent>
            </Card>
          ))}
        </CarouselSection>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Your Recent Activity</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">Elite Sports Complex</h3>
                  <Badge variant="outline">Completed</Badge>
                </div>
                <p className="mb-2 text-sm text-gray-600">Basketball Court A</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="mr-1 h-4 w-4" />
                  Jan 20, 2024 • 2:00 PM - 3:00 PM
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">Community Recreation Center</h3>
                  <Badge>Upcoming</Badge>
                </div>
                <p className="mb-2 text-sm text-gray-600">Tennis Court 2</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="mr-1 h-4 w-4" />
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
