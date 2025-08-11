"use client"

import React, { useState } from "react"
import { formatInr } from "@/lib/format"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Clock, MapPin, CreditCard } from "lucide-react"
import PaySimulator from "@/components/pay-simulator"
import { toast } from "@/components/ui/use-toast"

const courts = [
  { id: 1, name: "Basketball Court A", sport: "Basketball", price: 700 },
  { id: 2, name: "Basketball Court B", sport: "Basketball", price: 700 },
  { id: 3, name: "Tennis Court 1", sport: "Tennis", price: 850 },
  { id: 4, name: "Tennis Court 2", sport: "Tennis", price: 850 },
  { id: 5, name: "Volleyball Court", sport: "Volleyball", price: 600 },
]

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
]

export default function BookingPage() {
  const [selectedCourt, setSelectedCourt] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([])

  // Fix hydration error: only set date on client
  React.useEffect(() => {
    setSelectedDate(new Date())
  }, [])

  const selectedCourtData = courts.find((court) => court.id.toString() === selectedCourt)
  const totalHours = selectedTimeSlots.length
  const subtotal = selectedCourtData ? selectedCourtData.price * totalHours : 0
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const toggleTimeSlot = (timeSlot: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(timeSlot) ? prev.filter((slot) => slot !== timeSlot) : [...prev, timeSlot],
    )
  }

  const isTimeSlotAvailable = (timeSlot: string) => {
    // Simulate some unavailable slots
    const unavailableSlots = ["11:00 AM", "02:00 PM", "06:00 PM"]
    return !unavailableSlots.includes(timeSlot)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Removed duplicate Header to avoid double navbars */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/venues" className="hover:text-blue-600">
            Venues
          </Link>
          <span>/</span>
          <Link href="/venues/1" className="hover:text-blue-600">
            Elite Sports Complex
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
                <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a court" />
                  </SelectTrigger>
                  <SelectContent>
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={court.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{court.name}</span>
                          <div className="flex items-center space-x-2 ml-4">
                            <Badge variant="secondary">{court.sport}</Badge>
                            <span className="font-semibold">{formatInr(court.price)}/hr</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {timeSlots.map((timeSlot) => {
                      const isAvailable = isTimeSlotAvailable(timeSlot)
                      const isSelected = selectedTimeSlots.includes(timeSlot)

                      return (
                        <Button
                          key={timeSlot}
                          variant={isSelected ? "default" : "outline"}
                          className={`h-12 ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                          onClick={() => isAvailable && toggleTimeSlot(timeSlot)}
                          disabled={!isAvailable}
                        >
                          {timeSlot}
                        </Button>
                      )
                    })}
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
                {selectedCourtData && (
                  <>
                    <div>
                      <h4 className="font-semibold">Elite Sports Complex</h4>
                      <p className="text-sm text-gray-600">123 Sports Avenue, Andheri, Mumbai</p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">Court Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Court:</span>
                          <span>{selectedCourtData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sport:</span>
                          <Badge variant="secondary">{selectedCourtData.sport}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Rate:</span>
                          <span>{formatInr(selectedCourtData.price)}/hour</span>
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
                              <span>{selectedDate.toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Duration:</span>
                              <span>
                                {totalHours} hour{totalHours !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                          {selectedTimeSlots.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-1">Selected Times:</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedTimeSlots.sort().map((slot) => (
                                  <Badge key={slot} variant="outline" className="text-xs">
                                    {slot}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
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
                            <span>Tax (8%):</span>
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
                    descriptor={`Venue Booking - ${selectedCourtData?.name} on ${selectedDate?.toLocaleDateString()}`}
                    buttonLabel="Book & Pay Now"
                    onSuccess={(tx) => {
                      // Handle successful booking
                      console.log("Booking successful:", tx)
                      
                      // Store booking data (in real app, this would go to your API)
                      const bookingData = {
                        transactionId: tx.id,
                        venue: "Elite Sports Complex", // This should come from props or API
                        court: selectedCourtData?.name,
                        sport: selectedCourtData?.sport,
                        date: selectedDate?.toLocaleDateString(),
                        timeSlots: selectedTimeSlots,
                        amount: total,
                        status: "Confirmed"
                      }
                      
                      // Example API call (uncomment for real implementation):
                      // await fetch("/api/bookings", { 
                      //   method: "POST", 
                      //   body: JSON.stringify(bookingData) 
                      // })
                      
                      toast({
                        title: "Booking Confirmed!",
                        description: `Redirecting to confirmation page...`,
                      })
                      
                      // Redirect to payment completed page with booking details
                      const queryParams = new URLSearchParams({
                        txId: tx.id,
                        amount: total.toString(),
                        venue: "Elite Sports Complex",
                        court: selectedCourtData?.name || "",
                        date: selectedDate?.toLocaleDateString() || "",
                        timeSlots: selectedTimeSlots.join(',')
                      })
                      
                      setTimeout(() => {
                        window.location.href = `/payment-completed?${queryParams.toString()}`
                      }, 1000)
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
