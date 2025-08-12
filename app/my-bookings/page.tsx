"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatInr } from "@/lib/format"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Star, Download, Share, RefreshCw, CheckCircle } from "lucide-react"

interface BookingData {
  id: string
  venueName: string
  venueLocation: string
  courtName: string
  sport: string
  date: string
  time: string
  duration: number
  status: string
  price: number
  currency: string
  paymentStatus: string
  canCancel: boolean
  canReview: boolean
  rating: number | null
  reviewComment: string | null
  bookingDate: string
  notes: string
  cancellationReason: string | null
  refundAmount: number
}

export default function MyBookingsPage() {
  const [userData, setUserData] = useState<any>(null)
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("All")
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(user)
    if (parsedUser.role !== "user") {
      router.push("/login")
      return
    }

    setUserData(parsedUser)
  }, [router])

  // Load bookings function - moved outside useEffect for reusability
  const loadBookings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      console.log('🔍 Debug Info:')
      console.log('User Data:', userData)
      console.log('Token exists:', !!token)
      console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token')
      
      if (!token) {
        console.error('❌ No token found')
        setBookings([])
        return
      }

      console.log('🚀 Making API request to /api/users/me/bookings')
      
      const res = await fetch('/api/users/me/bookings?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      })
      
      console.log('📡 Response status:', res.status)
      console.log('📡 Response headers:', Object.fromEntries(res.headers.entries()))
      
      const responseText = await res.text()
      console.log('📡 Raw response:', responseText)
      
      let result
      try {
        result = JSON.parse(responseText)
        console.log('📡 Parsed response:', result)
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError)
        console.error('❌ Response was:', responseText)
        setBookings([])
        return
      }
      
      if (!res.ok) {
        console.error('❌ API error:', result.error || `HTTP ${res.status}`)
        setBookings([])
        return
      }
      
      if (result.success) {
        console.log('✅ Bookings loaded:', result.data.bookings?.length || 0)
        setBookings(result.data.bookings || [])
      } else {
        console.error('❌ API returned success: false:', result)
        setBookings([])
      }
    } catch (e: any) {
      console.error('❌ Failed to load bookings:', e)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  // Load bookings on component mount
  useEffect(() => {
    if (userData) {
      loadBookings()
    }
  }, [userData])

  // Calculate booking counts for each status
  const now = new Date();
  const bookingCounts = {
    All: bookings.length,
    Upcoming: bookings.filter(b => {
      const status = b.status.toLowerCase();
      const bookingDate = new Date(b.date + ' ' + b.time.split(' - ')[0]);
      return ['confirmed', 'pending'].includes(status) && bookingDate > now;
    }).length,
    Completed: bookings.filter(b => b.status.toLowerCase() === 'completed').length,
    Cancelled: bookings.filter(b => b.status.toLowerCase() === 'cancelled').length
  }

  const filteredBookings = bookings.filter((booking) => {
    const status = booking.status.toLowerCase();
    
    if (filterStatus === "All") return true;
    
    if (filterStatus === "Upcoming") {
      const bookingDate = new Date(booking.date + ' ' + booking.time.split(' - ')[0]);
      return (status === "confirmed" || status === "pending") && bookingDate > now;
    }
    
    if (filterStatus === "Completed") {
      return status === "completed";
    }
    
    if (filterStatus === "Cancelled") {
      return status === "cancelled";
    }
    
    return true;
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "pending":
        return "default"
      case "completed":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "pending":
        return "Upcoming"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      default:
        return status
    }
  }

  const handleViewDetails = (bookingId: string) => {
    router.push(`/my-bookings/${bookingId}`)
  }

  const downloadBookingReceipt = (booking: BookingData) => {
    const receiptContent = `
═══════════════════════════════════════
           QUICKCOURT RECEIPT
═══════════════════════════════════════

VENUE BOOKING CONFIRMATION

Transaction Details:
─────────────────────────────────────
Booking ID: ${booking.id}
Status: ${booking.status.toUpperCase()}
Payment Status: ${booking.paymentStatus.toUpperCase()}

Booking Details:
─────────────────────────────────────
Venue: ${booking.venueName}
Court: ${booking.courtName}
Sport: ${booking.sport}
Location: ${booking.venueLocation || 'N/A'}

Schedule:
─────────────────────────────────────
Date: ${booking.date}
Time: ${booking.time}
Duration: ${booking.duration} minutes

Amount Details:
─────────────────────────────────────
Amount Paid: ${formatInr(booking.price)}
Payment Status: ${booking.paymentStatus.toUpperCase()}

${booking.notes ? `Notes:\n─────────────────────────────────────\n${booking.notes}\n` : ''}
${booking.rating ? `Rating: ${booking.rating}/5 stars\n${booking.reviewComment || ''}\n` : ''}
${booking.cancellationReason ? `Cancellation Reason: ${booking.cancellationReason}\nRefund Amount: ${formatInr(booking.refundAmount)}\n` : ''}

Customer Support:
─────────────────────────────────────
Email: support@quickcourt.com
Phone: +91 1800-123-4567

═══════════════════════════════════════
        Thank you for choosing
            QUICKCOURT!
═══════════════════════════════════════

Generated on: ${new Date().toLocaleString()}
    `.trim()

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `QuickCourt_Booking_${booking.id}_${new Date().toISOString().split('T')[0]}.txt`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    alert('Receipt downloaded successfully!')
  }

  const shareBookingDetails = (booking: BookingData) => {
    const shareText = `🏆 My QuickCourt Booking

📍 Venue: ${booking.venueName}
🏟️ Court: ${booking.courtName}
🏃 Sport: ${booking.sport}
📅 Date: ${booking.date}
⏰ Time: ${booking.time}
💰 Amount: ${formatInr(booking.price)}
📋 Status: ${booking.status.toUpperCase()}

#QuickCourt #SportsBooking`
    
    if (navigator.share) {
      navigator.share({
        title: 'My QuickCourt Booking',
        text: shareText,
        url: window.location.href
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Booking details copied to clipboard!')
      }).catch(() => {
        // Fallback: Create a temporary textarea
        const textarea = document.createElement('textarea')
        textarea.value = shareText
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        alert('Booking details copied to clipboard!')
      })
    }
  }

  // Test function to verify API connectivity
  const testCancelEndpoint = async () => {
    console.log('🧪 TEST BUTTON CLICKED!')
    alert('Test button clicked! Check console for detailed logs.')
    
    try {
      console.log('🧪 Testing cancel endpoint connectivity...')
      
      // Get the correct base URL
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://192.168.102.132:3000'
      console.log('🧪 Using base URL:', baseUrl)
      
      // Test 1: Simple test endpoint
      console.log('🧪 Step 1: Testing /api/test-cancel endpoint...')
      const testRes = await fetch(`${baseUrl}/api/test-cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data', timestamp: new Date().toISOString() })
      })
      
      const testResult = await testRes.text()
      console.log('🧪 Test endpoint status:', testRes.status)
      console.log('🧪 Test endpoint response:', testResult)
      
      // Test 2: Check if booking API route exists
      console.log('🧪 Step 2: Testing booking API with fake ID...')
      const token = localStorage.getItem('token')
      console.log('🧪 Token exists:', !!token)
      console.log('🧪 Token length:', token?.length || 0)
      
      const fakeRes = await fetch(`${baseUrl}/api/users/me/bookings/507f1f77bcf86cd799439011`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'cancel', reason: 'test' })
      })
      
      const fakeResult = await fakeRes.text()
      console.log('🧪 Fake ID response status:', fakeRes.status)
      console.log('🧪 Fake ID response headers:', Object.fromEntries(fakeRes.headers.entries()))
      console.log('🧪 Fake ID response body:', fakeResult)
      
      // Test 3: Try with actual booking ID if available
      if (bookings.length > 0) {
        const actualBookingId = bookings[0].id
        console.log('🧪 Step 3: Testing with actual booking ID:', actualBookingId)
        
        const realRes = await fetch(`${baseUrl}/api/users/me/bookings/${actualBookingId}`, {
          method: 'GET', // Use GET first to see if we can retrieve the booking
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        const realResult = await realRes.text()
        console.log('🧪 Real booking GET status:', realRes.status)
        console.log('🧪 Real booking GET response:', realResult)
      }
      
      alert('Test completed! Check console for all results.')
      
    } catch (error: any) {
      console.error('🧪 Test failed with error:', error)
      alert(`Test failed: ${error?.message || 'Unknown error'}`)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication required')

      console.log('🔧 Cancelling booking:', bookingId)
      console.log('🔧 Token exists:', !!token)
      
      // Use window.location.origin to get the correct base URL
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://192.168.102.132:3000'
      const requestUrl = `${baseUrl}/api/users/me/bookings/${bookingId}`
      console.log('🔧 Request URL:', requestUrl)

      const res = await fetch(requestUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'cancel',
          reason: 'Cancelled by user'
        })
      })
      
      console.log('🔧 Cancel response status:', res.status)
      console.log('🔧 Cancel response statusText:', res.statusText)
      console.log('🔧 Cancel response headers:', Object.fromEntries(res.headers.entries()))
      
      // Get response as text first to see raw response
      const responseText = await res.text()
      console.log('🔧 Raw response body:', responseText)
      
      let result
      try {
        result = JSON.parse(responseText)
        console.log('🔧 Parsed response:', result)
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError)
        console.log('❌ Response is not valid JSON:', responseText)
        throw new Error(`Server returned invalid response: ${responseText}`)
      }
      
      if (!res.ok) {
        console.error('❌ HTTP Error:', res.status, result)
        throw new Error(result.error || result.details || `HTTP ${res.status}: Failed to cancel booking`)
      }
      
      if (result.success) {
        console.log('✅ Cancellation successful:', result)
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled', canCancel: false }
            : booking
        ))
        alert('Booking cancelled successfully')
      } else {
        console.error('❌ API returned success=false:', result)
        throw new Error(result.error || 'Failed to cancel booking - API returned success=false')
      }
    } catch (e: any) {
      console.error('❌ Cancel booking error:', e)
      console.error('❌ Error stack:', e.stack)
      alert(`Error: ${e.message}`)
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
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-2">View and manage your venue bookings</p>
      </div>

      {/* Debug Info - Remove this in production */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Debug Information</h3>
          <div className="text-sm space-y-1 text-blue-700">
            <p><strong>User ID:</strong> {userData?.id || userData?.userId || 'Not found'}</p>
            <p><strong>User Name:</strong> {userData?.name || 'Not found'}</p>
            <p><strong>Has Token:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Bookings Count:</strong> {bookings.length}</p>
            <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
          </div>
          <div className="flex gap-2 mt-3">
            <Button 
              onClick={() => {
                console.log('🔴 BUTTON CLICKED!')
                testCancelEndpoint()
              }} 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              🧪 Test Cancel API
            </Button>
            <Button 
              onClick={() => {
                console.log('🔄 Refresh bookings clicked')
                loadBookings()
              }} 
              size="sm" 
              variant="outline"
            >
              🔄 Refresh Bookings
            </Button>
          </div>
          <details className="mt-2">
            <summary className="text-xs cursor-pointer text-blue-600">Show Console Logs</summary>
            <p className="text-xs mt-1 text-blue-600">Check browser console (F12) for detailed API logs</p>
          </details>
        </CardContent>
      </Card>

      {/* Header with current filter info */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">
            Showing {filteredBookings.length} {filterStatus.toLowerCase()} booking{filteredBookings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button 
          onClick={() => {
            console.log('🔄 Refresh bookings clicked')
            loadBookings()
          }} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {["All", "Upcoming", "Completed", "Cancelled"].map((status) => {
          const count = bookingCounts[status as keyof typeof bookingCounts];
          const isActive = filterStatus === status;
          
          return (
            <Button
              key={status}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={
                isActive
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }
              variant="outline"
            >
              {status} 
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                isActive 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      <div className="space-y-4">
        {loading && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </CardContent>
          </Card>
        )}

        {!loading && filteredBookings.map((booking) => (
          <Card key={booking.id} className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{booking.venueName}</h3>
                  <p className="text-gray-600">
                    {booking.courtName} • {booking.sport}
                  </p>
                  {booking.venueLocation && (
                    <p className="text-sm text-gray-500">{booking.venueLocation}</p>
                  )}
                </div>
                <Badge
                  variant={getStatusColor(booking.status)}
                  className={getStatusLabel(booking.status) === "Upcoming" ? "bg-gray-900 text-white" : ""}
                >
                  {getStatusLabel(booking.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {booking.date}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {booking.time}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-semibold">₹{booking.price.toLocaleString('en-IN')}</span>
                  <span className="text-gray-500 ml-2">• {booking.duration} mins</span>
                </div>
                <div className="text-sm text-gray-500">
                  Payment: <span className={`capitalize ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>

              {booking.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{booking.notes}</p>
                </div>
              )}

              {booking.cancellationReason && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">
                    <strong>Cancelled:</strong> {booking.cancellationReason}
                  </p>
                  {booking.refundAmount > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      Refund: ₹{booking.refundAmount.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              )}

              {booking.rating && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{booking.rating}/5</span>
                  </div>
                  {booking.reviewComment && (
                    <p className="text-sm text-gray-600 mt-1">{booking.reviewComment}</p>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Booked on {booking.bookingDate}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300 text-gray-700 bg-transparent"
                    onClick={() => handleViewDetails(booking.id)}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-blue-300 text-blue-700 bg-transparent"
                    onClick={() => downloadBookingReceipt(booking)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Receipt
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-green-300 text-green-700 bg-transparent"
                    onClick={() => shareBookingDetails(booking)}
                  >
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  {booking.canCancel && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-300 text-red-700 bg-transparent"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel
                    </Button>
                  )}
                  {booking.canReview && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-yellow-300 text-yellow-700 bg-transparent"
                      onClick={() => {
                        // TODO: Open review modal
                        console.log('Open review modal for booking:', booking.id)
                      }}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Rate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && filteredBookings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 mb-2">
                {filterStatus === "All" ? "No bookings found." : `No ${filterStatus.toLowerCase()} bookings found.`}
              </p>
              {filterStatus !== "All" && (
                <p className="text-sm text-gray-400">
                  Try selecting a different filter or create a new booking.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
