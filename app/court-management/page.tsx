"use client"

import { useEffect, useState } from "react"
import { formatInr } from "@/lib/format"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Real data will be fetched from API

const sportsOptions = ["Basketball", "Tennis", "Volleyball", "Badminton", "Football", "Table Tennis"]

export default function CourtManagementPage() {
  const [userData, setUserData] = useState<any>(null)
  interface Court {
    _id: string;
    name: string;
    sportType: string;
    pricePerHour: number;
    operatingHours: {
      start: string;
      end: string;
    };
    status: 'active' | 'maintenance' | 'inactive';
    venue: {
      _id: string;
      name: string;
      shortLocation?: string;
    };
    pricing?: {
      hourlyRate?: number;
      timeSlotPricing?: { start: string; end: string; price: number }[];
    };
  }
  
  const [courts, setCourts] = useState<Court[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    sportType: "",
    pricePerHour: "",
    startTime: "",
    endTime: "",
    timeSlotPricing: [
      { start: '', end: '', price: '' }
    ]
  })
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

    // Fetch courts for this owner
    const fetchCourts = async () => {
      try {
        const response = await fetch(`/api/courts?ownerId=${parsedUser.userId}`)
        if (!response.ok) throw new Error('Failed to fetch courts')
        const data = await response.json()
        setCourts(data.courts || [])
      } catch (error) {
        console.error('Error fetching courts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourts()
  }, [router])

  const handleAddCourt = async () => {
    if (!userData?.selectedFacility?._id) {
      alert('Please select a facility first')
      return
    }

    try {
      const response = await fetch('/api/courts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          sportType: formData.sportType,
          pricing: {
            hourlyRate: Number(formData.pricePerHour),
            timeSlotPricing: formData.timeSlotPricing.filter(slot => slot.start && slot.end && slot.price)
          },
          operatingHours: {
            start: formData.startTime,
            end: formData.endTime,
          },
          venue: userData.selectedFacility._id,
          status: 'active',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create court')
      }

      const newCourt = await response.json()
      setCourts([...courts, newCourt])
      setFormData({ name: "", sportType: "", pricePerHour: "", startTime: "", endTime: "", timeSlotPricing: [{ start: '', end: '', price: '' }] })
      setIsAddModalOpen(false)
    } catch (error: any) {
      console.error('Error adding court:', error)
      alert(error.message)
    }
  }

  const handleEditCourt = (court: Court) => {
    setEditingCourt(court)
    setFormData({
      name: court.name,
      sportType: court.sportType,
      pricePerHour: court.pricePerHour.toString(),
      startTime: court.operatingHours.start,
      endTime: court.operatingHours.end,
      timeSlotPricing: (court.pricing && Array.isArray(court.pricing.timeSlotPricing))
        ? court.pricing.timeSlotPricing.map((slot: any) => ({
            start: slot.start || '',
            end: slot.end || '',
            price: slot.price?.toString() || ''
          }))
        : [{ start: '', end: '', price: '' }]
    })
  }

  const handleUpdateCourt = async () => {
    if (!editingCourt) return

    try {
      const response = await fetch(`/api/courts`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courtId: editingCourt._id,
          name: formData.name,
          sportType: formData.sportType,
          pricing: {
            hourlyRate: Number(formData.pricePerHour),
          },
          operatingHours: {
            start: formData.startTime,
            end: formData.endTime,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update court')
      }

      const updatedCourt = await response.json()
      setCourts(courts.map((c) => (c._id === editingCourt._id ? updatedCourt : c)))
      setEditingCourt(null)
  setFormData({ name: "", sportType: "", pricePerHour: "", startTime: "", endTime: "", timeSlotPricing: [{ start: '', end: '', price: '' }] })
    } catch (error: any) {
      console.error('Error updating court:', error)
      alert(error.message)
    }
  }

  const handleDeleteCourt = async (courtId: string) => {
    if (!confirm('Are you sure you want to delete this court?')) return

    try {
      const response = await fetch(`/api/courts?courtId=${courtId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete court')
      }

      setCourts(courts.filter((court) => court._id !== courtId))
    } catch (error: any) {
      console.error('Error deleting court:', error)
      alert(error.message)
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Court Management</h1>
          <p className="text-gray-600 mt-2">Manage individual courts within your facility</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add New Court
            </Button>
          </DialogTrigger>
          <DialogContent className="border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Add New Court</DialogTitle>
              <DialogDescription className="text-gray-600">Enter the details for the new court.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="courtName" className="text-gray-700">
                  Court Name
                </Label>
                <Input
                  id="courtName"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter court name"
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sportType" className="text-gray-700">
                  Sport Type
                </Label>
                <Select
                  value={formData.sportType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, sportType: value }))}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select sport type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportsOptions.map((sport) => (
                      <SelectItem key={sport} value={sport}>
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerHour" className="text-gray-700">
                  Pricing per Hour (₹)
                </Label>
                <Input
                  id="pricePerHour"
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pricePerHour: e.target.value }))}
                  placeholder="Enter hourly rate"
                  className="border-gray-300"
                />
              </div>
              {/* Time Slot Pricing */}
              <div className="space-y-2">
                <Label className="text-gray-700">Time Slot Pricing</Label>
                {formData.timeSlotPricing.map((slot, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      type="time"
                      value={slot.start}
                      onChange={e => {
                        const newSlots = [...formData.timeSlotPricing];
                        newSlots[idx].start = e.target.value;
                        setFormData(prev => ({ ...prev, timeSlotPricing: newSlots }));
                      }}
                      placeholder="Start"
                      className="border-gray-300 w-24"
                    />
                    <Input
                      type="time"
                      value={slot.end}
                      onChange={e => {
                        const newSlots = [...formData.timeSlotPricing];
                        newSlots[idx].end = e.target.value;
                        setFormData(prev => ({ ...prev, timeSlotPricing: newSlots }));
                      }}
                      placeholder="End"
                      className="border-gray-300 w-24"
                    />
                    <Input
                      type="number"
                      value={slot.price}
                      onChange={e => {
                        const newSlots = [...formData.timeSlotPricing];
                        newSlots[idx].price = e.target.value;
                        setFormData(prev => ({ ...prev, timeSlotPricing: newSlots }));
                      }}
                      placeholder="Price"
                      className="border-gray-300 w-24"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, timeSlotPricing: prev.timeSlotPricing.filter((_, i) => i !== idx) }))}
                      className="border-gray-300 text-red-600"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, timeSlotPricing: [...prev.timeSlotPricing, { start: '', end: '', price: '' }] }))}
                  className="border-gray-300"
                >
                  Add Time Slot
                </Button>
              </div>
              {/* Operating Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-gray-700">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-gray-700">
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="border-gray-300 text-gray-700 bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={handleAddCourt} className="bg-gray-900 hover:bg-gray-800 text-white">
                Add Court
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Courts */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Existing Courts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courts.map((court) => (
              <div key={court._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{court.name}</h4>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline" className="border-gray-300 text-gray-700">
                      {court.sportType}
                    </Badge>
                    <span className="text-sm text-gray-600">{formatInr(court.pricePerHour)}/hour</span>
                    <span className="text-sm text-gray-600">{court.operatingHours.start} - {court.operatingHours.end}</span>
                    <Badge
                      variant={court.status === "active" ? "default" : "secondary"}
                      className={court.status === "active" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}
                    >
                      {court.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog open={editingCourt?._id === court._id} onOpenChange={(open) => !open && setEditingCourt(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCourt(court)}
                        className="border-gray-300 text-gray-700 bg-transparent"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-gray-200">
                      <DialogHeader>
                        <DialogTitle className="text-gray-900">Edit Court</DialogTitle>
                        <DialogDescription className="text-gray-600">Update the court details.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="editCourtName" className="text-gray-700">
                            Court Name
                          </Label>
                          <Input
                            id="editCourtName"
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editSportType" className="text-gray-700">
                            Sport Type
                          </Label>
                          <Select
                            value={formData.sportType}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, sportType: value }))}
                          >
                            <SelectTrigger className="border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {sportsOptions.map((sport) => (
                                <SelectItem key={sport} value={sport}>
                                  {sport}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editPricing" className="text-gray-700">
                            Pricing per Hour (₹)
                          </Label>
                          <Input
                            id="editPricing"
                            type="number"
                            value={formData.pricePerHour}
                            onChange={(e) => setFormData((prev) => ({ ...prev, pricePerHour: e.target.value }))}
                            className="border-gray-300"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="editStartTime" className="text-gray-700">
                              Start Time
                            </Label>
                            <Input
                              id="editStartTime"
                              type="time"
                              value={formData.startTime}
                              onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                              className="border-gray-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="editEndTime" className="text-gray-700">
                              End Time
                            </Label>
                            <Input
                              id="editEndTime"
                              type="time"
                              value={formData.endTime}
                              onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                              className="border-gray-300"
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setEditingCourt(null)}
                          className="border-gray-300 text-gray-700 bg-transparent"
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateCourt} className="bg-gray-900 hover:bg-gray-800 text-white">
                          Update Court
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCourt(court._id)}
                    className="border-red-300 text-red-700 bg-transparent hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
