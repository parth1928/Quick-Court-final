"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatInr } from "@/lib/format"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"

const bookings = [
  {
    id: 1,
    venueName: "Elite Sports Complex",
    courtName: "Basketball Court A",
    sport: "Basketball",
    date: "2024-01-25",
    time: "4:00 PM - 5:00 PM",
    status: "Upcoming",
    price: 25,
  },
  {
    id: 2,
    venueName: "Premier Tennis Club",
    courtName: "Tennis Court 2",
    sport: "Tennis",
    date: "2024-01-20",
    time: "2:00 PM - 3:00 PM",
    status: "Completed",
    price: 40,
  },
]

export default function MyBookingsPage() {
  const [userData, setUserData] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState("All")
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

  const filteredBookings = bookings.filter((booking) => filterStatus === "All" || booking.status === filterStatus)

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-2">View and manage your venue bookings</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["All", "Upcoming", "Completed", "Cancelled"].map((status) => (
          <Button
            key={status}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className={
              filterStatus === status
                ? "bg-black text-white border-black"
                : "bg-white text-black border-black hover:bg-gray-100"
            }
            variant="outline"
          >
            {status}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{booking.venueName}</h3>
                  <p className="text-gray-600">
                    {booking.courtName} • {booking.sport}
                  </p>
                </div>
                <Badge
                  variant={booking.status === "Upcoming" ? "default" : "secondary"}
                  className={booking.status === "Upcoming" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}
                >
                  {booking.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {booking.date}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {booking.time}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-semibold">{formatInr(booking.price)}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 bg-transparent">
                  View Details
                </Button>
                {booking.status === "Upcoming" && (
                  <Button variant="outline" size="sm" className="border-red-300 text-red-700 bg-transparent">
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredBookings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No bookings found for the selected filter.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
