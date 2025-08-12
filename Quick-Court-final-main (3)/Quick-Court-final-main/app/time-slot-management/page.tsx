"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Clock, Wrench } from "lucide-react"
import { TimeRangeSlider } from "@/components/ui/enhanced-slider"

const courts = [
  { id: 1, name: "Basketball Court A", sport: "Basketball" },
  { id: 2, name: "Tennis Court 1", sport: "Tennis" },
  { id: 3, name: "Volleyball Court", sport: "Volleyball" },
]

const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
]

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function TimeSlotManagementPage() {
  const [userData, setUserData] = useState<any>(null)
  const [selectedCourt, setSelectedCourt] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [operatingHours, setOperatingHours] = useState([9, 22]) // 9 AM to 10 PM
  const [availability, setAvailability] = useState<{ [key: string]: "available" | "booked" | "maintenance" }>({})
  const router = useRouter()

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

    // Initialize with some sample data
    const sampleAvailability: { [key: string]: "available" | "booked" | "maintenance" } = {}
    timeSlots.forEach((time) => {
      daysOfWeek.forEach((day) => {
        const key = `${day}-${time}`
        // Randomly assign status for demo
        const rand = Math.random()
        if (rand < 0.7) sampleAvailability[key] = "available"
        else if (rand < 0.9) sampleAvailability[key] = "booked"
        else sampleAvailability[key] = "maintenance"
      })
    })
    setAvailability(sampleAvailability)
  }, [router])

  const toggleSlotStatus = (day: string, time: string) => {
    const key = `${day}-${time}`
    const currentStatus = availability[key] || "available"
    let newStatus: "available" | "booked" | "maintenance"

    if (currentStatus === "available") newStatus = "maintenance"
    else if (currentStatus === "maintenance") newStatus = "available"
    else return // Can't change booked slots

    setAvailability((prev) => ({ ...prev, [key]: newStatus }))
  }

  const getSlotColor = (status: "available" | "booked" | "maintenance") => {
    switch (status) {
      case "available":
        return "bg-gray-100 hover:bg-gray-200 border-gray-300"
      case "booked":
        return "bg-gray-900 text-white cursor-not-allowed"
      case "maintenance":
        return "bg-red-100 hover:bg-red-200 border-red-300 text-red-700"
      default:
        return "bg-gray-100 hover:bg-gray-200 border-gray-300"
    }
  }

  const getStatusIcon = (status: "available" | "booked" | "maintenance") => {
    if (status === "maintenance") return <Wrench className="h-3 w-3" />
    if (status === "booked") return <Clock className="h-3 w-3" />
    return null
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
        <h1 className="text-3xl font-bold text-gray-900">Time Slot Management</h1>
        <p className="text-gray-600 mt-2">Set court availability and block time slots for maintenance</p>
      </div>

      {/* Court Selection */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Select Court</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourt} onValueChange={setSelectedCourt}>
            <SelectTrigger className="w-full md:w-64 border-gray-300">
              <SelectValue placeholder="Choose a court" />
            </SelectTrigger>
            <SelectContent>
              {courts.map((court) => (
                <SelectItem key={court.id} value={court.id.toString()}>
                  {court.name} ({court.sport})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Set Operating Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Configure the daily operating hours for your facility
            </p>
            <TimeRangeSlider 
              value={operatingHours} 
              onValueChange={setOperatingHours} 
              min={6} 
              max={23}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>These hours will apply to the time slots shown below</span>
              <Button variant="outline" size="sm" className="h-8">
                Apply to All Courts
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCourt && (
        <>
          {/* Legend */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                  <span className="text-sm text-gray-700">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-900 rounded"></div>
                  <span className="text-sm text-gray-700">Booked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                  <span className="text-sm text-gray-700">Maintenance</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Schedule Grid */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header */}
                  <div className="grid grid-cols-8 gap-2 mb-4">
                    <div className="font-semibold text-gray-900 text-center">Time</div>
                    {daysOfWeek.map((day) => (
                      <div key={day} className="font-semibold text-gray-900 text-center">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  {timeSlots.map((time) => (
                    <div key={time} className="grid grid-cols-8 gap-2 mb-2">
                      <div className="text-sm text-gray-600 text-center py-2">{time}</div>
                      {daysOfWeek.map((day) => {
                        const key = `${day}-${time}`
                        const status = availability[key] || "available"
                        return (
                          <Button
                            key={key}
                            variant="outline"
                            size="sm"
                            className={`h-10 text-xs ${getSlotColor(status)}`}
                            onClick={() => toggleSlotStatus(day, time)}
                            disabled={status === "booked"}
                          >
                            <div className="flex items-center justify-center space-x-1">
                              {getStatusIcon(status)}
                              <span className="capitalize">{status === "available" ? "Free" : status}</span>
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Calendar View</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border border-gray-200"
                />
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                  Block All Slots for Maintenance
                </Button>
                <Button variant="outline" className="w-full border-gray-300 text-gray-700 bg-transparent">
                  Set Recurring Availability
                </Button>
                <Button variant="outline" className="w-full border-gray-300 text-gray-700 bg-transparent">
                  Copy Schedule to Next Week
                </Button>
                <Button variant="outline" className="w-full border-gray-300 text-gray-700 bg-transparent">
                  Export Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
