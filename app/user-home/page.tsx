"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, Clock, Gamepad2, Users, Trophy, Plus, Filter } from "lucide-react"

interface PopularVenue {
  id: string
  name: string
  location: string
  sports: string[]
  price: string
  rating: number
  image: string
}

function UserHomePage() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [popularVenues, setPopularVenues] = useState<PopularVenue[]>([])
  const [filteredVenues, setFilteredVenues] = useState<PopularVenue[]>([])
  const [selectedSport, setSelectedSport] = useState<string>("all")
  const [loadingVenues, setLoadingVenues] = useState<boolean>(true)
  const [venueError, setVenueError] = useState<string | null>(null)

  // Auth / role gate
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      if (!raw) {
        router.replace('/login')
        return
      }
      const parsed = JSON.parse(raw)
      if (parsed.role !== 'user') {
        router.replace('/login')
        return
      }
      setUserData(parsed)
    } catch (e) {
      console.error('Auth parse error', e)
      router.replace('/login')
    }
  }, [router])

  // Fetch top venues (public)
  useEffect(() => {
    const fetchPopularVenues = async () => {
      setLoadingVenues(true)
      setVenueError(null)
      try {
        const params = new URLSearchParams({ view: 'card', limit: '6' })
        const res = await fetch(`/api/venues?${params.toString()}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load venues')
        if (Array.isArray(data.venues)) {
          const mapped: PopularVenue[] = data.venues.map((v: any, i: number) => ({
            // Some APIs may return _id instead of id; ensure a stable unique id
            id: (v.id || v._id || `venue-${i}`).toString(),
            name: v.name,
            location: v.location,
            sports: Array.isArray(v.sports) ? v.sports : (v.sport ? [v.sport] : []),
            price: `₹${v.price || v.startingPrice || 0}/hour`,
            rating: v.rating || v.reviewRating || 0,
            image: v.image || (Array.isArray(v.images) ? v.images[0] : undefined) || '/placeholder.jpg'
          }))
          setPopularVenues(mapped)
          setFilteredVenues(mapped)
        } else {
          setVenueError('No venues found')
        }
      } catch (e: any) {
        console.error('Error fetching popular venues:', e)
        setVenueError(e.message || 'Error loading venues')
      } finally {
        setLoadingVenues(false)
      }
    }
    fetchPopularVenues()
  }, [])

  // Filter venues when sport selection changes
  useEffect(() => {
    if (selectedSport === "all") {
      setFilteredVenues(popularVenues)
    } else {
      const filtered = popularVenues.filter(venue => 
        venue.sports.some(sport => 
          sport.toLowerCase() === selectedSport.toLowerCase()
        )
      )
      setFilteredVenues(filtered)
    }
  }, [selectedSport, popularVenues])

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gray-900 text-white rounded-2xl p-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome back, {userData.name}!</h1>
          <p className="text-lg mb-6 text-gray-300">
            Discover amazing sports venues near you and book your next game instantly.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/games">Games</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-gray-900 bg-transparent"
            >
              <Link href="/venues">Browse Venues</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">150+</div>
            <div className="text-sm text-gray-600">Venues</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">25+</div>
            <div className="text-sm text-gray-600">Sports</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">5K+</div>
            <div className="text-sm text-gray-600">Bookings</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">4.8</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/matches">
            <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                    <Gamepad2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Join Matches</h3>
                <p className="text-gray-600 text-sm mb-4">Find and join matches with other players in your area</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Users className="h-4 w-4 mr-2" />
                  Browse Matches
                </Button>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/tournaments">
            <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-yellow-100 p-3 rounded-full group-hover:bg-yellow-200 transition-colors">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Tournaments</h3>
                <p className="text-gray-600 text-sm mb-4">Participate in competitive tournaments and win prizes</p>
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                  <Trophy className="h-4 w-4 mr-2" />
                  View Tournaments
                </Button>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/venues">
            <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Book Venues</h3>
                <p className="text-gray-600 text-sm mb-4">Find and book sports venues for your games</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Games
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Popular Venues */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Popular Venues</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Games" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                <SelectItem value="basketball">Basketball</SelectItem>
                <SelectItem value="tennis">Tennis</SelectItem>
                <SelectItem value="volleyball">Volleyball</SelectItem>
                <SelectItem value="badminton">Badminton</SelectItem>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="cricket">Cricket</SelectItem>
                <SelectItem value="swimming">Swimming</SelectItem>
                <SelectItem value="table tennis">Table Tennis</SelectItem>
                <SelectItem value="squash">Squash</SelectItem>
                <SelectItem value="hockey">Hockey</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {venueError && <p className="text-sm text-red-600 mb-4">{venueError}</p>}
        
        {/* Results count */}
        {!loadingVenues && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {selectedSport === "all" 
                ? `Showing ${filteredVenues.length} venues` 
                : `Showing ${filteredVenues.length} venues for ${selectedSport}`
              }
            </p>
          </div>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingVenues && popularVenues.length === 0 && (
            <div className="col-span-full text-gray-500 text-sm">Loading venues...</div>
          )}
          {!loadingVenues && filteredVenues.length === 0 && !venueError && (
            <div className="col-span-full text-gray-500 text-sm">
              {selectedSport === "all" 
                ? "No venues available." 
                : `No venues found for ${selectedSport}.`
              }
            </div>
          )}
          {filteredVenues.map((venue) => (
            <Card
              key={venue.id}
              className="overflow-hidden border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <img src={venue.image || "/placeholder.svg"} alt={venue.name} className="w-full h-48 object-cover" />
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{venue.name}</h3>
                <p className="text-gray-600 text-sm mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {venue.location}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {venue.sports.map((sport) => {
                    const sportKey = `${venue.id}-${sport}`
                    return (
                      <Badge key={sportKey} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {sport}
                      </Badge>
                    )
                  })}
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-gray-900">{venue.price}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm ml-1 text-gray-700">{venue.rating}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="default" size="sm">
                    <a href={`/venues/${venue.id}/booking`}>Book</a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a href={`/venues/${venue.id}`}>View Details</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Recent Activity</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Elite Sports Complex</h3>
                <Badge variant="outline" className="border-gray-300 text-gray-700">
                  Completed
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">Basketball Court A</p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                Jan 20, 2024 • 2:00 PM - 3:00 PM
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Community Recreation Center</h3>
                <Badge className="bg-gray-900 text-white">Upcoming</Badge>
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
    </div>
  )
}

export default UserHomePage
