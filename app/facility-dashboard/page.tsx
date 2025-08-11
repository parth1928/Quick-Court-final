"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatInr } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, DollarSign, TrendingUp, Activity } from "lucide-react"

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

interface DashboardData {
  totalBookings: number
  monthlyBookings: number
  activeCourts: number
  maintenanceCourts: number
  totalEarnings: number
  monthlyEarnings: number
  recentBookings: Booking[]
  error?: string
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
  const [dashboardData, setDashboardData] = useState<DashboardData>({
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
        // Get user data first
        const userStr = localStorage.getItem("user");
        const tokenStr = localStorage.getItem("token");

        if (!userStr || !tokenStr) {
          console.error("No user data or token found");
          router.push("/login");
          return;
        }

        const user = JSON.parse(userStr);
        
        if (user.role !== "owner") {
          console.error("Unauthorized - User is not an owner");
          router.push("/login");
          return;
        }

        const response = await fetch("/api/owner/dashboard", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenStr}`,
            "Content-Type": "application/json",
          }
        });

        if (!response.ok) {
          const data = await response.json();
          if (response.status === 401) {
            console.error("Session expired or invalid");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
            return;
          }
          throw new Error(data.error || "Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error.message);
        // Show error in UI instead of just console
        setDashboardData(prev => ({
          ...prev,
          error: error.message || "Failed to load dashboard data"
        }));
      }
    }

    if (userData?.role === "owner") {
      fetchDashboardData();
    }
  }, [userData, router])

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

  if (dashboardData.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{dashboardData.error}</span>
          </div>
          <Button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/login');
            }}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

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
            <Button
              onClick={() => router.push("/my-facilities")}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              My Facilities
            </Button>
            <Button
              onClick={() => router.push("/court-management")}
              variant="outline"
              className="border-gray-300 text-gray-700 bg-transparent"
            >
              Manage Courts
            </Button>
            <Button
              onClick={() => router.push("/facility-bookings")}
              variant="outline"
              className="border-gray-300 text-gray-700 bg-transparent"
            >
              View Bookings
            </Button>
            <Button
              onClick={() => router.push("/time-slot-management")}
              variant="outline"
              className="border-gray-300 text-gray-700 bg-transparent"
            >
              Set Availability
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
