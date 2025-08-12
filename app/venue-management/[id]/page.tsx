"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Plus, CalendarClock, Settings2, Activity, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Court {
  _id: string;
  name: string;
  sportType: string;
  pricing: {
    hourlyRate: number;
    currency: string;
  };
  status: string;
}

interface Venue {
  _id: string;
  name: string;
  description: string;
  location: string;
  sports: string[];
  courts: Court[];
}

export default function VenueManagementPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newCourt, setNewCourt] = useState({
    name: "",
    sportType: "",
    hourlyRate: 0
  })
  const [showNewCourtDialog, setShowNewCourtDialog] = useState(false)
  
  useEffect(() => {
    fetchVenue()
  }, [params.id])

  const fetchVenue = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`/api/venues/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Failed to fetch venue")
      
      const data = await response.json()
      setVenue(data.venue)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load venue details",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addCourt = async () => {
    try {
      if (!venue) return

      const token = localStorage.getItem("token")
      const response = await fetch(`/api/venues/${venue._id}/courts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCourt)
      })

      if (!response.ok) throw new Error("Failed to add court")

      toast({
        title: "Success",
        description: "Court added successfully"
      })

      // Refresh venue data
      fetchVenue()
      setShowNewCourtDialog(false)
      setNewCourt({ name: "", sportType: "", hourlyRate: 0 })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add court",
        variant: "destructive"
      })
    }
  }

  const manageCourt = (courtId: string) => {
    router.push(`/time-slot-management?courtId=${courtId}`)
  }

  if (isLoading || !venue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading venue...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
          <p className="text-gray-600 mt-2">{venue.location}</p>
        </div>
      </div>

      <Tabs defaultValue="courts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courts">Courts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="courts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Courts</h2>
              <p className="text-gray-600 mt-1">Manage your courts and time slots</p>
            </div>
            <Dialog open={showNewCourtDialog} onOpenChange={setShowNewCourtDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Court
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Court</DialogTitle>
                  <DialogDescription>Add a new court to your venue.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Court Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Court 1"
                      value={newCourt.name}
                      onChange={e => setNewCourt(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sport">Sport Type</Label>
                    <Select 
                      onValueChange={value => setNewCourt(prev => ({ ...prev, sportType: value }))}
                      value={newCourt.sportType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {venue.sports.map(sport => (
                          <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate (₹)</Label>
                    <Input
                      id="rate"
                      type="number"
                      placeholder="e.g., 500"
                      value={newCourt.hourlyRate}
                      onChange={e => setNewCourt(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewCourtDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addCourt}>Add Court</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {venue.courts.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No courts yet</h3>
                <p className="text-sm text-gray-600 mb-4">Add your first court to start managing bookings</p>
                <Button onClick={() => setShowNewCourtDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Court
                </Button>
              </div>
            ) : (
              venue.courts.map(court => (
                <Card key={court._id} className="border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gray-900">{court.name}</CardTitle>
                      <Badge
                        variant="secondary"
                        className={
                          court.status === "active" ? "bg-green-100 text-green-800" :
                          court.status === "maintenance" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }
                      >
                        {court.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-gray-600">Sport Type</div>
                        <div className="text-gray-900">{court.sportType}</div>
                        <div className="text-gray-600">Hourly Rate</div>
                        <div className="text-gray-900">₹{court.pricing.hourlyRate}</div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 border-gray-300 text-gray-700"
                          onClick={() => manageCourt(court._id)}
                        >
                          <CalendarClock className="h-4 w-4 mr-2" />
                          Time Slots
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-300 text-gray-700"
                          size="icon"
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Venue Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Venue Name</Label>
                    <Input value={venue.name} disabled />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input value={venue.location} disabled />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={venue.description} disabled />
                </div>
                <div>
                  <Label>Sports</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {venue.sports.map(sport => (
                      <Badge key={sport} variant="outline">
                        {sport}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
