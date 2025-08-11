"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatInr } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User } from "lucide-react"

const bookings = [
  {
    id: 1,
    facility: "Elite Sports Complex",
    court: "Basketball Court A",
  user: "Rahul Sharma",
    date: "2024-01-25",
    time: "4:00 PM - 5:00 PM",
    status: "Confirmed",
    amount: 25,
  },
  {
    id: 2,
    facility: "Elite Sports Complex",
    court: "Tennis Court 1",
  user: "Ananya Singh",
    date: "2024-01-24",
    time: "2:00 PM - 3:00 PM",
    status: "Completed",
    amount: 30,
  },
  {
    id: 3,
    facility: "Community Recreation Center",
    court: "Volleyball Court",
  user: "Vikram Patel",
    date: "2024-01-23",
    time: "6:00 PM - 7:00 PM",
    status: "Completed",
    amount: 20,
  },
]

export default function FacilityBookingsPage() {
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Facility Bookings</h1>
        <p className="text-gray-600 mt-2">Manage bookings for your facilities</p>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{booking.facility}</h4>
                  <p className="text-sm text-gray-600">{booking.court}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {booking.user}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {booking.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {booking.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge
                    variant={booking.status === "Confirmed" ? "default" : "secondary"}
                    className={booking.status === "Confirmed" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}
                  >
                    {booking.status}
                  </Badge>
                  <span className="font-semibold text-gray-900">{formatInr(booking.amount)}</span>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 bg-transparent">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
