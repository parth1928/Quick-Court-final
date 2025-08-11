
"use client"
import { CampCard } from "@/components/ui/camp-card"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { User, Edit, Calendar, Clock, Star } from "lucide-react"

const userProfile = {
  name: "John Smith",
  email: "john.smith@email.com",
  phone: "+1 (555) 123-4567",
  joinDate: "March 2023",
  totalBookings: 24,
  favoriteVenues: 3,
  avatar: "/placeholder.svg?height=100&width=100&text=JS",
}

const bookings = [
  {
    id: 1,
    venueName: "Elite Sports Complex",
    courtName: "Basketball Court A",
    sport: "Basketball",
    date: "2024-01-25",
    time: "4:00 PM - 5:00 PM",
    status: "Upcoming",
    price: 25,
    canCancel: true,
  },
  {
    id: 2,
    venueName: "Premier Tennis Club",
    courtName: "Tennis Court 2",
    sport: "Tennis",
    date: "2024-01-20",
    time: "2:00 PM - 3:00 PM",
    status: "Completed",
    price: 40,
    canCancel: false,
    rating: 5,
  },
  {
    id: 3,
    venueName: "Community Recreation Center",
    courtName: "Volleyball Court",
    sport: "Volleyball",
    date: "2024-01-18",
    time: "6:00 PM - 7:00 PM",
    status: "Completed",
    price: 20,
    canCancel: false,
    rating: 4,
  },
  {
    id: 4,
    venueName: "Urban Basketball Arena",
    courtName: "Basketball Court 1",
    sport: "Basketball",
    date: "2024-01-15",
    time: "7:00 PM - 8:00 PM",
    status: "Cancelled",
    price: 20,
    canCancel: false,
  },
]

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("All")
  const [editForm, setEditForm] = useState({
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone,
  })

  const filteredBookings = bookings.filter((booking) => filterStatus === "All" || booking.status === filterStatus)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "default"
      case "Completed":
        return "secondary"
      case "Cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const handleCancelBooking = (bookingId: number) => {
    // Handle booking cancellation
    console.log("Cancelling booking:", bookingId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Removed duplicate Header to avoid double navbars */}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <CampCard />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account and view your booking history</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your profile information below.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setIsEditModalOpen(false)}>Save Changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{userProfile.name}</h3>
                    <p className="text-gray-600">{userProfile.email}</p>
                    <p className="text-gray-600">{userProfile.phone}</p>
                    <p className="text-sm text-gray-500 mt-2">Member since {userProfile.joinDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{userProfile.totalBookings}</div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{userProfile.favoriteVenues}</div>
                  <div className="text-sm text-gray-600">Favorite Venues</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">4.8</div>
                  <div className="text-sm text-gray-600">Avg Rating Given</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            {/* Booking Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {["All", "Upcoming", "Completed", "Cancelled"].map((status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bookings List */}
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.venueName}</h3>
                        <p className="text-gray-600">
                          {booking.courtName} • {booking.sport}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {booking.date}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {booking.time}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-semibold">${booking.price}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {booking.status === "Completed" && booking.rating && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm">You rated: {booking.rating}/5</span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        {booking.canCancel && (
                          <Button variant="destructive" size="sm" onClick={() => handleCancelBooking(booking.id)}>
                            Cancel
                          </Button>
                        )}
                        {booking.status === "Completed" && !booking.rating && (
                          <Button variant="outline" size="sm">
                            Rate Experience
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredBookings.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No bookings found for the selected filter.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
