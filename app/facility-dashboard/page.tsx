"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, DollarSign, TrendingUp, Activity } from "lucide-react"

const kpiData = [
  {
    title: "Total Bookings",
    value: "156",
    icon: Calendar,
    change: "+23% from last month",
    changeType: "positive" as const,
  },
  {
    title: "Active Courts",
    value: "8",
    icon: Building2,
    change: "2 courts under maintenance",
    changeType: "neutral" as const,
  },
  {
    title: "Earnings (simulated)",
    value: "$4,250",
    icon: DollarSign,
    change: "+18% from last month",
    changeType: "positive" as const,
  },
  {
    title: "Booking Calendar",
    value: "85%",
    icon: Activity,
    change: "Occupancy rate this week",
    changeType: "positive" as const,
  },
]

const recentBookings = [
  {
    id: 1,
    facility: "Elite Sports Complex",
    court: "Basketball Court A",
    user: "John Smith",
    date: "2024-01-25",
    time: "4:00 PM - 5:00 PM",
    status: "Confirmed",
    amount: "$25",
  },
  {
    id: 2,
    facility: "Elite Sports Complex",
    court: "Tennis Court 1",
    user: "Sarah Johnson",
    date: "2024-01-24",
    time: "2:00 PM - 3:00 PM",
    status: "Completed",
    amount: "$30",
  },
  {
    id: 3,
    facility: "Community Center",
    court: "Volleyball Court",
    user: "Mike Wilson",
    date: "2024-01-23",
    time: "6:00 PM - 7:00 PM",
    status: "Completed",
    amount: "$20",
  },
]

function ChartPlaceholder({ title, description, type }: { title: string; description: string; type: string }) {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
          <div className="text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{description}</p>
            <p className="text-xs text-gray-400 mt-1">Chart Type: {type.toUpperCase()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FacilityDashboard() {
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(user)
    if (parsedUser.userType !== "facility-owner") {
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
        <h1 className="text-3xl font-bold text-gray-900">Facility Owner Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {userData.name}! Here's your facility overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-gray-600 mr-1" />
                <span className="text-xs text-gray-600">{kpi.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder
          title="Daily/Weekly/Monthly Booking Trends"
          description="Line chart showing booking patterns over time"
          type="line"
        />
        <ChartPlaceholder title="Earnings Summary" description="Bar chart displaying revenue breakdown" type="bar" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder
          title="Peak Booking Hours"
          description="Heatmap showing busiest times of day"
          type="heatmap"
        />

        {/* Recent Bookings */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBookings.slice(0, 4).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{booking.court}</h4>
                    <p className="text-xs text-gray-600">{booking.user}</p>
                    <p className="text-xs text-gray-500">
                      {booking.date} • {booking.time}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={booking.status === "Confirmed" ? "default" : "secondary"}
                      className={
                        booking.status === "Confirmed"
                          ? "bg-gray-900 text-white text-xs"
                          : "bg-gray-100 text-gray-700 text-xs"
                      }
                    >
                      {booking.status}
                    </Badge>
                    <span className="font-semibold text-gray-900 text-sm">{booking.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">Add New Facility</Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 bg-transparent">
              Manage Courts
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 bg-transparent">
              View All Bookings
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 bg-transparent">
              Set Availability
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
