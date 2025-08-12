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
    const court = searchParams.get('court')
    const date = searchParams.get('date')
    const timeSlots = searchParams.get('timeSlots')
    const bookingId = searchParams.get('bookingId')
    const tournament = searchParams.get('tournament')
    const status = searchParams.get('status')
    const registrationId = searchParams.get('registrationId')
    const participantType = searchParams.get('participantType')
    const teamName = searchParams.get('teamName')
    const playerName = searchParams.get('playerName')

    if (txId) {
      setPaymentData({
        transactionId: txId,
        type: type || 'venue',
        amount: amount ? parseInt(amount) : 0,
        venue: venue || 'Elite Sports Complex',
        court: court || 'Basketball Court A',
        date: date || new Date().toLocaleDateString(),
        timeSlots: timeSlots ? timeSlots.split(',') : ['4:00 PM'],
        bookingId: bookingId || '',
        tournament: tournament,
        timestamp: new Date().toLocaleString(),
        status: status || 'success',
        paymentMethod: 'Credit Card',
        registrationId: registrationId,
        participantType: participantType,
        teamName: teamName,
        playerName: playerName,
        customerSupport: {
          email: 'support@quickcourt.com',
          phone: '+91 1800-123-4567',
          website: 'www.quickcourt.com'
        }
      })
    } else {
      // Fallback data for demo
      setPaymentData({
        transactionId: `TXN_${Date.now()}`,
        type: 'venue',
        amount: 1500,
        venue: 'Elite Sports Complex',
        court: 'Basketball Court A',
        date: new Date().toLocaleDateString(),
        timeSlots: ['4:00 PM'],
        timestamp: new Date().toLocaleString(),
        status: 'success',
        paymentMethod: 'Credit Card',
        customerSupport: {
          email: 'support@quickcourt.com',
          phone: '+91 1800-123-4567',
          website: 'www.quickcourt.com'
        }
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
${paymentData.bookingId ? `Booking ID: ${paymentData.bookingId}` : ''}
Date & Time: ${paymentData.timestamp}
Status: CONFIRMED
Payment Method: ${paymentData.paymentMethod || 'Credit Card'}

${isVenueBooking ? `
Booking Details:
─────────────────────────────────────
Venue: ${paymentData.venue}
Court: ${paymentData.court}
Sport: Basketball
Date: ${paymentData.date}
Time: ${paymentData.timeSlots ? paymentData.timeSlots.join(', ') : '4:00 PM - 5:00 PM'}
Duration: ${paymentData.timeSlots ? paymentData.timeSlots.length : 1} hour(s)
` : `
Registration Details:
─────────────────────────────────────
Tournament: ${paymentData.tournament || 'Mumbai Basketball Premier League'}
Sport: ${paymentData.sport || 'Basketball'}
Category: ${paymentData.category || '5v5'}
Registration Date: ${paymentData.date}
Registration Type: ${paymentData.participantType === 'team' ? 'Team Registration' : 'Individual Registration'}
${paymentData.participantType === 'team' && paymentData.teamName ? `Team Name: ${paymentData.teamName}` : ''}
${paymentData.participantType === 'individual' && paymentData.playerName ? `Player Name: ${paymentData.playerName}` : ''}
Event Start: TBD (Check email for schedule)
Venue: ${paymentData.venue || 'NSCI Indoor Stadium, Mumbai'}
`}

Amount Details:
─────────────────────────────────────
Amount Paid: ${formatInr(paymentData.amount)}
Payment Status: SUCCESSFUL
${isVenueBooking ? `
Breakdown:
• Base Rate: ${formatInr(Math.round(paymentData.amount * 0.8))}
• Tax (18%): ${formatInr(Math.round(paymentData.amount * 0.144))}
• Platform Fee: ${formatInr(Math.round(paymentData.amount * 0.056))}
• Total: ${formatInr(paymentData.amount)}
` : ''}

${isVenueBooking ? `
Important Information:
─────────────────────────────────────
• Please arrive 15 minutes before your scheduled time
• Bring a valid ID for verification
• Free cancellation up to 24 hours before booking
• Contact venue: +91 98765 43210
• Show this receipt for entry
• Equipment rental available at venue

Booking Rules:
─────────────────────────────────────
• No outside food or drinks allowed
• Proper sports attire required
• Maximum ${paymentData.timeSlots ? paymentData.timeSlots.length * 10 : 10} players allowed
• Court must be vacated on time
` : `
Important Information:
─────────────────────────────────────
• Tournament schedule will be emailed to registered participants
• Bring valid ID and required sports equipment
• Contact organizer for any queries: support@quickcourt.com
• Registration is confirmed and payment successful
• Check your email for detailed tournament information
• WhatsApp group link will be shared via email
`}

Customer Support:
─────────────────────────────────────
Email: ${paymentData.customerSupport?.email || 'support@quickcourt.com'}
Phone: ${paymentData.customerSupport?.phone || '+91 1800-123-4567'}
Website: ${paymentData.customerSupport?.website || 'www.quickcourt.com'}

Terms & Conditions:
─────────────────────────────────────
• By completing this booking, you agree to our terms
• Cancellation charges may apply as per policy
• Management reserves the right to modify timings
• Please visit our website for complete terms

═══════════════════════════════════════
        Thank you for choosing
            QUICKCOURT!
═══════════════════════════════════════

Generated on: ${new Date().toLocaleString()}
Ref: QC-${paymentData.transactionId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}
    `.trim()

    // Create and download the file
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `QuickCourt_Receipt_${paymentData.transactionId}_${new Date().toISOString().split('T')[0]}.txt`
    
    // Append to body, click, and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the URL object
    window.URL.revokeObjectURL(url)
    
    // Show success message
    alert('Receipt downloaded successfully!')
  }

  // Download booking confirmation as JSON
  const downloadBookingData = () => {
    if (!paymentData) return

    const bookingData = {
      confirmation: {
        transactionId: paymentData.transactionId,
        bookingId: paymentData.bookingId,
        timestamp: paymentData.timestamp,
        status: 'CONFIRMED'
      },
      booking: paymentData.type === 'venue' ? {
        type: 'VENUE_BOOKING',
        venue: paymentData.venue,
        court: paymentData.court,
        date: paymentData.date,
        timeSlots: paymentData.timeSlots,
        duration: `${paymentData.timeSlots?.length || 1} hour(s)`,
        sport: 'Basketball'
      } : {
        type: 'TOURNAMENT_REGISTRATION',
        tournament: paymentData.tournament,
        sport: 'Basketball',
        category: '5v5',
        registrationDate: paymentData.date
      },
      payment: {
        amount: paymentData.amount,
        currency: 'INR',
        method: paymentData.paymentMethod,
        status: 'SUCCESSFUL',
        breakdown: paymentData.type === 'venue' ? {
          baseRate: Math.round(paymentData.amount * 0.8),
          tax: Math.round(paymentData.amount * 0.144),
          platformFee: Math.round(paymentData.amount * 0.056),
          total: paymentData.amount
        } : null
      },
      customerSupport: paymentData.customerSupport,
      generatedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(bookingData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `QuickCourt_BookingData_${paymentData.transactionId}_${new Date().toISOString().split('T')[0]}.json`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    alert('Booking data downloaded successfully!')
  }

  // Share receipt function
  const shareReceipt = async () => {
    if (!paymentData) return

    const isVenueBooking = paymentData.type === 'venue'
    const shareText = `🏆 ${isVenueBooking ? 'Venue Booked' : 'Tournament Registered'}! 

${isVenueBooking ? 
  `✅ Venue: ${paymentData.venue}
🏟️ Court: ${paymentData.court}
📅 Date: ${paymentData.date}
⏰ Time: ${paymentData.timeSlots?.join(', ') || '4:00 PM'}` : 
  `🏆 Tournament: ${paymentData.tournament || 'Mumbai Basketball Premier League'}
🏀 Sport: ${paymentData.sport || 'Basketball'}
👥 Type: ${paymentData.participantType === 'team' ? `Team - ${paymentData.teamName}` : `Individual - ${paymentData.playerName}`}
📅 Registered: ${paymentData.date}`
}
💰 Amount: ${formatInr(paymentData.amount)}
🆔 Receipt: ${paymentData.transactionId}

${isVenueBooking ? 'Book your sports venue at QuickCourt!' : 'Join tournaments at QuickCourt!'} 🎾🏀⚽`

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
                  <span>{paymentData.sport || 'Basketball'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span>{paymentData.category || '5v5'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration Date:</span>
                  <span>{paymentData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration Type:</span>
                  <span>{paymentData.participantType === 'team' ? 'Team Registration' : 'Individual Registration'}</span>
                </div>
                {paymentData.participantType === 'team' && paymentData.teamName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Team Name:</span>
                    <span className="font-medium">{paymentData.teamName}</span>
                  </div>
                )}
                {paymentData.participantType === 'individual' && paymentData.playerName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Player Name:</span>
                    <span className="font-medium">{paymentData.playerName}</span>
                  </div>
                )}
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
                    <p className="text-sm text-gray-600">Check your email for tournament schedule, rules, and WhatsApp group link</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Event Information</p>
                    <p className="text-sm text-gray-600">Tournament dates and match schedule will be communicated via email</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Venue Information</p>
                    <p className="text-sm text-gray-600">{paymentData.venue || 'Venue details will be shared via email'}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1" asChild>
              <Link href={isVenueBooking ? "/my-bookings" : "/my-tournaments"}>
                {isVenueBooking ? "View My Bookings" : "View My Tournaments"}
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" onClick={shareReceipt}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Confirmation
            </Button>
          </div>
          
          {/* Download Options */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Options
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="outline" className="w-full" onClick={downloadReceipt}>
                <Download className="h-4 w-4 mr-2" />
                Receipt (TXT)
              </Button>
              <Button variant="outline" className="w-full" onClick={downloadBookingData}>
                <Download className="h-4 w-4 mr-2" />
                Booking Data (JSON)
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  // Email receipt functionality
                  const subject = `QuickCourt ${isVenueBooking ? 'Booking' : 'Registration'} Confirmation - ${paymentData.transactionId}`
                  const body = `Hi,%0D%0A%0D%0APlease find my ${isVenueBooking ? 'booking' : 'registration'} confirmation details:%0D%0A%0D%0ATransaction ID: ${paymentData.transactionId}%0D%0AAmount: ${formatInr(paymentData.amount)}%0D%0ADate: ${paymentData.date}%0D%0A%0D%0AThank you!`
                  window.open(`mailto:?subject=${subject}&body=${body}`)
                }}
              >
                📧 Email Receipt
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // Print functionality
                  const printWindow = window.open('', '_blank')
                  if (printWindow) {
                    printWindow.document.write(`
                      <html>
                        <head><title>QuickCourt Receipt</title></head>
                        <body style="font-family: monospace; padding: 20px;">
                          <pre>${paymentData.transactionId ? `
═══════════════════════════════════════
           QUICKCOURT RECEIPT
═══════════════════════════════════════

${isVenueBooking ? 'VENUE BOOKING CONFIRMATION' : 'TOURNAMENT REGISTRATION CONFIRMATION'}

Transaction ID: ${paymentData.transactionId}
Date & Time: ${paymentData.timestamp}
Amount: ${formatInr(paymentData.amount)}
Status: CONFIRMED

${isVenueBooking ? `
Venue: ${paymentData.venue}
Court: ${paymentData.court}
Date: ${paymentData.date}
Time: ${paymentData.timeSlots?.join(', ') || '4:00 PM'}
` : `
Tournament: ${paymentData.tournament || 'Mumbai Basketball Premier League'}
Registration Date: ${paymentData.date}
`}

Thank you for choosing QuickCourt!
═══════════════════════════════════════` : 'Loading...'}</pre>
                        </body>
                      </html>
                    `)
                    printWindow.document.close()
                    printWindow.print()
                  }
                }}
              >
                🖨️ Print Receipt
              </Button>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              💡 Save these files for your records and venue entry
            </div>
          </Card>
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

