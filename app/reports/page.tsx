"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, TrendingUp, DollarSign, Users, Clock, Filter, AlertCircle } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, ResponsiveContainer, Tooltip } from "recharts"

function ChartLineMultiple({ title, description, data, dataKey1, dataKey2 }: { 
  title: string; 
  description: string;
  data: any[];
  dataKey1: string;
  dataKey2?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value, name) => [value, name]}
            />
            <Line
              dataKey={dataKey1}
              type="monotone"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
            />
            {dataKey2 && (
              <Line
                dataKey={dataKey2}
                type="monotone"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Data trends over selected period <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Real-time analytics from your platform
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

// Add interfaces for type safety
interface ReportData {
  overview?: {
    users: { total: number; new: number };
    facilities: { total: number; new: number };
    venues: { total: number; new: number };
    bookings: { total: number };
    revenue: { total: number; currency: string };
  };
  bookingTrends?: Array<{ date: string; bookings: number; revenue: number }>;
  userTrends?: Array<{ date: string; users: number }>;
  usersByRole?: Array<{ role: string; count: number }>;
  facilityStatus?: Array<{ status: string; count: number }>;
  venueStatus?: Array<{ status: string; count: number }>;
  recentReports?: Array<{
    id: string;
    type: string;
    reason: string;
    status: string;
    reportedBy: string;
    reportedUser: string;
    createdAt: string;
  }>;
  reportStats?: Array<{ status: string; count: number }>;
}

export default function Reports() {
  const [timeRange, setTimeRange] = useState("30")
  const [reportType, setReportType] = useState("all")
  const [reportData, setReportData] = useState<ReportData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch reports data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/admin/reports?timeRange=${timeRange}&type=${reportType}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch reports')
        }
        
        const result = await response.json()
        
        if (result.success) {
          setReportData(result.data)
        } else {
          throw new Error(result.error || 'Failed to fetch reports')
        }
      } catch (err: any) {
        console.error('Error fetching reports:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [timeRange, reportType])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Loading analytics data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-gray-200">
              <CardContent className="p-6">
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Error loading analytics data</p>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">Analyze performance and track key metrics for your facilities</p>
      </div>

      {/* Filter Controls */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="bookings">Bookings</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="facilities">Facilities</SelectItem>
                  <SelectItem value="reports">User Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Actions</label>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats Cards */}
      {reportData.overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900">{reportData.overview.users.total.toLocaleString()}</p>
                  <p className="text-xs text-blue-600">+{reportData.overview.users.new} new</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-green-900">{reportData.overview.bookings.total.toLocaleString()}</p>
                  <p className="text-xs text-green-600">in {timeRange} days</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Facilities</p>
                  <p className="text-2xl font-bold text-purple-900">{reportData.overview.facilities.total.toLocaleString()}</p>
                  <p className="text-xs text-purple-600">+{reportData.overview.facilities.new} new</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Revenue</p>
                  <p className="text-2xl font-bold text-orange-900">₹{reportData.overview.revenue.total.toLocaleString()}</p>
                  <p className="text-xs text-orange-600">estimated</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportData.bookingTrends && reportData.bookingTrends.length > 0 && (
          <ChartLineMultiple 
            title="Booking Trends" 
            description="Daily bookings and revenue over time"
            data={reportData.bookingTrends}
            dataKey1="bookings"
            dataKey2="revenue"
          />
        )}

        {reportData.userTrends && reportData.userTrends.length > 0 && (
          <ChartLineMultiple 
            title="User Registration Trends" 
            description="New user registrations over time"
            data={reportData.userTrends}
            dataKey1="users"
          />
        )}
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Role Distribution */}
        {reportData.usersByRole && (
          <Card>
            <CardHeader>
              <CardTitle>User Distribution by Role</CardTitle>
              <CardDescription>Breakdown of users by their assigned roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.usersByRole.map((item) => (
                  <div key={item.role} className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{item.role}</span>
                    <span className="text-sm text-gray-600">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Facility Status */}
        {reportData.facilityStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Facility Approval Status</CardTitle>
              <CardDescription>Current status of facility applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.facilityStatus.map((item) => (
                  <div key={item.status} className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{item.status}</span>
                    <span className="text-sm text-gray-600">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Reports */}
      {reportData.recentReports && reportData.recentReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent User Reports</CardTitle>
            <CardDescription>Latest user reports requiring moderation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.recentReports.slice(0, 10).map((report) => (
                <div key={report.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{report.type} Report</p>
                      <p className="text-xs text-gray-600">{report.reason}</p>
                      <p className="text-xs text-gray-500">
                        By: {report.reportedBy} → Against: {report.reportedUser}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
