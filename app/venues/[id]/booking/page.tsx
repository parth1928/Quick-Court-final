"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { formatInr } from "@/lib/format"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Clock, MapPin, CreditCard, Loader2, AlertCircle } from "lucide-react"
import PaySimulator from "@/components/pay-simulator"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Court {
  _id: string
  name: string
  sportType: string
  pricing: {
    hourlyRate: number
    currency: string
  }
  pricePerHour: number
  isActive: boolean
  availability: {
    [key: string]: { open: string; close: string }
  }
}

interface Venue {
  _id: string
  name: string
  description: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  location: string
}

interface Booking {
  court: string
  user: string
  venue: string
  startTime: string
  endTime: string
  totalPrice: number
  pricingBreakdown: {
    baseRate: number
    tax: number
    currency: string
  }
  paymentStatus: string
  paymentId: string
  status: string
  notes: string
}

export default function BookingPage() {
  const params = useParams()
  const venueId = params.id as string

  // State
  const [venue, setVenue] = useState<Venue | null>(null)
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string>("")
  
  const [selectedCourt, setSelectedCourt] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set())

  // Set default date on client side to prevent hydration issues
  useEffect(() => {
    setSelectedDate(new Date())
  }, [])

  // Load venue and courts data
  useEffect(() => {
    if (venueId) {
      loadVenueData()
    }
  }, [venueId])

  // Load booked slots when court/date changes
  useEffect(() => {
    if (selectedCourt && selectedDate) {
      loadBookedSlots()
    }
  }, [selectedCourt, selectedDate])

  const loadVenueData = async () => {
    try {
      setLoading(true)
      setError("")

      // Load venue details
      const venueResponse = await fetch(`/api/venues/${venueId}`)
      if (!venueResponse.ok) {
        console.error('Venue API failed:', venueResponse.status, venueResponse.statusText)
        // Use fallback venue data
        const fallbackVenue = {
          _id: venueId,
          name: "Elite Sports Complex",
          description: "Premium sports facility with multiple courts",
          address: {
            street: "123 Sports Avenue",
            city: "Mumbai",
            state: "Maharashtra",
            zipCode: "400001"
          },
          location: "123 Sports Avenue, Andheri, Mumbai"
        }
        console.log('🏢 Using fallback venue:', fallbackVenue)
        setVenue(fallbackVenue)
      } else {
        const venueData = await venueResponse.json()
        console.log('🏢 Venue data received:', venueData)
        setVenue(venueData.venue || venueData)
      }

      // Load courts for this venue
      const courtsResponse = await fetch(`/api/venues/${venueId}/courts`)
      if (!courtsResponse.ok) {
        console.error('Courts API failed:', courtsResponse.status, courtsResponse.statusText)
        // Use fallback sample courts if API fails
        const fallbackCourts = [
          {
            _id: "507f1f77bcf86cd799439021",
            name: "Basketball Court A",
            sportType: "Basketball",
            pricing: { hourlyRate: 700, currency: "INR" },
            pricePerHour: 700,
            isActive: true,
            availability: {
              monday: { open: "09:00", close: "22:00" },
              tuesday: { open: "09:00", close: "22:00" },
              wednesday: { open: "09:00", close: "22:00" },
              thursday: { open: "09:00", close: "22:00" },
              friday: { open: "09:00", close: "22:00" },
              saturday: { open: "09:00", close: "22:00" },
              sunday: { open: "09:00", close: "22:00" }
            }
          },
          {
            _id: "507f1f77bcf86cd799439022",
            name: "Tennis Court 1",
            sportType: "Tennis",
            pricing: { hourlyRate: 850, currency: "INR" },
            pricePerHour: 850,
            isActive: true,
            availability: {
              monday: { open: "09:00", close: "22:00" },
              tuesday: { open: "09:00", close: "22:00" },
              wednesday: { open: "09:00", close: "22:00" },
              thursday: { open: "09:00", close: "22:00" },
              friday: { open: "09:00", close: "22:00" },
              saturday: { open: "09:00", close: "22:00" },
              sunday: { open: "09:00", close: "22:00" }
            }
          },
          {
            _id: "507f1f77bcf86cd799439023",
            name: "Volleyball Court",
            sportType: "Volleyball",
            pricing: { hourlyRate: 600, currency: "INR" },
            pricePerHour: 600,
            isActive: true,
            availability: {
              monday: { open: "09:00", close: "22:00" },
              tuesday: { open: "09:00", close: "22:00" },
              wednesday: { open: "09:00", close: "22:00" },
              thursday: { open: "09:00", close: "22:00" },
              friday: { open: "09:00", close: "22:00" },
              saturday: { open: "09:00", close: "22:00" },
              sunday: { open: "09:00", close: "22:00" }
            }
          }
        ]
        console.log('🏟️ Using fallback courts:', fallbackCourts)
        setCourts(fallbackCourts)
        return
      }
      const courtsData = await courtsResponse.json()
      console.log('🏟️ Courts data received:', courtsData)
      
      // If no courts returned, use fallback
      if (!courtsData.courts || courtsData.courts.length === 0) {
        const fallbackCourts = [
          {
            _id: "507f1f77bcf86cd799439021",
            name: "Basketball Court A",
            sportType: "Basketball",
            pricing: { hourlyRate: 700, currency: "INR" },
            pricePerHour: 700,
            isActive: true,
            availability: {
              monday: { open: "09:00", close: "22:00" },
              tuesday: { open: "09:00", close: "22:00" },
              wednesday: { open: "09:00", close: "22:00" },
              thursday: { open: "09:00", close: "22:00" },
              friday: { open: "09:00", close: "22:00" },
              saturday: { open: "09:00", close: "22:00" },
              sunday: { open: "09:00", close: "22:00" }
            }
          },
          {
            _id: "507f1f77bcf86cd799439022",
            name: "Tennis Court 1",
            sportType: "Tennis",
            pricing: { hourlyRate: 850, currency: "INR" },
            pricePerHour: 850,
            isActive: true,
            availability: {
              monday: { open: "09:00", close: "22:00" },
              tuesday: { open: "09:00", close: "22:00" },
              wednesday: { open: "09:00", close: "22:00" },
              thursday: { open: "09:00", close: "22:00" },
              friday: { open: "09:00", close: "22:00" },
              saturday: { open: "09:00", close: "22:00" },
              sunday: { open: "09:00", close: "22:00" }
            }
          }
        ]
        console.log('🏟️ No courts found, using fallback courts:', fallbackCourts)
        setCourts(fallbackCourts)
      } else {
        setCourts(courtsData.courts)
      }

    } catch (error: any) {
      console.error('Failed to load venue data:', error)
      setError(error.message || 'Failed to load venue data')
    } finally {
      setLoading(false)
    }
  }

  const loadBookedSlots = async () => {
    try {
      if (!selectedDate || !selectedCourt) return

      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch(`/api/bookings?court=${selectedCourt}&date=${dateStr}`)
      
      if (response.ok) {
        const data = await response.json()
        const booked = new Set<string>()
        
        data.bookings?.forEach((booking: any) => {
          if (booking.status !== 'cancelled') {
            const start = new Date(booking.startTime)
            const end = new Date(booking.endTime)
            
            // Generate hourly slots between start and end
            for (let hour = start.getHours(); hour < end.getHours(); hour++) {
              const timeSlot = formatHour(hour)
              booked.add(timeSlot)
            }
          }
        })
        
        setBookedSlots(booked)
      }
    } catch (error) {
      console.error('Failed to load booked slots:', error)
    }
  }

  const formatHour = (hour: number): string => {
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour.toString().padStart(2, '0')}:00 ${ampm}`
  }

  // Generate time slots based on court availability
  const generateTimeSlots = () => {
    const slots: string[] = []
    const selectedCourtData = courts.find(c => c._id === selectedCourt)
    
    if (!selectedCourtData || !selectedDate) return slots

    // Get day of week for availability check
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const availability = selectedCourtData.availability[dayName]
    
    if (!availability) return slots

    // Parse opening and closing hours
    const [openHour] = availability.open.split(':').map(Number)
    const [closeHour] = availability.close.split(':').map(Number)

    // Generate hourly slots
    for (let hour = openHour; hour < closeHour; hour++) {
      slots.push(formatHour(hour))
    }

    return slots
  }

  const selectedCourtData = courts.find((court) => court._id === selectedCourt)
  const totalHours = selectedTimeSlots.length
  const hourlyRate = selectedCourtData?.pricing?.hourlyRate || selectedCourtData?.pricePerHour || 0
  const subtotal = hourlyRate * totalHours
  const taxRate = 0.18 // 18% GST
  const tax = subtotal * taxRate
  const total = subtotal + tax

  const toggleTimeSlot = (timeSlot: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(timeSlot) ? prev.filter((slot) => slot !== timeSlot) : [...prev, timeSlot].sort(),
    )
  }

  const isTimeSlotAvailable = (timeSlot: string) => {
    // Check if slot is already booked
    if (bookedSlots.has(timeSlot)) return false
    
    // Check if it's in the past (today only)
    if (selectedDate) {
      const today = new Date()
      const isToday = selectedDate.toDateString() === today.toDateString()
      
      if (isToday) {
        const [time, ampm] = timeSlot.split(' ')
        const [hour] = time.split(':').map(Number)
        const slotHour = ampm === 'PM' && hour !== 12 ? hour + 12 : (ampm === 'AM' && hour === 12 ? 0 : hour)
        const currentHour = today.getHours()
        
        return slotHour > currentHour
      }
    }
    
    return true
  }

  const createBooking = async (paymentData: any) => {
    try {
      setSubmitLoading(true)

      if (!selectedCourtData || !selectedDate || selectedTimeSlots.length === 0) {
        throw new Error('Please complete all booking details')
      }

      // Calculate start and end times
      const sortedSlots = [...selectedTimeSlots].sort()
      const firstSlot = sortedSlots[0]
      const lastSlot = sortedSlots[sortedSlots.length - 1]

      // Parse first slot time
      const [firstTime, firstAmpm] = firstSlot.split(' ')
      const [firstHour] = firstTime.split(':').map(Number)
      const startHour = firstAmpm === 'PM' && firstHour !== 12 ? firstHour + 12 : (firstAmpm === 'AM' && firstHour === 12 ? 0 : firstHour)

      // Parse last slot time and add 1 hour for end time
      const [lastTime, lastAmpm] = lastSlot.split(' ')
      const [lastHour] = lastTime.split(':').map(Number)
      const endHour = (lastAmpm === 'PM' && lastHour !== 12 ? lastHour + 12 : (lastAmpm === 'AM' && lastHour === 12 ? 0 : lastHour)) + 1

      const startTime = new Date(selectedDate)
      startTime.setHours(startHour, 0, 0, 0)

      const endTime = new Date(selectedDate)
      endTime.setHours(endHour, 0, 0, 0)

      const bookingData: Booking = {
        court: selectedCourt,
        venue: venueId,
        user: '', // Will be set by the API
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalPrice: total,
        pricingBreakdown: {
          baseRate: subtotal,
          tax: tax,
          currency: 'INR'
        },
        paymentStatus: 'paid',
        paymentId: paymentData.id,
        status: 'confirmed',
        notes: `Booking for ${totalHours} hour${totalHours !== 1 ? 's' : ''} at ${selectedCourtData.name}`
      }

      console.log('🚀 Creating booking:', bookingData)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      })

      console.log('📡 API Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || 'Failed to create booking' }
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const booking = await response.json()
      console.log('✅ Booking created:', booking)

      return booking

    } catch (error: any) {
      console.error('❌ Booking creation failed:', error)
      throw error
    } finally {
      setSubmitLoading(false)
    }
  }

  const timeSlots = generateTimeSlots()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading venue details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/venues" className="hover:text-blue-600">
            Venues
          </Link>
          <span>/</span>
          <Link href={`/venues/${venueId}`} className="hover:text-blue-600">
            {venue?.name || 'Venue'}
          </Link>
          <span>/</span>
          <span className="text-gray-900">Booking</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Court</h1>
              <p className="text-gray-600">Select your preferred court, date, and time slots</p>
            </div>

            {/* Court Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Select Court
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No courts available for this venue</p>
                  </div>
                ) : (
                  <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a court" />
                    </SelectTrigger>
                    <SelectContent>
                      {courts.map((court) => (
                        <SelectItem key={court._id} value={court._id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{court.name}</span>
                            <div className="flex items-center space-x-2 ml-4">
                              <Badge variant="secondary">{court.sportType}</Badge>
                              <span className="font-semibold">
                                {formatInr(court.pricing?.hourlyRate || court.pricePerHour || 0)}/hr
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Time Slot Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Select Time Slots
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate && selectedCourt ? (
                  <div>
                    {timeSlots.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No time slots available for this court</p>
                    ) : (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {timeSlots.map((timeSlot) => {
                          const isAvailable = isTimeSlotAvailable(timeSlot)
                          const isSelected = selectedTimeSlots.includes(timeSlot)
                          const isBooked = bookedSlots.has(timeSlot)

                          return (
                            <Button
                              key={timeSlot}
                              variant={isSelected ? "default" : "outline"}
                              className={`h-12 ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                              onClick={() => isAvailable && toggleTimeSlot(timeSlot)}
                              disabled={!isAvailable}
                              title={isBooked ? "Already booked" : isAvailable ? "Available" : "Not available"}
                            >
                              {timeSlot}
                            </Button>
                          )
                        })}
                      </div>
                    )}
                    
                    {selectedTimeSlots.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">Selected Times:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedTimeSlots.sort().map((slot) => (
                            <Badge key={slot} variant="outline" className="text-xs bg-blue-100 text-blue-800">
                              {slot}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Please select a court and date first</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {venue && (
                  <>
                    <div>
                      <h4 className="font-semibold">{venue.name}</h4>
                      <p className="text-sm text-gray-600">
                        {venue.address ? 
                          `${venue.address.street}, ${venue.address.city}` : 
                          venue.location || 'Location not specified'
                        }
                      </p>
                    </div>

                    <Separator />
                  </>
                )}

                {selectedCourtData && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2">Court Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Court:</span>
                          <span>{selectedCourtData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sport:</span>
                          <Badge variant="secondary">{selectedCourtData.sportType}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Rate:</span>
                          <span>{formatInr(hourlyRate)}/hour</span>
                        </div>
                      </div>
                    </div>

                    {selectedDate && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-2">Date & Time</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Date:</span>
                              <span>{selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Duration:</span>
                              <span>
                                {totalHours} hour{totalHours !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {totalHours > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal ({totalHours} hours):</span>
                            <span>{formatInr(subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Tax (18% GST):</span>
                            <span>{formatInr(tax)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>{formatInr(total)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Payment Integration */}
                {!selectedCourt || !selectedDate || selectedTimeSlots.length === 0 ? (
                  <Button
                    className="w-full"
                    size="lg"
                    disabled
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Complete Booking Details
                  </Button>
                ) : (
                  <PaySimulator
                    amount={total}
                    descriptor={`Court Booking - ${selectedCourtData?.name} on ${selectedDate?.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`}
                    buttonLabel={`Pay ${formatInr(total)} & Book Now`}
                    disabled={submitLoading}
                    onSuccess={async (paymentData) => {
                      console.log("🎉 Payment successful:", paymentData)
                      
                      try {
                        // Create booking in database
                        const booking = await createBooking(paymentData)
                        
                        // Create booking data for confirmation page
                        const bookingData = {
                          bookingId: booking._id || `BK${Date.now()}`,
                          confirmationCode: `QC${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                          transactionId: paymentData.id,
                          venueName: venue?.name || "Unknown Venue",
                          venueLocation: venue?.address ? 
                            `${venue.address.street}, ${venue.address.city}` : 
                            venue?.location || 'Location not specified',
                          courtName: selectedCourtData?.name,
                          sport: selectedCourtData?.sportType,
                          date: selectedDate?.toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }),
                          time: selectedTimeSlots.length > 0 ? 
                            `${selectedTimeSlots[0]} - ${selectedTimeSlots[selectedTimeSlots.length - 1]}` : 
                            selectedTimeSlots[0],
                          timeSlots: selectedTimeSlots,
                          duration: totalHours * 60, // in minutes
                          totalPrice: total,
                          subtotal: subtotal,
                          tax: tax,
                          paymentMethod: "Online Payment",
                          paymentStatus: "SUCCESSFUL",
                          status: "CONFIRMED",
                          bookedAt: new Date().toISOString(),
                          notes: `Booking for ${totalHours} hour${totalHours !== 1 ? 's' : ''} at ${selectedCourtData?.name}`
                        }
                        
                        // Store booking data in localStorage for confirmation page
                        localStorage.setItem('recentBooking', JSON.stringify(bookingData))
                        
                        toast({
                          title: "🎉 Booking Confirmed!",
                          description: `Your booking for ${selectedCourtData?.name} has been confirmed successfully!`,
                        })
                        
                        // Redirect to booking confirmation page
                        setTimeout(() => {
                          window.location.href = `/booking-confirmation?bookingId=${bookingData.bookingId}&transactionId=${paymentData.id}&confirmed=true`
                        }, 1500)
                        
                      } catch (error: any) {
                        console.error('❌ Booking creation failed:', error)
                        toast({
                          title: "Booking Failed",
                          description: error.message || "Failed to create booking. Please contact support.",
                          variant: "destructive",
                        })
                      }
                    }}
                    onFailure={() => {
                      toast({
                        title: "Payment Failed",
                        description: "Please try again or use a different payment method",
                        variant: "destructive",
                      })
                    }}
                  />
                )}

                <div className="text-center text-xs text-gray-500">
                  <p>Free cancellation up to 24 hours before your booking</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
