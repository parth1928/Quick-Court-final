"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus } from "lucide-react"

const facilities = [
  {
    id: 1,
    name: "Elite Sports Complex",
    location: "Downtown NYC",
    sports: ["Basketball", "Tennis", "Volleyball"],
    status: "Active",
    rating: 4.8,
    totalBookings: 156,
    monthlyRevenue: 4250,
    image: "/placeholder.svg?height=200&width=300&text=Elite+Sports+Complex",
  },
  {
    id: 2,
    name: "Community Recreation Center",
    location: "Brooklyn",
    sports: ["Volleyball", "Badminton"],
    status: "Active",
    rating: 4.6,
    totalBookings: 89,
    monthlyRevenue: 2100,
    image: "/placeholder.svg?height=200&width=300&text=Community+Center",
  },
]

export default function MyFacilitiesPage() {
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(user)
  if (parsedUser.role !== "owner") {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Facilities</h1>
          <p className="text-gray-600 mt-2">Manage your sports facilities</p>
        </div>
        <Button className="bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add New Facility
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {facilities.map((facility) => (
          <Card key={facility.id} className="border-gray-200 overflow-hidden">
            <img src={facility.image || "/placeholder.svg"} alt={facility.name} className="w-full h-48 object-cover" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">{facility.name}</CardTitle>
                <Badge
                  variant="secondary"
                  className={facility.status === "Active" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}
                >
                  {facility.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{facility.location}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {facility.sports.map((sport) => (
                    <Badge key={sport} variant="outline" className="text-xs border-gray-300 text-gray-700">
                      {sport}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{facility.rating}</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{facility.totalBookings}</div>
                    <div className="text-xs text-gray-600">Bookings</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">${facility.monthlyRevenue}</div>
                    <div className="text-xs text-gray-600">Revenue</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1 border-gray-300 text-gray-700 bg-transparent">
                    Manage
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-gray-300 text-gray-700 bg-transparent">
                    View Stats
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
