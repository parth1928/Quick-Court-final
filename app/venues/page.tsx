"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { MapPin, Star, Filter, ChevronLeft, ChevronRight } from "lucide-react"

interface VenueCard {
  id: string
  name: string
  location: string
  sports: string[]
  price: number
  rating: number
  reviews: number
  image: string
  amenities: string[]
  description: string
}

export default function VenuesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSport, setSelectedSport] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedRating, setSelectedRating] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [venues, setVenues] = useState<VenueCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVenues = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        view: 'card',
        limit: '100', // fetch a large batch to paginate client-side
        ...(selectedSport !== 'all' && { sport: selectedSport })
      })
      const res = await fetch(`/api/venues?${params.toString()}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load venues')
      if (!json.venues) throw new Error('No venues data returned')
      setVenues(json.venues)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch once on mount and when sport filter changes
  useEffect(() => { fetchVenues(); setCurrentPage(1) }, [selectedSport])

  const itemsPerPage = 6

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSport =
      selectedSport === "all" || venue.sports.some((sport) => sport.toLowerCase() === selectedSport.toLowerCase())
    const matchesPrice = venue.price >= priceRange[0] && venue.price <= priceRange[1]
    const matchesRating = selectedRating === "all" || venue.rating >= Number.parseFloat(selectedRating)

    return matchesSearch && matchesSport && matchesPrice && matchesRating
  })

  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage) || 1
  const paginatedVenues = filteredVenues.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Ensure current page not beyond range after filters change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1)
    }
  }, [totalPages, currentPage])

  if (loading) return <div className="p-8">Loading venues...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Removed duplicate Header to avoid double navbars */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Sports Venues</h1>
          <p className="text-gray-600">Discover and book the perfect venue for your next game</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search venues, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 ${showFilters ? "block" : "hidden lg:grid"}`}
          >
            <div className="space-y-2">
              <Label>Sport Type</Label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="volleyball">Volleyball</SelectItem>
                  <SelectItem value="badminton">Badminton</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Price Range (₹/hour)</Label>
              <div className="px-2">
                <Slider value={priceRange} onValueChange={setPriceRange} max={1000} min={0} step={50} className="w-full" />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Venue Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="indoor">Indoor</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Minimum Rating</Label>
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Rating</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0">4.0+ Stars</SelectItem>
                  <SelectItem value="3.5">3.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {paginatedVenues.length} of {filteredVenues.length} venues
          </p>
          <Select defaultValue="relevance">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Venue Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedVenues.map((venue) => (
            <Card key={venue.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <img src={venue.image || "/placeholder.svg"} alt={venue.name} className="w-full h-48 object-cover" />
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{venue.name}</h3>
                <p className="text-gray-600 text-sm mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {venue.location}
                </p>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{venue.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {venue.sports.slice(0, 2).map((sport) => (
                    <Badge key={sport} variant="secondary" className="text-xs">
                      {sport}
                    </Badge>
                  ))}
                  {venue.sports.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{venue.sports.length - 2} more
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-blue-600 text-lg">₹{venue.price}/hour</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm ml-1">{venue.rating}</span>
                    <span className="text-xs text-gray-500 ml-1">({venue.reviews})</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {venue.amenities.slice(0, 3).map((amenity) => (
                    <span key={amenity} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {amenity}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="default" size="sm">
                    <Link href={`/venues/${venue.id}/booking`}>Book</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/venues/${venue.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
