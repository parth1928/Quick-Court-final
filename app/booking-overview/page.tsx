"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, Search, Filter } from "lucide-react"

interface UserData {
  userType: string
  name: string
  email: string
}

const bookingsData = [
  {
    id: 1,
    userName: "John Smith",
    userEmail: "john.smith@email.com",
    court: "Basketball Court A",
    facility: "Elite Sports Complex",
    date: "2024-01-25",
    time: "4:00 PM - 5:00 PM",
    status: "Booked",
    amount: 25,
    bookingDate: "2024-01-20",
  },
  {
    id: 2,
    userName: "Sarah Johnson",
    userEmail: "sarah.johnson@email.com",
    court: "Tennis Court 1",
    facility: "Elite Sports Complex",
    date: "2024-01-24",
    time: "2:00 PM - 3:00 PM",
    status: "Completed",
    amount: 30,
    bookingDate: "2024-01-18",
  },
  {
    id: 3,
    userName: "Mike Wilson",
    userEmail: "mike.wilson@email.com",
    court: "Volleyball Court",
    facility: "Community Center",
    date: "2024-01-23",
    time: "6:00 PM - 7:00 PM",
    status: "Completed",
    amount: 20,
    bookingDate: "2024-01-19",
  },
  {
    id: 4,
    userName: "Emily Davis",
    userEmail: "emily.davis@email.com",
    court: "Tennis Court 2",
    facility: "Elite Sports Complex",
    date: "2024-01-22",
    time: "10:00 AM - 11:00 AM",
    status: "Cancelled",
    amount: 30,
    bookingDate: "2024-01-15",
  },
  {
    id: 5,
    userName: "David Brown",
    userEmail: "david.brown@email.com",
    court: "Basketball Court B",
    facility: "Elite Sports Complex",
    date: "2024-01-26",
    time: "7:00 PM - 8:00 PM",
    status: "Booked",
    amount: 25,
    bookingDate: "2024-01-21",
  },
]

export default function BookingOverviewPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [bookings] = useState(bookingsData)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [dateFilter, setDateFilter] = useState("All")
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(user)
    if (parsedUser.userType !== "facility-owner") {
      router.push("/login")
      return
    }

    setUserData(parsedUser)
  }, [router])

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.court.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.facility.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "All" || booking.status === statusFilter

    const matchesDate =
      dateFilter === "All" ||
      (dateFilter === "Today" && booking.date === "2024-01-25") ||
      (dateFilter === "This Week" && new Date(booking.date) >= new Date("2024-01-22")) ||
      (dateFilter === "This Month" && new Date(booking.date) >= new Date("2024-01-01"))

    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Booked":
        return "bg-gray-900 text-white"
      case "Completed":
        return "bg-gray-100 text-gray-700"
      case "Cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getTotalRevenue = () => {
    return filteredBookings
      .filter((booking) => booking.status === "Completed")
      .reduce((sum, booking) => sum + booking.amount, 0)
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
            <div className="text-2xl font-bold text-gray-900">{filteredBookings.length}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {filteredBookings.filter((b) => b.status === "Booked").length}
            </div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {filteredBookings.filter((b) => b.status === "Completed").length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">${getTotalRevenue()}</div>
            <div className="text-sm text-gray-600">Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
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
                <SelectItem value="Booked">Booked</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
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
          <CardTitle className="text-gray-900">Booking Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-700">User</TableHead>
                  <TableHead className="text-gray-700">Court</TableHead>
                  <TableHead className="text-gray-700">Date & Time</TableHead>
                  <TableHead className="text-gray-700">Status</TableHead>
                  <TableHead className="text-gray-700">Amount</TableHead>
                  <TableHead className="text-gray-700">Booked On</TableHead>
                  <TableHead className="text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{booking.userName}</div>
                        <div className="text-sm text-gray-600">{booking.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{booking.court}</div>
                        <div className="text-sm text-gray-600">{booking.facility}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{booking.date}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{booking.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">${booking.amount}</TableCell>
                    <TableCell className="text-sm text-gray-600">{booking.bookingDate}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 bg-transparent">
                          View
                        </Button>
                        {booking.status === "Booked" && (
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

          {filteredBookings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
