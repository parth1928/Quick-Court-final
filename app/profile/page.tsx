"use client"

import { useState, useEffect } from "react"
import ImageUpload from "@/components/ImageUpload"
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

interface ProfileData {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  memberSince: string
  totalBookings: number
  bookingCount?: number
}

interface BookingData {
  id: string
  venueName: string
  venueLocation: string
  venueImages: string[]
  courtName: string
  sport: string
  surfaceType: string
  date: string
  time: string
  duration: number
  status: string
  price: number
  currency: string
  paymentStatus: string
  canCancel: boolean
  canReview: boolean
  rating: number | null
  reviewComment: string | null
  bookingDate: string
  checkInStatus: string
  checkOutStatus: string
  notes: string
  cancellationReason: string | null
  refundAmount: number
  startTime: string
  endTime: string
  createdAt: string
  updatedAt: string
}

interface BookingStats {
  total: number
  upcoming: number
  completed: number
  cancelled: number
  totalSpent: number
}

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("All")
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null)
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', avatar: '' })

  // Load profile and bookings
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/users/me', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load profile')
        setProfile(data)
  setEditForm({ name: data.name || '', email: data.email || '', phone: data.phone || '', avatar: data.avatar || '' })
      } catch (e:any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  // Load bookings separately
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setBookingsLoading(true)
        const token = localStorage.getItem('token')
        if (!token) return

        const res = await fetch('/api/users/me/bookings?limit=20', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        })
        
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || 'Failed to load bookings')
        
        if (result.success) {
          setBookings(result.data.bookings || [])
          setBookingStats(result.data.stats || null)
        }
      } catch (e:any) {
        console.error('Failed to load bookings:', e.message)
        // Don't show error for bookings, just keep empty array
        setBookings([])
      } finally {
        setBookingsLoading(false)
      }
    }
    loadBookings()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: editForm.name, phone: editForm.phone, avatar: editForm.avatar })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      setProfile(p => p ? { ...p, name: data.name, phone: data.phone } : p)
      setIsEditModalOpen(false)
    } catch (e:any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const filteredBookings = bookings.filter((booking) => 
    filterStatus === "All" || 
    (filterStatus === "Upcoming" && (booking.status === "confirmed" || booking.status === "pending")) ||
    (filterStatus === "Completed" && booking.status === "completed") ||
    (filterStatus === "Cancelled" && booking.status === "cancelled")
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "pending":
        return "default"
      case "completed":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "pending":
        return "Upcoming"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      default:
        return status
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
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
        // Update the booking in state
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled', canCancel: false }
            : booking
        ))
        alert('Booking cancelled successfully')
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  if (loading) return <div className="p-8">Loading profile...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>

  // If profile somehow missing (shouldn't normally), show create prompt
  if (!profile) {
    return (
      <div className="p-8 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={editForm.phone} onChange={e=>setEditForm(f=>({...f,phone:e.target.value}))} />
          </div>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Removed duplicate Header to avoid double navbars */}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                          <ImageUpload
                            value={editForm.avatar}
                            onChange={url => setEditForm(f => ({ ...f, avatar: url }))}
                            label="Profile Photo"
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
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-20 h-20 object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{profile.name}</h3>
                    <p className="text-gray-600">{profile.email}</p>
                    <p className="text-gray-600">{profile.phone}</p>
                    <p className="text-sm text-gray-500 mt-2">Member since {new Date(profile.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {bookingStats?.total || profile.totalBookings || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {bookingStats?.upcoming || 0}
                  </div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {bookingStats?.completed || 0}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    ₹{bookingStats?.totalSpent?.toLocaleString('en-IN') || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Spent</div>
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
              {bookingsLoading && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading bookings...</p>
                  </CardContent>
                </Card>
              )}
              
              {!bookingsLoading && filteredBookings.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600">No bookings found.</p>
                  </CardContent>
                </Card>
              )}
              
              {!bookingsLoading && filteredBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.venueName}</h3>
                        <p className="text-gray-600">
                          {booking.courtName} • {booking.sport}
                        </p>
                        {booking.venueLocation && (
                          <p className="text-sm text-gray-500">{booking.venueLocation}</p>
                        )}
                      </div>
                      <Badge variant={getStatusColor(booking.status)}>
                        {getStatusLabel(booking.status)}
                      </Badge>
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
                        <span className="font-semibold">₹{booking.price.toLocaleString('en-IN')}</span>
                        <span className="text-gray-500 ml-2">• {booking.duration} mins</span>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{booking.notes}</p>
                      </div>
                    )}

                    {booking.cancellationReason && (
                      <div className="mb-4 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600">
                          <strong>Cancelled:</strong> {booking.cancellationReason}
                        </p>
                        {booking.refundAmount > 0 && (
                          <p className="text-sm text-red-600 mt-1">
                            Refund: ₹{booking.refundAmount.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {booking.status === "completed" && booking.rating && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm">You rated: {booking.rating}/5</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Booked on {booking.bookingDate}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {booking.canCancel && (
                          <Button variant="destructive" size="sm" onClick={() => handleCancelBooking(booking.id)}>
                            Cancel
                          </Button>
                        )}
                        {booking.canReview && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // TODO: Open review modal
                              console.log('Open review modal for booking:', booking.id)
                            }}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Rate
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
