"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatInr } from '@/lib/format'
import { 
  DollarSign, 
  Users, 
  Building2, 
  Calendar,
  TrendingUp, 
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  MapPin,
  Star
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart
} from 'recharts'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, ChartLegend)

interface SystemOverview {
  totalUsers: number
  totalVenues: number
  totalCourts: number
  totalBookings: number
  totalRevenue: number
  growth: {
    users: number
    venues: number
    bookings: number
  }
}

interface AnalyticsData {
  systemOverview: SystemOverview
  bookings: any[]
  revenue: any[]
  users: any[]
  venues: any[]
}

const CHART_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
  '#EC4899', '#14B8A6'
]

export default function AdminDashboard() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    systemOverview: {
      totalUsers: 0,
      totalVenues: 0,
      totalCourts: 0,
      totalBookings: 0,
      totalRevenue: 0,
      growth: { users: 0, venues: 0, bookings: 0 }
    },
    bookings: [],
    revenue: [],
    users: [],
    venues: []
  })
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(user)
    if (parsedUser.role !== 'admin') {
      router.push('/login')
      return
    }

    setUserData(parsedUser)
    loadAnalyticsData()
  }, [router])

  useEffect(() => {
    if (userData) {
      loadAnalyticsData()
    }
  }, [userData, selectedPeriod])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return

      console.log('🔍 Loading admin analytics data...')

      // Load different types of analytics data
      const [systemRes, bookingsRes, revenueRes, usersRes, venuesRes] = await Promise.all([
        fetch(`/api/admin/analytics-data?type=system-overview&period=${selectedPeriod}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/admin/analytics-data?type=bookings&period=${selectedPeriod}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/admin/analytics-data?type=revenue&period=${selectedPeriod}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/admin/analytics-data?type=users&period=${selectedPeriod}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/admin/analytics-data?type=venues&period=${selectedPeriod}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const [systemData, bookingsData, revenueData, usersData, venuesData] = await Promise.all([
        systemRes.json(),
        bookingsRes.json(),
        revenueRes.json(),
        usersRes.json(),
        venuesRes.json()
      ])

      console.log('📊 Analytics responses:', {
        system: systemData.success,
        bookings: bookingsData.success,
        revenue: revenueData.success,
        users: usersData.success,
        venues: venuesData.success
      })

      if (systemData.success) {
        setAnalyticsData({
          systemOverview: systemData.data,
          bookings: bookingsData.success ? bookingsData.data : [],
          revenue: revenueData.success ? revenueData.data : [],
          users: usersData.success ? usersData.data : [],
          venues: venuesData.success ? venuesData.data : []
        })
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Prepare doughnut chart data for revenue
  const doughnutData = {
    labels: analyticsData.revenue.map(item => item.category),
    datasets: [{
      data: analyticsData.revenue.map(item => item.amount),
      backgroundColor: CHART_COLORS,
      borderColor: CHART_COLORS,
      borderWidth: 2,
      hoverBackgroundColor: CHART_COLORS.map(color => color + '80'),
    }]
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed
            const total = analyticsData.revenue.reduce((sum, item) => sum + item.amount, 0)
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
            return `${context.label}: ${formatInr(value)} (${percentage}%)`
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading admin analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          System-wide analytics and platform insights
        </p>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatInr(analyticsData.systemOverview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Platform total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            {React.createElement(Users, { className: "h-4 w-4 text-muted-foreground" })}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.systemOverview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData.systemOverview.growth.users} this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
            {React.createElement(Building2, { className: "h-4 w-4 text-muted-foreground" })}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.systemOverview.totalVenues}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData.systemOverview.growth.venues} this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            {React.createElement(Calendar, { className: "h-4 w-4 text-muted-foreground" })}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.systemOverview.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData.systemOverview.growth.bookings} this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courts</CardTitle>
            {React.createElement(Activity, { className: "h-4 w-4 text-muted-foreground" })}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.systemOverview.totalCourts}</div>
            <p className="text-xs text-muted-foreground">
              Across all venues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Revenue Doughnut Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Revenue by Venue
                </CardTitle>
                <CardDescription>
                  Top revenue-generating venues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ height: '300px' }}>
                  {analyticsData.revenue.length > 0 ? (
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No revenue data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Booking Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Platform Growth
                </CardTitle>
                <CardDescription>
                  User registration and venue addition trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={analyticsData.users}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="users"
                        stackId="1"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.6}
                        name="Users"
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="owners"
                        stackId="1"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.6}
                        name="Owners"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="total"
                        stroke="#EF4444"
                        strokeWidth={2}
                        name="Total New Users"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Analytics</CardTitle>
              <CardDescription>
                System-wide booking trends and status breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analyticsData.bookings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatInr(Number(value)) : value,
                        name === 'revenue' ? 'Revenue' : name
                      ]}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="confirmedBookings" fill="#10B981" name="Confirmed" />
                    <Bar yAxisId="left" dataKey="completedBookings" fill="#3B82F6" name="Completed" />
                    <Bar yAxisId="left" dataKey="cancelledBookings" fill="#EF4444" name="Cancelled" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      name="Revenue"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top Revenue Venues</CardTitle>
                <CardDescription>
                  Highest earning venues on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.revenue} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={120} />
                      <Tooltip formatter={(value) => formatInr(Number(value))} />
                      <Bar dataKey="amount" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Details */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>
                  Detailed venue performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.revenue.slice(0, 8).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium text-sm">{item.category}</p>
                          <p className="text-xs text-gray-500">{item.bookings} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatInr(item.amount)}</p>
                        <Badge variant="secondary" className="text-xs">
                          Rank #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trends</CardTitle>
              <CardDescription>
                Platform user acquisition and growth patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.users}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorOwners" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stackId="1"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                      name="Regular Users"
                    />
                    <Area
                      type="monotone"
                      dataKey="owners"
                      stackId="1"
                      stroke="#10B981"
                      fillOpacity={1}
                      fill="url(#colorOwners)"
                      name="Venue Owners"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="venues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Venue Performance</CardTitle>
              <CardDescription>
                Top performing venues by revenue and utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.venues.map((venue, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {React.createElement(Building2, { className: "h-5 w-5 text-blue-600" })}
                        </div>
                        <div>
                          <h3 className="font-semibold">{venue.venueName}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {venue.city}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        venue.utilization > 70 ? 'default' :
                        venue.utilization > 40 ? 'secondary' : 'outline'
                      }>
                        {venue.utilization.toFixed(1)}% utilized
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="font-semibold">{formatInr(venue.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bookings</p>
                        <p className="font-semibold">{venue.totalBookings}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Avg Value</p>
                        <p className="font-semibold">{formatInr(venue.avgBookingValue)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
