"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Calendar, MapPin, Clock, Download, Share, Home, ArrowLeft } from 'lucide-react'
import { formatInr } from '@/lib/format'
import { toast } from '@/components/ui/use-toast'

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [bookingData, setBookingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Get booking details from URL params or localStorage
  useEffect(() => {
    const bookingId = searchParams.get('bookingId')
    const transactionId = searchParams.get('transactionId')
    
    // Check localStorage for recent booking data
    const recentBooking = localStorage.getItem('recentBooking')
    if (recentBooking) {
      try {
        const booking = JSON.parse(recentBooking)
        setBookingData(booking)
        setLoading(false)
      } catch (error) {
        console.error('Error parsing recent booking:', error)
      }
    }

    // If we have URL params, fetch from API
    if (bookingId) {
      fetchBookingDetails(bookingId)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBookingData(data.booking)
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch booking details:', response.status, errorText)
        
        // Try to parse error response
        try {
          const errorData = JSON.parse(errorText)
          console.error('API Error:', errorData)
        } catch {
          console.error('Raw error response:', errorText)
        }
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadConfirmationReceipt = () => {
    if (!bookingData) return

    const receiptContent = `
═══════════════════════════════════════
         BOOKING CONFIRMATION
           QUICKCOURT RECEIPT
═══════════════════════════════════════

🎉 BOOKING CONFIRMED SUCCESSFULLY! 🎉

Transaction Details:
─────────────────────────────────────
Booking ID: ${bookingData.bookingId || bookingData._id || 'N/A'}
Confirmation Code: ${bookingData.confirmationCode || 'QC' + Date.now()}
Date & Time: ${new Date().toLocaleString()}
Status: CONFIRMED ✅

Booking Details:
─────────────────────────────────────
Venue: ${bookingData.venueName || bookingData.venue?.name || 'Elite Sports Complex'}
Court: ${bookingData.courtName || bookingData.court?.name || 'Basketball Court A'}
Sport: ${bookingData.sport || 'Basketball'}
Location: ${bookingData.venueLocation || bookingData.venue?.location || 'City Center'}

Schedule:
─────────────────────────────────────
Date: ${bookingData.date || new Date(bookingData.startTime).toLocaleDateString()}
Start Time: ${bookingData.startTime ? new Date(bookingData.startTime).toLocaleTimeString() : bookingData.time?.split(' - ')[0] || '10:00 AM'}
End Time: ${bookingData.endTime ? new Date(bookingData.endTime).toLocaleTimeString() : bookingData.time?.split(' - ')[1] || '11:00 AM'}
Duration: ${bookingData.duration || 60} minutes

Payment Details:
─────────────────────────────────────
Amount Paid: ${formatInr(bookingData.totalPrice || bookingData.price || 1500)}
Payment Method: ${bookingData.paymentMethod || 'Online Payment'}
Payment Status: SUCCESSFUL ✅
Transaction ID: ${bookingData.transactionId || 'TXN' + Date.now()}

${bookingData.notes ? `Notes:\n─────────────────────────────────────\n${bookingData.notes}\n` : ''}

Important Information:
─────────────────────────────────────
• Please arrive 15 minutes before your booking time
• Bring a valid ID for verification
• Sports equipment may be available for rent at venue
• Cancellation allowed up to 2 hours before booking time

Customer Support:
─────────────────────────────────────
Email: support@quickcourt.com
Phone: +91 1800-123-4567
WhatsApp: +91 9876543210

═══════════════════════════════════════
        Thank you for choosing
            QUICKCOURT!
        
    Have an amazing game! 🏆
═══════════════════════════════════════

Generated on: ${new Date().toLocaleString()}
    `.trim()

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `QuickCourt_Confirmation_${bookingData.bookingId || 'booking'}_${new Date().toISOString().split('T')[0]}.txt`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast({
      title: "Confirmation Downloaded",
      description: "Your booking confirmation has been downloaded successfully!",
    })
  }

  const shareBookingConfirmation = () => {
    if (!bookingData) return

    const shareText = `🎉 Booking Confirmed! 🎉

🏆 My QuickCourt Booking
📍 Venue: ${bookingData.venueName || bookingData.venue?.name || 'Elite Sports Complex'}
🏟️ Court: ${bookingData.courtName || bookingData.court?.name || 'Basketball Court A'}
📅 Date: ${bookingData.date || new Date(bookingData.startTime).toLocaleDateString()}
⏰ Time: ${bookingData.time || new Date(bookingData.startTime).toLocaleTimeString()}
💰 Amount: ${formatInr(bookingData.totalPrice || bookingData.price || 1500)}
✅ Status: CONFIRMED

Ready to play! 🏃‍♂️

#QuickCourt #SportsBooking #GameTime`
    
    if (navigator.share) {
      navigator.share({
        title: 'QuickCourt Booking Confirmed!',
        text: shareText,
        url: window.location.href
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        toast({
          title: "Copied!",
          description: "Booking confirmation details copied to clipboard"
        })
      }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea')
        textarea.value = shareText
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        toast({
          title: "Copied!",
          description: "Booking confirmation details copied to clipboard"
        })
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading confirmation details...</p>
        </div>
      </div>
    )
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Card>
            <CardContent className="py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
              <p className="text-gray-600 mb-6">We couldn't find the booking confirmation details.</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push('/my-bookings')}>
                  View My Bookings
                </Button>
                <Button variant="outline" onClick={() => router.push('/user-home')}>
                  Book New Venue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">Your venue has been successfully booked</p>
          <Badge className="mt-2 bg-green-100 text-green-800 text-sm px-3 py-1">
            Confirmation ID: {bookingData.bookingId || bookingData._id || 'QC' + Date.now()}
          </Badge>
        </div>

        {/* Main Confirmation Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Booking Details</span>
              <Badge variant="secondary">CONFIRMED</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Venue Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Venue</p>
                    <p className="text-sm text-gray-600">{bookingData.venueName || bookingData.venue?.name || 'Elite Sports Complex'}</p>
                    {(bookingData.venueLocation || bookingData.venue?.location) && (
                      <p className="text-xs text-gray-500">{bookingData.venueLocation || bookingData.venue?.location}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm text-gray-600">
                      {bookingData.date || new Date(bookingData.startTime).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {bookingData.time || `${new Date(bookingData.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(bookingData.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Court & Sport</p>
                    <p className="text-sm text-gray-600">{bookingData.courtName || bookingData.court?.name || 'Basketball Court A'}</p>
                    <p className="text-xs text-gray-500">{bookingData.sport || 'Basketball'} • {bookingData.duration || 60} minutes</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Amount Paid</p>
                  <p className="text-3xl font-bold text-green-600">{formatInr(bookingData.totalPrice || bookingData.price || 1500)}</p>
                  <p className="text-sm text-gray-600">Payment successful ✅</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="font-medium text-sm">Payment Details</p>
                  <p className="text-sm text-gray-600">Method: {bookingData.paymentMethod || 'Online Payment'}</p>
                  <p className="text-sm text-gray-600">Transaction: {bookingData.transactionId || 'TXN' + Date.now()}</p>
                  <p className="text-sm text-gray-600">Status: Completed</p>
                </div>

                {bookingData.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-medium text-sm">Notes</p>
                      <p className="text-sm text-gray-600">{bookingData.notes}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Important Information</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Please arrive 15 minutes before your booking time</li>
              <li>• Bring a valid ID for verification</li>
              <li>• Sports equipment may be available for rent at venue</li>
              <li>• Cancellation allowed up to 2 hours before booking time</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button onClick={downloadConfirmationReceipt} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Confirmation
          </Button>
          <Button variant="outline" onClick={shareBookingConfirmation} className="flex items-center gap-2">
            <Share className="h-4 w-4" />
            Share Details
          </Button>
          <Button variant="outline" onClick={() => router.push('/my-bookings')} className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            View All Bookings
          </Button>
          <Button variant="outline" onClick={() => router.push('/user-home')} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Book Another Venue
          </Button>
        </div>

        {/* Support Information */}
        <Card>
          <CardContent className="text-center p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">Our customer support team is here to assist you</p>
            <div className="flex justify-center gap-4 text-sm">
              <span>📧 support@quickcourt.com</span>
              <span>📞 +91 1800-123-4567</span>
              <span>💬 WhatsApp: +91 9876543210</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
