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

interface DashboardData {
  totalBookings: number
  monthlyBookings: number
  activeCourts: number
  maintenanceCourts: number
  totalEarnings: number
  monthlyEarnings: number
  recentBookings: any[]
  peakHours: any[]
  revenueData: any[]
}

export default function FacilityOwnerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/facility-owner/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data.data)
      } else {
        // Mock data for development
        setDashboardData({
          totalBookings: 247,
          monthlyBookings: 89,
          activeCourts: 8,
          maintenanceCourts: 2,
          totalEarnings: 125000,
          monthlyEarnings: 45000,
          recentBookings: [],
          peakHours: [],
          revenueData: []
        })
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError('Failed to load dashboard data')
      // Set mock data on error
      setDashboardData({
        totalBookings: 247,
        monthlyBookings: 89,
        activeCourts: 8,
        maintenanceCourts: 2,
        totalEarnings: 125000,
        monthlyEarnings: 45000,
        recentBookings: [],
        peakHours: [],
        revenueData: []
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.replace('/login')
      return
    }

    const parsedUser = JSON.parse(userStr)
    if (parsedUser.role !== 'owner') {
      router.replace('/login')
      return
    }

    setUser(parsedUser)
    fetchDashboardData()
  }, [router])

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Facility Owner Dashboard
                </h1>
                <p className="text-gray-600">
                  Welcome back, {user?.name}! Here's your facility overview.
                </p>
              </div>
              <Button onClick={fetchDashboardData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Bookings"
            value={dashboardData?.totalBookings?.toString() || "0"}
            change="+12% from last month"
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Monthly Revenue"
            value={formatInr(dashboardData?.monthlyEarnings || 0)}
            change="+8% from last month"
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Active Courts"
            value={dashboardData?.activeCourts?.toString() || "0"}
            change={`${dashboardData?.maintenanceCourts || 0} in maintenance`}
            icon={Building2}
            color="purple"
          />
          <StatCard
            title="Growth Rate"
            value="15.2%"
            change="Booking growth rate"
            icon={TrendingUp}
            color="orange"
          />
        </div>

        {/* Charts and Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="peak-hours">Peak Hours</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartPlaceholder
                title="Monthly Revenue Trends"
                description="Track your revenue performance over time with detailed monthly breakdown"
                type="line"
                icon={TrendingUp}
              />
              <ChartPlaceholder
                title="Booking Distribution"
                description="See how your bookings are distributed across different courts and time slots"
                type="doughnut"
                icon={PieChart}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartPlaceholder
                title="Court Utilization"
                description="Monitor which courts are most popular and their usage rates"
                type="bar"
                icon={BarChart3}
              />
              <ChartPlaceholder
                title="Customer Activity"
                description="Track user engagement and repeat booking patterns"
                type="area"
                icon={Activity}
              />
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <ChartPlaceholder
                title="Revenue Analytics"
                description="Comprehensive revenue breakdown with earnings by court, time, and booking type"
                type="bar"
                icon={DollarSign}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartPlaceholder
                title="Revenue by Court"
                description="Compare earnings across different courts to identify top performers"
                type="doughnut"
                icon={Building2}
              />
              <ChartPlaceholder
                title="Payment Methods"
                description="Analysis of customer payment preferences and transaction patterns"
                type="bar"
                icon={DollarSign}
              />
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <ChartPlaceholder
                title="Booking Trends"
                description="Detailed analysis of booking patterns, seasonal trends, and growth metrics"
                type="line"
                icon={Calendar}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartPlaceholder
                title="Booking Status Distribution"
                description="Track confirmed, pending, and cancelled bookings"
                type="doughnut"
                icon={Activity}
              />
              <ChartPlaceholder
                title="Booking Duration Patterns"
                description="Analyze typical booking lengths and popular session durations"
                type="bar"
                icon={Clock}
              />
            </div>
          </TabsContent>

          <TabsContent value="peak-hours" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <ChartPlaceholder
                title="Peak Hours Analysis"
                description="Identify the busiest times of day and optimize your pricing and availability"
                type="area"
                icon={Clock}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartPlaceholder
                title="Daily Usage Patterns"
                description="Compare usage patterns across different days of the week"
                type="bar"
                icon={Calendar}
              />
              <ChartPlaceholder
                title="Hourly Revenue"
                description="Revenue breakdown by hour to identify most profitable time slots"
                type="line"
                icon={DollarSign}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your facility efficiently with these quick shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Building2 className="h-6 w-6 mb-2" />
                Manage Courts
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                View Bookings
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                Customer Reports
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <DollarSign className="h-6 w-6 mb-2" />
                Revenue Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
