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

const existingCourts = [
  {
    id: 1,
    name: "Basketball Court A",
    sport: "Basketball",
  pricing: 700,
    operatingHours: "6:00 AM - 11:00 PM",
    status: "Active",
  },
  {
    id: 2,
    name: "Tennis Court 1",
    sport: "Tennis",
  pricing: 850,
    operatingHours: "7:00 AM - 10:00 PM",
    status: "Active",
  },
  {
    id: 3,
    name: "Volleyball Court",
    sport: "Volleyball",
  pricing: 600,
    operatingHours: "8:00 AM - 9:00 PM",
    status: "Maintenance",
  },
]

const sportsOptions = ["Basketball", "Tennis", "Volleyball", "Badminton", "Football", "Table Tennis"]

export default function CourtManagementPage() {
  const [userData, setUserData] = useState<any>(null)
  const [courts, setCourts] = useState(existingCourts)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    pricing: "",
    startTime: "",
    endTime: "",
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
  }, [router])

  const handleAddCourt = () => {
    const newCourt = {
      id: courts.length + 1,
      name: formData.name,
      sport: formData.sport,
      pricing: Number.parseInt(formData.pricing),
      operatingHours: `${formData.startTime} - ${formData.endTime}`,
      status: "Active",
    }
    setCourts([...courts, newCourt])
    setFormData({ name: "", sport: "", pricing: "", startTime: "", endTime: "" })
    setIsAddModalOpen(false)
  }

  const handleEditCourt = (court: any) => {
    setEditingCourt(court)
    setFormData({
      name: court.name,
      sport: court.sport,
      pricing: court.pricing.toString(),
      startTime: court.operatingHours.split(" - ")[0],
      endTime: court.operatingHours.split(" - ")[1],
    })
  }

  const handleUpdateCourt = () => {
    setCourts(
      courts.map((court) =>
        court.id === editingCourt.id
          ? {
              ...court,
              name: formData.name,
              sport: formData.sport,
              pricing: Number.parseInt(formData.pricing),
              operatingHours: `${formData.startTime} - ${formData.endTime}`,
            }
          : court,
      ),
    )
    setEditingCourt(null)
    setFormData({ name: "", sport: "", pricing: "", startTime: "", endTime: "" })
  }

  const handleDeleteCourt = (courtId: number) => {
    setCourts(courts.filter((court) => court.id !== courtId))
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
                  value={formData.sport}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, sport: value }))}
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
                <Label htmlFor="pricing" className="text-gray-700">
                  Pricing per Hour (₹)
                </Label>
                <Input
                  id="pricing"
                  type="number"
                  value={formData.pricing}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pricing: e.target.value }))}
                  placeholder="Enter hourly rate"
                  className="border-gray-300"
                />
              </div>
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
              <div key={court.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{court.name}</h4>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline" className="border-gray-300 text-gray-700">
                      {court.sport}
                    </Badge>
                    <span className="text-sm text-gray-600">{formatInr(court.pricing)}/hour</span>
                    <span className="text-sm text-gray-600">{court.operatingHours}</span>
                    <Badge
                      variant={court.status === "Active" ? "default" : "secondary"}
                      className={court.status === "Active" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}
                    >
                      {court.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog open={editingCourt?.id === court.id} onOpenChange={(open) => !open && setEditingCourt(null)}>
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
                            value={formData.sport}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, sport: value }))}
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
                            value={formData.pricing}
                            onChange={(e) => setFormData((prev) => ({ ...prev, pricing: e.target.value }))}
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
                    onClick={() => handleDeleteCourt(court.id)}
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
