"use client"

import { useState } from "react"
import { formatInr } from "@/lib/format"
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
import { CardCarousel } from "@/components/ui/card-carousel"


const venues = [
  {
    id: 1,
    name: "Elite Sports Complex",
  location: "Koramangala, Bengaluru",
    sports: ["Basketball", "Tennis", "Volleyball"],
    price: 25,
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.svg?height=200&width=300&text=Elite+Sports+Complex",
    amenities: ["Parking", "Locker Rooms", "Cafeteria"],
  },
  {
    id: 2,
    name: "Community Recreation Center",
  location: "Andheri West, Mumbai",
    sports: ["Volleyball", "Badminton", "Table Tennis"],
    price: 15,
    rating: 4.6,
    reviews: 89,
    image: "/placeholder.svg?height=200&width=300&text=Community+Center",
    amenities: ["Parking", "Locker Rooms"],
  },
  {
    id: 3,
    name: "Premier Tennis Club",
  location: "Banjara Hills, Hyderabad",
    sports: ["Tennis"],
    price: 40,
    rating: 4.9,
    reviews: 156,
    image: "/placeholder.svg?height=200&width=300&text=Tennis+Club",
    amenities: ["Parking", "Pro Shop", "Restaurant"],
  },
  {
    id: 4,
    name: "Urban Basketball Arena",
  location: "Salt Lake, Kolkata",
    sports: ["Basketball"],
    price: 20,
    rating: 4.7,
    reviews: 78,
    image: "/placeholder.svg?height=200&width=300&text=Basketball+Arena",
    amenities: ["Parking", "Locker Rooms", "Snack Bar"],
  },
  {
    id: 5,
    name: "Fitness & Sports Hub",
  location: "Thane, Mumbai",
    sports: ["Basketball", "Volleyball", "Badminton"],
    price: 18,
    rating: 4.5,
    reviews: 92,
    image: "/placeholder.svg?height=200&width=300&text=Sports+Hub",
    amenities: ["Parking", "Gym", "Locker Rooms"],
  },
  {
    id: 6,
    name: "Riverside Tennis Courts",
  location: "Anna Nagar, Chennai",
    sports: ["Tennis"],
    price: 30,
    rating: 4.8,
    reviews: 67,
    image: "/placeholder.svg?height=200&width=300&text=Riverside+Tennis",
    amenities: ["Parking", "Pro Shop"],
  },
]

export default function VenuesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSport, setSelectedSport] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 50])
  const [selectedRating, setSelectedRating] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const itemsPerPage = 6
  const totalPages = Math.ceil(venues.length / itemsPerPage)

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

  const paginatedVenues = filteredVenues.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Removed duplicate Header to avoid double navbars */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Sports Venues</h1>
          <p className="text-gray-600">Discover and book the perfect venue for your next game</p>
        </div>


        {/* Card Carousel Section with Indian venues and INR prices */}
        <div className="mb-8">
          <CardCarousel
            images={[
              {
                src: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80",
                alt: "Sardar Patel Stadium",
                name: "Sardar Patel Stadium",
                location: "Ahmedabad, Gujarat",
                price: 1200,
                rating: 4.9,
                reviews: 320,
              },
              {
                src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
                alt: "Jawaharlal Nehru Stadium",
                name: "Jawaharlal Nehru Stadium",
                location: "Delhi",
                price: 950,
                rating: 4.7,
                reviews: 210,
              },
              {
                src: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
                alt: "Eden Gardens",
                name: "Eden Gardens",
                location: "Kolkata, West Bengal",
                price: 1100,
                rating: 4.8,
                reviews: 275,
              },
              {
                src: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=600&q=80",
                alt: "M. A. Chidambaram Stadium",
                name: "M. A. Chidambaram Stadium",
                location: "Chennai, Tamil Nadu",
                price: 1050,
                rating: 4.6,
                reviews: 180,
              },
              {
                src: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80",
                alt: "Wankhede Stadium",
                name: "Wankhede Stadium",
                location: "Mumbai, Maharashtra",
                price: 1300,
                rating: 4.9,
                reviews: 340,
              },
              {
                src: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
                alt: "Kalinga Stadium",
                name: "Kalinga Stadium",
                location: "Bhubaneswar, Odisha",
                price: 900,
                rating: 4.5,
                reviews: 150,
              },
            ]}
            autoplayDelay={2000}
            showPagination={true}
            showNavigation={true}
          />
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
                <Slider value={priceRange} onValueChange={setPriceRange} max={50} min={0} step={5} className="w-full" />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{formatInr(priceRange[0])}</span>
                  <span>{formatInr(priceRange[1])}</span>
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
              <Link href={`/venues/${venue.id}`}>
                <img src={venue.image || "/placeholder.svg"} alt={venue.name} className="w-full h-48 object-cover" />
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{venue.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {venue.location}
                  </p>
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
                    <span className="font-semibold text-blue-600 text-lg">{formatInr(venue.price)}/hour</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm ml-1">{venue.rating}</span>
                      <span className="text-xs text-gray-500 ml-1">({venue.reviews})</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {venue.amenities.slice(0, 3).map((amenity) => (
                      <span key={amenity} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Link>
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
