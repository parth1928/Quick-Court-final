"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatInr } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, Search, Filter, RefreshCw } from "lucide-react"

interface BookingData {
  id: string
  userName: string
  userEmail: string
  userPhone: string
  court: string
  courtType: string
  facility: string
  facilityLocation: string
  date: string
  time: string
  status: string
  amount: number
  bookingDate: string
  paymentStatus: string
  paymentId: string | null
  notes: string
  checkInAt: Date | null
  checkOutAt: Date | null
  cancellationReason: string | null
  canCancel: boolean
  startTime: Date
  endTime: Date
  createdAt: Date
  updatedAt: Date
}

interface BookingSummary {
  total: number
  upcoming: number
  completed: number
  cancelled: number
  revenue: number
}

export default function BookingOverviewPage() {
  const [userData, setUserData] = useState<any>(null)
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [summary, setSummary] = useState<BookingSummary>({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [dateFilter, setDateFilter] = useState("All")
  const router = useRouter()

  // Load bookings from API
  const loadBookings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      console.log('🔄 Loading owner bookings...')
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://192.168.102.132:3000'
      
      // Build query parameters
      const params = new URLSearchParams()
      if (statusFilter !== 'All') params.append('status', statusFilter)
      if (dateFilter !== 'All') params.append('dateFilter', dateFilter)
      if (searchTerm.trim()) params.append('search', searchTerm.trim())

      const url = `${baseUrl}/api/owner/bookings${params.toString() ? `?${params.toString()}` : ''}`
      console.log('🔍 Request URL:', url)

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        if (response.status === 403) {
          router.push('/login')
          return
        }
        throw new Error(`HTTP ${response.status}: Failed to load bookings`)
      }

      const result = await response.json()
      console.log('📊 API Response:', result)

      if (result.success) {
        setBookings(result.data.bookings)
        setSummary(result.data.summary)
        console.log('✅ Loaded bookings:', result.data.bookings.length)
      } else {
        console.error('❌ API error:', result.error)
        alert(`Error: ${result.error}`)
      }
    } catch (error: any) {
      console.error('💥 Failed to load bookings:', error)
      alert(`Failed to load bookings: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Debug function to test API connectivity
  const testOwnerAPI = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('No token found')
        return
      }

      console.log('🧪 Testing owner API...')
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://192.168.102.132:3000'
      
      // Test debug endpoint
      const debugResponse = await fetch(`${baseUrl}/api/owner/debug`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const debugResult = await debugResponse.json()
      console.log('🧪 Debug API Response:', debugResult)
      
      if (debugResult.success) {
        const { debug } = debugResult
        console.log('👤 User ID:', debug.userId)
        console.log('🏢 Facilities Count:', debug.facilitiesCount)
        console.log('🏟️ Courts Count:', debug.courtsCount)
        console.log('📅 Bookings Count:', debug.bookingsCount)
        
        if (debug.facilities && debug.facilities.length > 0) {
          console.log('🏢 Facilities:', debug.facilities)
        }
        if (debug.courts && debug.courts.length > 0) {
          console.log('🏟️ Courts:', debug.courts)
        }
        if (debug.bookings && debug.bookings.length > 0) {
          console.log('📅 Bookings:', debug.bookings)
        }

        // Create detailed alert message
        let message = `Debug Results:\n`
        message += `• User ID: ${debug.userId}\n`
        message += `• Role: ${debug.userRole}\n`
        message += `• Facilities: ${debug.facilitiesCount}\n`
        message += `• Courts: ${debug.courtsCount}\n`
        message += `• Bookings: ${debug.bookingsCount}\n\n`
        
        if (debug.facilitiesCount === 0) {
          message += `❌ No facilities found! You need to create facilities first.\n`
        } else if (debug.courtsCount === 0) {
          message += `❌ No courts found! Your facilities need courts to receive bookings.\n`
        } else if (debug.bookingsCount === 0) {
          message += `⚠️ No bookings found! Your facilities are set up but haven't received bookings yet.\n`
        } else {
          message += `✅ Everything looks good! Check console for detailed data.\n`
        }
        
        alert(message)
      } else {
        alert(`Debug failed: ${debugResult.error}`)
      }
    } catch (error: any) {
      console.error('💥 Test API error:', error)
      alert(`Test failed: ${error.message}`)
    }
  }

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
    loadBookings()
  }, [router])

  // Reload when filters change
  useEffect(() => {
    if (userData) {
      loadBookings()
    }
  }, [statusFilter, dateFilter, searchTerm])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "booked":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusDisplayText = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "Confirmed"
      case "pending":
        return "Pending"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Booking Overview</h1>
        <p className="text-gray-600 mt-2">View and manage all upcoming and past bookings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.upcoming}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{formatInr(summary.revenue)}</div>
            <div className="text-sm text-gray-600">Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testOwnerAPI}
                className="flex items-center space-x-2 bg-yellow-50 border-yellow-300 text-yellow-700"
              >
                <span>🧪</span>
                <span>Test API</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadBookings}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Dates</SelectItem>
                <SelectItem value="Today">Today</SelectItem>
                <SelectItem value="This Week">This Week</SelectItem>
                <SelectItem value="This Month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Booking Records ({bookings.length} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading bookings...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-700">User</TableHead>
                    <TableHead className="text-gray-700">Court & Facility</TableHead>
                    <TableHead className="text-gray-700">Date & Time</TableHead>
                    <TableHead className="text-gray-700">Status</TableHead>
                    <TableHead className="text-gray-700">Amount</TableHead>
                    <TableHead className="text-gray-700">Payment</TableHead>
                    <TableHead className="text-gray-700">Booked On</TableHead>
                    <TableHead className="text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking: BookingData) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{booking.userName}</div>
                          <div className="text-sm text-gray-600">{booking.userEmail}</div>
                          {booking.userPhone && (
                            <div className="text-sm text-gray-500">{booking.userPhone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{booking.court}</div>
                          <div className="text-sm text-gray-600">{booking.facility}</div>
                          {booking.courtType && (
                            <div className="text-xs text-gray-500">{booking.courtType}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{booking.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusDisplayText(booking.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {formatInr(booking.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className={`font-medium ${
                            booking.paymentStatus === 'paid' ? 'text-green-600' : 
                            booking.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1) || 'Pending'}
                          </div>
                          {booking.paymentId && (
                            <div className="text-xs text-gray-500">{booking.paymentId}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{booking.bookingDate}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 bg-transparent">
                            View
                          </Button>
                          {booking.canCancel && (
                            <Button variant="outline" size="sm" className="border-red-300 text-red-700 bg-transparent">
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && bookings.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500 mb-6">
                Your facilities haven't received any bookings yet, or you may need to set up your facilities first.
              </p>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={testOwnerAPI}
                  className="bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  🧪 Run Diagnostics
                </Button>
                <div className="text-sm text-gray-400">
                  Click "Run Diagnostics" to check your setup, or contact support if you need help setting up facilities.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
