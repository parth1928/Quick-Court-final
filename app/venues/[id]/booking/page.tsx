"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Clock, MapPin, CreditCard } from "lucide-react"

const courts = [
  { id: 1, name: "Basketball Court A", sport: "Basketball", price: 25 },
  { id: 2, name: "Basketball Court B", sport: "Basketball", price: 25 },
  { id: 3, name: "Tennis Court 1", sport: "Tennis", price: 30 },
  { id: 4, name: "Tennis Court 2", sport: "Tennis", price: 30 },
  { id: 5, name: "Volleyball Court", sport: "Volleyball", price: 20 },
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([])

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
    if (!selectedDate || !selectedCourt) return false
    
    // Simulate some unavailable slots based on date and court
    const unavailableSlots = ["11:00 AM", "02:00 PM", "06:00 PM"]
    
    // Add dynamic unavailability based on day of week
    const dayOfWeek = selectedDate.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      // Some courts might be busier on weekends
      if (selectedCourt === "1" || selectedCourt === "2") {
        unavailableSlots.push("10:00 AM", "03:00 PM", "07:00 PM")
      }
    }
    
    return !unavailableSlots.includes(timeSlot)
  }

  const isConsecutiveSlot = (timeSlot: string) => {
    const currentIndex = timeSlots.indexOf(timeSlot)
    if (currentIndex === -1) return false
    
    return selectedTimeSlots.some((selectedSlot) => {
      const selectedIndex = timeSlots.indexOf(selectedSlot)
      return Math.abs(selectedIndex - currentIndex) === 1
    })
  }

  const handleTimeSlotClick = (timeSlot: string) => {
    if (!isTimeSlotAvailable(timeSlot)) return
    
    toggleTimeSlot(timeSlot)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Court</h1>
          <p className="text-gray-600">Select your preferred court, date, and time slots</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Court Selection, Date & Time */}
          <div className="lg:col-span-2 space-y-6">
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
                            <span className="font-semibold">${court.price}/hr</span>
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
                  <>
                    <div className="mb-4 text-sm text-gray-600">
                      <p>📅 Selected: {selectedDate.toLocaleDateString()}</p>
                      <p>🏢 Court: {selectedCourtData?.name}</p>
                      {selectedTimeSlots.length > 0 && (
                        <p className="text-green-600 font-medium">
                          ⏰ {selectedTimeSlots.length} slot{selectedTimeSlots.length !== 1 ? 's' : ''} selected
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {timeSlots.map((timeSlot) => {
                        const isAvailable = isTimeSlotAvailable(timeSlot)
                        const isSelected = selectedTimeSlots.includes(timeSlot)
                        const isConsecutive = isConsecutiveSlot(timeSlot)

                        return (
                          <Button
                            key={timeSlot}
                            variant={isSelected ? "default" : "outline"}
                            className={`h-12 text-sm font-medium transition-all duration-200 ${
                              !isAvailable 
                                ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400" 
                                : isSelected 
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                                : isConsecutive
                                ? "border-blue-300 bg-blue-50 hover:bg-blue-100"
                                : "hover:border-blue-400 hover:bg-blue-50"
                            }`}
                            onClick={() => handleTimeSlotClick(timeSlot)}
                            disabled={!isAvailable}
                          >
                            <div className="flex flex-col items-center">
                              <span>{timeSlot}</span>
                              {!isAvailable && (
                                <span className="text-xs text-red-500">Booked</span>
                              )}
                              {isSelected && (
                                <span className="text-xs">✓ Selected</span>
                              )}
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                    {selectedTimeSlots.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Selected Time Slots:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTimeSlots.sort().map((slot) => (
                            <span key={slot} className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                              {slot}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-green-700 mt-2">
                          Total Duration: {selectedTimeSlots.length} hour{selectedTimeSlots.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Please select a court and date first</p>
                    <p className="text-sm text-gray-400 mt-1">Then choose your preferred time slots</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Summary */}
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
                      <p className="text-sm text-gray-600">123 Sports Avenue, Downtown NYC</p>
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
                          <span>${selectedCourtData.price}/hour</span>
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
                            <span>${subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Tax (8%):</span>
                            <span>${tax.toFixed(2)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!selectedCourt || !selectedDate || selectedTimeSlots.length === 0}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {selectedTimeSlots.length === 0 
                    ? "Select Time Slots" 
                    : `Proceed to Payment (${selectedTimeSlots.length} slot${selectedTimeSlots.length !== 1 ? 's' : ''})`
                  }
                </Button>

                <div className="text-center text-xs text-gray-500 space-y-1">
                  <p>Free cancellation up to 24 hours before your booking</p>
                  {selectedTimeSlots.length > 0 && (
                    <p className="text-green-600">
                      💡 Tip: Book consecutive slots for better rates!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
