
"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatInr } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Users,
  Clock,
  BarChart3,
  PieChart,
  RefreshCw
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Simple Chart Placeholder Component
function ChartPlaceholder({ title, description, type, icon: Icon }: { 
  title: string; 
  description: string; 
  type: string;
  icon?: any;
}) {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" />}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border border-gray-200">
          <div className="text-center">
            <div className="text-4xl mb-3">
              {type === 'doughnut' && '🍩'}
              {type === 'bar' && '📊'}
              {type === 'line' && '📈'}
              {type === 'area' && '📊'}
            </div>
            <p className="text-sm text-gray-600 font-medium">{description}</p>
            <p className="text-xs text-gray-400 mt-1">Chart Type: {type.toUpperCase()}</p>
            <Button variant="outline" size="sm" className="mt-3">
              <RefreshCw className="h-3 w-3 mr-1" />
              Load Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
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


// Booking and revenue chart state
function BookingRevenueCharts({ token }: { token: string }) {
  const [bookingData, setBookingData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCharts() {
      setLoading(true);
      try {
        const [bookingsRes, revenueRes] = await Promise.all([
          fetch('/api/owner/analytics?type=bookings', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/owner/analytics?type=revenue', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const bookingsJson = await bookingsRes.json();
        const revenueJson = await revenueRes.json();
        // Map backend data to chart format
        setBookingData((bookingsJson.data || []).map((item: any) => ({
          date: item.period || item.date || '',
          bookings: item.bookings || item.count || 0
        })));
        setRevenueData((revenueJson.data || []).map((item: any) => ({
          category: item.category || '',
          amount: item.amount || 0
        })));
      } catch (e) {
        setBookingData([]);
        setRevenueData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCharts();
  }, [token]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Trends</CardTitle>
          <CardDescription>Bookings over time</CardDescription>
        </CardHeader>
        <CardContent style={{ height: 320 }}>
          {loading ? (
            <div className="h-64 bg-muted animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#3B82F6" name="Bookings" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Category</CardTitle>
          <CardDescription>Earnings by sport and venue</CardDescription>
        </CardHeader>
        <CardContent style={{ height: 320 }}>
          {loading ? (
            <div className="h-64 bg-muted animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#10B981" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Stats Card Component
function StatCard({ title, value, change, icon: Icon, color = "blue" }: {
  title: string;
  value: string;
  change?: string;
  icon: any;
  color?: string;
}) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
    orange: "text-orange-600 bg-orange-100",
    red: "text-red-600 bg-red-100"
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className="text-xs text-gray-500 mt-1">{change}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function FacilityDashboard() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
        let tokenStr = localStorage.getItem("token");

        if (!userStr) {
          console.error("No user data found");
          router.push("/login");
          return;
        }

        const user = JSON.parse(userStr);
        
        // Try to get token from localStorage first, then from user object
        if (!tokenStr && user.token) {
          tokenStr = user.token;
        }
        
        if (!tokenStr) {
          console.error("No token found");
          router.push("/login");
          return;
        }
        
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

  // Check authentication and user role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem("user");
        let token = localStorage.getItem("token");

        if (!userStr) {
          router.push("/login");
          return;
        }
        
        const user = JSON.parse(userStr);
        
        // Try to get token from localStorage first, then from user object
        if (!token && user.token) {
          token = user.token;
        }
        
        if (!token) {
          console.log("No auth data found, redirecting to login");
          router.push("/login");
          return;
        }

        const parsedUser = JSON.parse(userStr) as UserData;
        
        if (parsedUser.role !== "owner") {
          console.log("User is not an owner, redirecting to login");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        // Verify token is still valid
        const response = await fetch("/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.log("Token verification failed, redirecting to login");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        setUserData(parsedUser);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

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

  if (isLoading || !userData) {
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
      {userData && userData._id && (
        <BookingRevenueCharts token={localStorage.getItem('token') || ''} />
      )}

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
