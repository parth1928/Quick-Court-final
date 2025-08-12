"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, DollarSign, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import BookingTrendsChart from '@/components/charts/BookingTrendsChart';
import EarningsSummaryChart from '@/components/charts/EarningsSummaryChart';
import PeakBookingHoursChart from '@/components/charts/PeakBookingHoursChart';

interface AnalyticsData {
  overview: {
    users: { total: number; new: number; growthRate: number };
    facilities: { total: number; active: number; utilizationRate: number };
    venues: { total: number; active: number };
    bookings: { total: number; recent: number; avgValue: number };
    tournaments: { total: number; active: number };
    revenue: { total: number; currency: string };
  };
  trends: {
    userGrowth: Array<{ date: string; users: number }>;
    bookingTrends: Array<{ date: string; bookings: number; revenue: number }>;
  };
  distribution: {
    usersByRole: Array<{ role: string; count: number }>;
    facilityStatus: Array<{ status: string; count: number }>;
    venueStatus: Array<{ status: string; count: number }>;
  };
  platformHealth: {
    userEngagement: number;
    facilityUtilization: number;
    revenueGrowth: number;
    systemUptime: number;
  };
  topMetrics: {
    mostActiveDay: string;
    peakHours: string;
    popularSport: string;
    avgSessionDuration: string;
  };
}

const DashboardPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("30")

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics')
        }
        
        const result = await response.json()
        
        if (result.success) {
          setAnalyticsData(result.data)
        } else {
          throw new Error(result.error || 'Failed to fetch analytics')
        }
      } catch (err: any) {
        console.error('Error fetching analytics:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Loading analytics data...</p>
          </div>
          <div className="animate-spin">
            <RefreshCw className="h-5 w-5" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Error loading analytics data</p>
          </div>
        </div>
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analyticsData) {
    return <div>No data available</div>
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor your sports facility performance and booking trends
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <TrendingUp className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.bookings.total.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{analyticsData.overview.bookings.recent} recent</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{analyticsData.overview.revenue.total.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{analyticsData.platformHealth.revenueGrowth}% growth</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.users.total.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{analyticsData.overview.users.growthRate}% growth</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peak Hour</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.topMetrics.peakHours}</p>
              </div>
              <div className="bg-orange-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600">Most active time</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Booking Trends Chart - Full width on mobile, half on desktop */}
        <div className="xl:col-span-2">
          <BookingTrendsChart height={350} />
        </div>

        {/* Earnings Summary Chart */}
        <div>
          <EarningsSummaryChart height={400} />
        </div>

        {/* Peak Hours Chart */}
        <div>
          <PeakBookingHoursChart height={400} />
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Health */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">User Engagement</span>
              <span className="text-sm text-gray-600">{analyticsData.platformHealth.userEngagement.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Facility Utilization</span>
              <span className="text-sm text-gray-600">{analyticsData.platformHealth.facilityUtilization}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">System Uptime</span>
              <span className="text-sm text-gray-600">{analyticsData.platformHealth.systemUptime}%</span>
            </div>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Users by role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analyticsData.distribution.usersByRole.map((item) => (
              <div key={item.role} className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">{item.role}</span>
                <span className="text-sm text-gray-600">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Facility Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Facility Status</CardTitle>
            <CardDescription>Application approval status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analyticsData.distribution.facilityStatus.map((item) => (
              <div key={item.status} className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">{item.status}</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  item.status === 'approved' ? 'bg-green-100 text-green-800' :
                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Venue Status</CardTitle>
            <CardDescription>Venue approval status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analyticsData.distribution.venueStatus.map((item) => (
              <div key={item.status} className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">{item.status}</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  item.status === 'approved' ? 'bg-green-100 text-green-800' :
                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Top Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Most Active Day</span>
              <span className="text-sm text-gray-600">{analyticsData.topMetrics.mostActiveDay}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Popular Sport</span>
              <span className="text-sm text-gray-600">{analyticsData.topMetrics.popularSport}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Avg Session</span>
              <span className="text-sm text-gray-600">{analyticsData.topMetrics.avgSessionDuration}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Court #3 booked</p>
                <p className="text-xs text-gray-600">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-gray-600">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Payment processed</p>
                <p className="text-xs text-gray-600">8 minutes ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-3">
              <p className="text-sm font-medium">Tennis Tournament</p>
              <p className="text-xs text-gray-600">Tomorrow, 2:00 PM</p>
            </div>
            <div className="border-l-4 border-green-500 pl-3">
              <p className="text-sm font-medium">Basketball League</p>
              <p className="text-xs text-gray-600">Friday, 6:00 PM</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-3">
              <p className="text-sm font-medium">Swimming Classes</p>
              <p className="text-xs text-gray-600">Weekend, 9:00 AM</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
