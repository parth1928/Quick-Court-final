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
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  Clock,
  BarChart3,
  PieChart,
  Activity
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
  Legend
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

interface AnalyticsData {
  bookings: any[]
  revenue: any[]
  peakHours: any[]
  summary: {
    totalBookings: number
    totalRevenue: number
    avgBookingValue: number
    growthRate: number
  }
}

interface DashboardStats {
  totalBookings: number
  monthlyBookings: number
  totalEarnings: number
  monthlyEarnings: number
  activeCourts: number
  maintenanceCourts: number
  recentBookings: any[]
}

const CHART_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
]

export default function FacilityOwnerDashboard() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    bookings: [],
    revenue: [],
    peakHours: [],
    summary: {
      totalBookings: 0,
      totalRevenue: 0,
      avgBookingValue: 0,
      growthRate: 0
    }
  })
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalBookings: 0,
    monthlyBookings: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    activeCourts: 0,
    maintenanceCourts: 0,
    recentBookings: []
  })
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [selectedChart, setSelectedChart] = useState('revenue')

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(user)
    if (parsedUser.role !== 'owner') {
      router.push('/login')
      return
    }

    setUserData(parsedUser)
    loadDashboardData()
  }, [router])

  useEffect(() => {
    if (userData) {
      loadAnalyticsData()
    }
  }, [userData, selectedPeriod])

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/owner/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardStats(data)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return

      // Load different types of analytics data
      const [bookingsRes, revenueRes, peakHoursRes] = await Promise.all([
        fetch(`/api/owner/analytics?type=bookings&period=${selectedPeriod}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/owner/analytics?type=revenue&period=${selectedPeriod}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/owner/analytics?type=peak-hours&period=${selectedPeriod}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const [bookingsData, revenueData, peakHoursData] = await Promise.all([
        bookingsRes.json(),
        revenueRes.json(),
        peakHoursRes.json()
      ])

      if (bookingsData.success && revenueData.success && peakHoursData.success) {
        setAnalyticsData({
          bookings: bookingsData.data,
          revenue: revenueData.data,
          peakHours: peakHoursData.data,
          summary: {
            totalBookings: bookingsData.total,
            totalRevenue: revenueData.total,
            avgBookingValue: revenueData.total / (bookingsData.total || 1),
            growthRate: calculateGrowthRate(bookingsData.data)
          }
        })
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateGrowthRate = (data: any[]) => {
    if (data.length < 2) return 0
    const latest = data[data.length - 1]?.bookings || 0
    const previous = data[data.length - 2]?.bookings || 0
    return previous === 0 ? 0 : ((latest - previous) / previous) * 100
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
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed
            const total = analyticsData.summary.totalRevenue
            const percentage = ((value / total) * 100).toFixed(1)
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
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Facility Owner Dashboard
        </h1>
        <p className="text-gray-600">
          Analytics and insights for your venues and bookings
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatInr(dashboardStats.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatInr(dashboardStats.monthlyEarnings)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardStats.monthlyBookings} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatInr(analyticsData.summary.avgBookingValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.summary.growthRate >= 0 ? '+' : ''}{analyticsData.summary.growthRate.toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courts</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeCourts}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.maintenanceCourts} in maintenance
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

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="bookings">Booking Trends</TabsTrigger>
          <TabsTrigger value="peak-hours">Peak Hours</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Doughnut Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Revenue Distribution
                </CardTitle>
                <CardDescription>
                  Revenue breakdown by sport and venue
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

            {/* Booking Trends Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Booking Trends
                </CardTitle>
                <CardDescription>
                  Bookings over time ({selectedPeriod})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.bookings}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="bookings" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>
                  Revenue comparison across different venues and sports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.revenue} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={100} />
                      <Tooltip formatter={(value) => formatInr(Number(value))} />
                      <Bar dataKey="amount" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
                <CardDescription>
                  Detailed breakdown of revenue sources
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
                        <p className="text-xs text-gray-500">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Trends Analysis</CardTitle>
              <CardDescription>
                Detailed view of booking patterns and revenue trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.bookings}>
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatInr(Number(value)) : value,
                        name === 'revenue' ? 'Revenue' : 'Bookings'
                      ]}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="bookings"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorBookings)"
                      name="Bookings"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10B981"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peak-hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Peak Booking Hours
              </CardTitle>
              <CardDescription>
                Analyze peak booking times to optimize pricing and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bookings" fill="#3B82F6" name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Bookings */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>
            Latest bookings for your venues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardStats.recentBookings.map((booking, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{booking.facility} - {booking.court}</p>
                    <p className="text-sm text-gray-500">{booking.user}</p>
                    <p className="text-xs text-gray-400">{booking.date} at {booking.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatInr(booking.amount)}</p>
                  <Badge variant={
                    booking.status === 'confirmed' ? 'default' :
                    booking.status === 'completed' ? 'secondary' :
                    booking.status === 'cancelled' ? 'destructive' : 'outline'
                  }>
                    {booking.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
