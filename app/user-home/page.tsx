"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Clock } from "lucide-react"

const popularVenues = [
  {
    id: 1,
    name: "Elite Sports Complex",
    location: "Downtown NYC",
    sports: ["Basketball", "Tennis"],
  price: "₹1200/hour",
    rating: 4.8,
    image: "/placeholder.svg?height=200&width=300&text=Elite+Sports+Complex",
  },
  {
    id: 2,
    name: "Community Recreation Center",
    location: "Brooklyn",
    sports: ["Volleyball", "Badminton"],
  price: "₹950/hour",
    rating: 4.6,
    image: "/placeholder.svg?height=200&width=300&text=Community+Center",
  },
  {
    id: 3,
    name: "Premier Tennis Club",
    location: "Manhattan",
    sports: ["Tennis"],
  price: "₹1100/hour",
    rating: 4.9,
    image: "/placeholder.svg?height=200&width=300&text=Tennis+Club",
  },
]

export default function UserHomePage() {
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(user)
  if (parsedUser.role !== "user") {
      router.push("/login")
      return
    }

    setUserData(parsedUser)
  }, [router])

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
            <Button size="lg" variant="secondary">
              Book Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-gray-900 bg-transparent"
            >
              Browse Venues
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

      {/* Popular Venues */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Venues</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {popularVenues.map((venue) => (
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
                  {venue.sports.map((sport) => (
                    <Badge key={sport} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                      {sport}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">{venue.price}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm ml-1 text-gray-700">{venue.rating}</span>
                  </div>
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
