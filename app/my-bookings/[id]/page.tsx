"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { formatInr } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, MapPin, CreditCard, Star, CheckCircle, XCircle } from "lucide-react"

interface BookingDetails {
  id: string
  venue: {
    id: string
    name: string
    location: string
    contactNumber: string
    images: string[]
    amenities: string[]
  }
  court: {
    id: string
    name: string
    sport: string
    surfaceType: string
    images: string[]
    pricing: any
  }
  date: string
  startTime: string
  endTime: string
  duration: number
  status: string
  pricing: any
  totalPrice: number
  paymentStatus: string
  paymentId: string
  canCancel: boolean
  canCheckIn: boolean
  canCheckOut: boolean
  canReview: boolean
  notes: string
  review: any
  checkInAt: string
  checkOutAt: string
  cancellationReason: string
  refundAmount: number
  createdAt: string
  updatedAt: string
}

export default function BookingDetailsPage() {
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    fetchBookingDetails()
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication required')

      const response = await fetch(`/api/users/me/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch booking details')
      }

      if (result.success) {
        setBooking(result.data.booking)
      } else {
        throw new Error(result.error || 'Failed to fetch booking details')
      }
    } catch (err: any) {
      console.error('Error fetching booking details:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication required')

      const res = await fetch(`/api/users/me/bookings/${bookingId}`, {
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
      
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to cancel booking')
      
      if (result.success) {
        alert('Booking cancelled successfully')
        // Refresh booking details
        fetchBookingDetails()
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Booking not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Booking Details</h1>
          <p className="text-gray-600">Booking ID: {booking.id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Venue & Court Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Venue & Court Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{booking.venue.name}</h3>
              <p className="text-gray-600">{booking.venue.location}</p>
              {booking.venue.contactNumber && (
                <p className="text-sm text-gray-500">Contact: {booking.venue.contactNumber}</p>
              )}
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium">{booking.court.name}</h4>
              <p className="text-sm text-gray-600">Sport: {booking.court.sport}</p>
              {booking.court.surfaceType && (
                <p className="text-sm text-gray-600">Surface: {booking.court.surfaceType}</p>
              )}
            </div>

            {booking.venue.amenities && booking.venue.amenities.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {booking.venue.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Booking Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment</p>
                <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                  {booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1)}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Date & Time</p>
              <p className="font-medium">{booking.date}</p>
              <div className="flex items-center mt-1">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {new Date(booking.startTime).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })} - {new Date(booking.endTime).toLocaleTimeString('en-IN', {
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
                <span className="ml-2 text-sm text-gray-500">({booking.duration} mins)</span>
              </div>
            </div>

            {booking.notes && (
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-sm">{booking.notes}</p>
              </div>
            )}

            {booking.cancellationReason && (
              <div>
                <p className="text-sm text-gray-500">Cancellation Reason</p>
                <p className="text-sm text-red-600">{booking.cancellationReason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-semibold">{formatInr(booking.totalPrice)}</span>
            </div>
            
            {booking.pricing && (
              <>
                {booking.pricing.baseRate && (
                  <div className="flex justify-between text-sm">
                    <span>Base Rate:</span>
                    <span>{formatInr(booking.pricing.baseRate)}</span>
                  </div>
                )}
                {booking.pricing.tax && (
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>{formatInr(booking.pricing.tax)}</span>
                  </div>
                )}
                {booking.pricing.platformFee && (
                  <div className="flex justify-between text-sm">
                    <span>Platform Fee:</span>
                    <span>{formatInr(booking.pricing.platformFee)}</span>
                  </div>
                )}
              </>
            )}

            {booking.paymentId && (
              <div className="border-t pt-3 text-sm">
                <p className="text-gray-500">Payment ID: {booking.paymentId}</p>
              </div>
            )}

            {booking.refundAmount > 0 && (
              <div className="border-t pt-3">
                <div className="flex justify-between text-green-600">
                  <span>Refund Amount:</span>
                  <span className="font-semibold">{formatInr(booking.refundAmount)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {booking.canCancel && (
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleCancelBooking}
              >
                Cancel Booking
              </Button>
            )}

            {booking.canCheckIn && (
              <Button 
                variant="outline" 
                className="w-full"
                disabled
              >
                Check In (Available on booking day)
              </Button>
            )}

            {booking.canReview && (
              <Button 
                variant="outline" 
                className="w-full"
                disabled
              >
                <Star className="h-4 w-4 mr-2" />
                Write Review
              </Button>
            )}

            {!booking.canCancel && !booking.canCheckIn && !booking.canReview && (
              <p className="text-center text-gray-500 py-4">
                No actions available for this booking
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Timeline */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Booking Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium">Booking Created</p>
                <p className="text-xs text-gray-500">
                  {new Date(booking.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {booking.checkInAt && (
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium">Checked In</p>
                  <p className="text-xs text-gray-500">
                    {new Date(booking.checkInAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            )}

            {booking.checkOutAt && (
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm font-medium">Checked Out</p>
                  <p className="text-xs text-gray-500">
                    {new Date(booking.checkOutAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
