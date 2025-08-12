"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Calendar, MapPin, Clock, Trophy, Download, Share2, ArrowLeft } from "lucide-react"
import { formatInr } from "@/lib/format"

export default function PaymentCompletedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<any>(null)

  useEffect(() => {
    // Get payment data from URL params or localStorage
    const txId = searchParams.get('txId')
    const type = searchParams.get('type') // 'venue' or 'tournament'
    const amount = searchParams.get('amount')
    const venue = searchParams.get('venue')
    const date = searchParams.get('date')
    const tournament = searchParams.get('tournament')

    if (txId) {
      setPaymentData({
        transactionId: txId,
        type: type || 'venue',
        amount: amount ? parseInt(amount) : 0,
        venue: venue || 'Elite Sports Complex',
        date: date || new Date().toLocaleDateString(),
        tournament: tournament,
        timestamp: new Date().toLocaleString(),
        status: 'success'
      })
    } else {
      // Fallback data for demo
      setPaymentData({
        transactionId: `TXN_${Date.now()}`,
        type: 'venue',
        amount: 1500,
        venue: 'Elite Sports Complex',
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toLocaleString(),
        status: 'success'
      })
    }
  }, [searchParams])

  // Download receipt function
  const downloadReceipt = () => {
    if (!paymentData) return

    const isVenueBooking = paymentData.type === 'venue'
    
    const receiptContent = `
═══════════════════════════════════════
           QUICKCOURT RECEIPT
═══════════════════════════════════════

${isVenueBooking ? 'VENUE BOOKING CONFIRMATION' : 'TOURNAMENT REGISTRATION CONFIRMATION'}

Transaction Details:
─────────────────────────────────────
Transaction ID: ${paymentData.transactionId}
Date & Time: ${paymentData.timestamp}
Status: CONFIRMED
Payment Method: Credit Card

${isVenueBooking ? `
Booking Details:
─────────────────────────────────────
Venue: ${paymentData.venue}
Court: Basketball Court A
Sport: Basketball
Date: ${paymentData.date}
Time: 4:00 PM - 5:00 PM
Duration: 1 hour(s)
` : `
Registration Details:
─────────────────────────────────────
Tournament: ${paymentData.tournament || 'Mumbai Basketball Premier League'}
Sport: Basketball
Category: 5v5
Registration Date: ${paymentData.date}
Event Start: September 10, 2024
Venue: NSCI Indoor Stadium, Mumbai
`}

Amount Details:
─────────────────────────────────────
Amount Paid: ${formatInr(paymentData.amount)}
Payment Status: SUCCESSFUL

${isVenueBooking ? `
Important Information:
─────────────────────────────────────
• Please arrive 15 minutes before your scheduled time
• Bring a valid ID for verification
• Free cancellation up to 24 hours before booking
• Contact venue: +91 98765 43210
` : `
Important Information:
─────────────────────────────────────
• Tournament starts on September 10, 2024
• Check your email for detailed schedule and rules
• Bring valid ID and required sports equipment
• Contact organizer for any queries
`}

Customer Support:
─────────────────────────────────────
Email: support@quickcourt.com
Phone: +91 1800-123-4567
Website: www.quickcourt.com

═══════════════════════════════════════
        Thank you for choosing
            QUICKCOURT!
═══════════════════════════════════════

Generated on: ${new Date().toLocaleString()}
    `.trim()

    // Create and download the file
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `QuickCourt_Receipt_${paymentData.transactionId}.txt`
    
    // Append to body, click, and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the URL object
    window.URL.revokeObjectURL(url)
  }

  // Share receipt function
  const shareReceipt = async () => {
    if (!paymentData) return

    const isVenueBooking = paymentData.type === 'venue'
    const shareText = `🏆 ${isVenueBooking ? 'Venue Booked' : 'Tournament Registered'}! 

${isVenueBooking ? `✅ Venue: ${paymentData.venue}` : `✅ Tournament: ${paymentData.tournament || 'Mumbai Basketball Premier League'}`}
📅 Date: ${paymentData.date}
💰 Amount: ${formatInr(paymentData.amount)}
🆔 Receipt: ${paymentData.transactionId}

Book your sports venue at QuickCourt! 🎾🏀⚽`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QuickCourt Receipt',
          text: shareText,
          url: window.location.origin
        })
      } catch (error) {
        console.log('Error sharing:', error)
        fallbackShare(shareText)
      }
    } else {
      fallbackShare(shareText)
    }
  }

  // Fallback share function for browsers that don't support Web Share API
  const fallbackShare = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Receipt details copied to clipboard!')
    }).catch(() => {
      // Final fallback - show the text in an alert
      alert(`Share this receipt:\n\n${text}`)
    })
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    )
  }

  const isVenueBooking = paymentData.type === 'venue'
  const isTournamentRegistration = paymentData.type === 'tournament'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isVenueBooking ? 'Booking Confirmed!' : 'Registration Successful!'}
          </h1>
          <p className="text-gray-600">
            {isVenueBooking 
              ? 'Your venue has been booked successfully' 
              : 'You have been registered for the tournament'
            }
          </p>
        </div>

        {/* Payment Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Payment Successful
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Transaction ID:</span>
                <p className="font-mono font-medium">{paymentData.transactionId}</p>
              </div>
              <div>
                <span className="text-gray-600">Amount Paid:</span>
                <p className="font-semibold text-green-600">{formatInr(paymentData.amount)}</p>
              </div>
              <div>
                <span className="text-gray-600">Payment Date:</span>
                <p>{paymentData.timestamp}</p>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking/Registration Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isVenueBooking ? (
                <>
                  <MapPin className="h-5 w-5" />
                  Booking Details
                </>
              ) : (
                <>
                  <Trophy className="h-5 w-5" />
                  Tournament Registration
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isVenueBooking ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Venue:</span>
                  <span className="font-medium">{paymentData.venue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Court:</span>
                  <span>Basketball Court A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{paymentData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span>4:00 PM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sport:</span>
                  <span>Basketball</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tournament:</span>
                  <span className="font-medium">{paymentData.tournament || 'Mumbai Basketball Premier League'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sport:</span>
                  <span>Basketball</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span>5v5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration Date:</span>
                  <span>{paymentData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Entry Fee:</span>
                  <span>{formatInr(paymentData.amount)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isVenueBooking ? (
              <>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Arrival Instructions</p>
                    <p className="text-sm text-gray-600">Please arrive 15 minutes before your scheduled time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Cancellation Policy</p>
                    <p className="text-sm text-gray-600">Free cancellation up to 24 hours before booking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Venue Contact</p>
                    <p className="text-sm text-gray-600">+91 98765 43210</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Tournament Details</p>
                    <p className="text-sm text-gray-600">Check your email for tournament schedule and rules</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Event Dates</p>
                    <p className="text-sm text-gray-600">Tournament starts on September 10, 2024</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Venue Location</p>
                    <p className="text-sm text-gray-600">NSCI Indoor Stadium, Mumbai</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button className="flex-1" asChild>
            <Link href={isVenueBooking ? "/my-bookings" : "/my-tournaments"}>
              {isVenueBooking ? "View My Bookings" : "View My Tournaments"}
            </Link>
          </Button>
          <Button variant="outline" className="flex-1" onClick={downloadReceipt}>
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
          <Button variant="outline" className="flex-1" onClick={shareReceipt}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Button variant="ghost" asChild>
            <Link href="/user-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>A confirmation email has been sent to your registered email address.</p>
          <p>Need help? Contact support at support@quickcourt.com</p>
        </div>

      </div>
    </div>
  )
}

