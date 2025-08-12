"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { HeatMapChart } from "@/components/ui/heat-map-chart"
import { formatInr } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, DollarSign, TrendingUp, Activity } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
// Chart config and data for demo
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

function ChartLineMultiple({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <LineChart
          width={500}
          height={180}
          data={chartData}
          margin={{ left: 12, right: 12 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <Line
            dataKey="desktop"
            type="monotone"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="mobile"
            type="monotone"
            stroke="#22d3ee"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Showing total visitors for the last 6 months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

interface Booking {
  id: string
  facility: string
  court: string
  user: string
  date: string
  time: string
  status: string
  amount: number
}

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
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>({
    totalBookings: 0,
    monthlyBookings: 0,
    activeCourts: 0,
    maintenanceCourts: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    recentBookings: []
  })

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const userStr = localStorage.getItem("user");
        let token = localStorage.getItem("token");
        
        if (!userStr) {
          console.error("No user data found");
          return;
        }
        
        const user = JSON.parse(userStr);
        
        // Try to get token from localStorage first, then from user object
        if (!token && user.token) {
          token = user.token;
        }
        
        if (!token) {
          console.error("No token found");
          return;
        }
        
        const response = await fetch("/api/owner/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()
        if (response.ok) {
          setDashboardData(data)
        } else {
          console.error("Error fetching dashboard data:", data.error)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      }
    }

    fetchDashboardData()
  }, [])

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

  const kpiData = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings.toString(),
      icon: Calendar,
      change: `${dashboardData.monthlyBookings} this month`,
      changeType: "positive" as const,
    },
    {
      title: "Active Courts",
      value: dashboardData.activeCourts.toString(),
      icon: Building2,
      change: `${dashboardData.maintenanceCourts} courts under maintenance`,
      changeType: "neutral" as const,
    },
    {
      title: "Total Earnings",
      value: formatInr(dashboardData.totalEarnings),
      icon: DollarSign,
      change: `${formatInr(dashboardData.monthlyEarnings)} this month`,
      changeType: "positive" as const,
    },
    {
      title: "Monthly Earnings",
      value: formatInr(dashboardData.monthlyEarnings),
      icon: Activity,
      change: "Current month revenue",
      changeType: "positive" as const,
    },
  ]

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
        <ChartPlaceholder 
          title="Earnings Summary" 
          description="Bar chart displaying revenue breakdown" 
          type="bar" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Peak Booking Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <HeatMapChart
              title="Peak Booking Hours"
              description="Heatmap showing busiest times of day (demo data)"
              hoursLabels={["6am", "7am", "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm"]}
              data={[
                { day: "Mon", hours: [0, 1, 2, 3, 5, 7, 8, 6, 4, 2, 1, 0, 0, 2, 4, 6, 7] },
                { day: "Tue", hours: [0, 0, 1, 2, 4, 6, 7, 8, 7, 5, 3, 2, 1, 2, 3, 5, 6] },
                { day: "Wed", hours: [1, 2, 3, 4, 6, 8, 9, 7, 5, 3, 2, 1, 0, 1, 2, 4, 5] },
                { day: "Thu", hours: [0, 1, 2, 3, 5, 7, 8, 6, 4, 2, 1, 0, 0, 2, 4, 6, 7] },
                { day: "Fri", hours: [0, 0, 1, 2, 4, 6, 7, 8, 7, 5, 3, 2, 1, 2, 3, 5, 6] },
                { day: "Sat", hours: [2, 3, 4, 6, 8, 10, 12, 11, 9, 7, 5, 4, 3, 4, 6, 8, 10] },
                { day: "Sun", hours: [3, 4, 5, 7, 9, 12, 14, 13, 11, 9, 7, 6, 5, 6, 8, 10, 12] },
              ]}
            />
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentBookings?.slice(0, 4).map((booking: Booking) => (
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
                      variant={booking.status === "confirmed" ? "default" : "secondary"}
                      className={
                        booking.status === "confirmed"
                          ? "bg-gray-900 text-white text-xs"
                          : "bg-gray-100 text-gray-700 text-xs"
                      }
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                    <span className="font-semibold text-gray-900 text-sm">{formatInr(booking.amount)}</span>
                  </div>
                </div>
              ))}
              {!dashboardData.recentBookings?.length && (
                <div className="text-center py-4 text-gray-500">No recent bookings found</div>
              )}
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
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              Add New Facility
            </Button>
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
