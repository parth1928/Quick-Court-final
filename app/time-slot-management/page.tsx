"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Clock, Wrench, Plus, CalendarX, AlertCircle, Calendar as CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface TimeSlot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'blocked' | 'maintenance';
  price: number;
  blockReason?: string;
}

interface Court {
  _id: string;
  name: string;
  sportType: string;
  venue: {
    _id: string;
    name: string;
  };
  pricing: {
    hourlyRate: number;
    currency: string;
    peakHourRate?: number;
    peakHours?: {
      start: string;
      end: string;
    };
  };
  operatingHours: {
    start: string;
    end: string;
  };
  availability?: {
    [key: string]: { open: string; close: string };
  };
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TimeSlotManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [userData, setUserData] = useState<any>(null)
  const [selectedCourt, setSelectedCourt] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [courts, setCourts] = useState<Court[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoadingCourts, setIsLoadingCourts] = useState(false)
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [maintenanceReason, setMaintenanceReason] = useState('')
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])

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
    fetchCourts(parsedUser.id)
  }, [router])

  const fetchCourts = async (userId: string) => {
    setIsLoadingCourts(true)
    try {
      const response = await fetch(`/api/courts?owner=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch courts')
      }
      const data = await response.json()
      setCourts(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoadingCourts(false)
    }
  }

  const fetchTimeSlots = async () => {
    if (!selectedCourt || !selectedDateRange.start || !selectedDateRange.end) {
      setTimeSlots([]);
      return;
    }
    
    setIsLoadingTimeSlots(true);
    setError('');
    
    try {
      const response = await fetch(
        `/api/courts/${selectedCourt}/slots?startDate=${selectedDateRange.start}&endDate=${selectedDateRange.end}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch time slots');
      }
      
      const data = await response.json();
      if (!Array.isArray(data.slots)) {
        throw new Error('Invalid response format');
      }
      
      setTimeSlots(data.slots);
    } catch (error: any) {
      setError(error.message);
      setTimeSlots([]);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  // Fetch time slots when court or date range changes
  useEffect(() => {
    fetchTimeSlots();
  }, [selectedCourt, selectedDateRange]);

  const generateTimeSlots = async () => {
    try {
      if (!selectedCourt || !selectedDateRange.start || !selectedDateRange.end) {
        toast({
          title: 'Error',
          description: 'Please select a court and date range first.',
          variant: 'destructive',
        });
        return;
      }

      setIsLoadingTimeSlots(true);

      const response = await fetch(`/api/courts/${selectedCourt}/slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: selectedDateRange.start,
          endDate: selectedDateRange.end,
          clearExisting: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate time slots');
      }
      
      const data = await response.json();
      await fetchTimeSlots(); // Refresh slots after generating

      toast({
        title: "Success",
        description: data.message || `Generated ${data.slots?.length || 0} time slots`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  const updateSlotStatus = async (slotIds: string[], status: 'available' | 'blocked' | 'maintenance', reason?: string) => {
    if (!selectedCourt || slotIds.length === 0) return;

    try {
      const response = await fetch(`/api/courts/${selectedCourt}/slots`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotIds,
          status,
          reason, // API expects reason parameter
        }),
      });

      if (!response.ok) throw new Error('Failed to update time slots');

      const data = await response.json();
      toast({
        title: "Success",
        description: `Updated ${data.modifiedCount} time slots`
      });

      // Refresh slots
      fetchTimeSlots();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getSlotColor = (status: string) => {
    switch (status) {
      case 'available':
        return "bg-gray-100 hover:bg-gray-200 border-gray-300";
      case 'booked':
        return "bg-gray-900 text-white cursor-not-allowed";
      case 'maintenance':
        return "bg-red-100 hover:bg-red-200 border-red-300 text-red-700";
      case 'blocked':
        return "bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-700";
      default:
        return "bg-gray-100 hover:bg-gray-200 border-gray-300";
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'maintenance':
        return <Wrench className="h-3 w-3" />;
      case 'booked':
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  }

  if (!userData || isLoadingCourts || isLoadingTimeSlots) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
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
                <SelectItem key={court._id} value={court._id}>
                  {court.name} ({court.sportType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

          {/* Date Range Selection */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Select Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-gray-700">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={selectedDateRange.start}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-gray-700">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={selectedDateRange.end}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="border-gray-300"
                min={selectedDateRange.start}
              />
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <p className="text-sm text-gray-600">
              Generate time slots for the selected date range
            </p>
            <Button 
              onClick={generateTimeSlots}
              className="bg-gray-900 hover:bg-gray-800 text-white"
              disabled={!selectedCourt || isLoadingTimeSlots}
            >
              {isLoadingTimeSlots ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </div>
              ) : (
                <>
                  Generate Slots
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>      {selectedCourt && (
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

          {/* Time Slots Display */}
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Time Slots</CardTitle>
                <div className="space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 bg-transparent"
                        disabled={selectedSlots.length === 0}
                      >
                        Set Maintenance
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Schedule Maintenance</DialogTitle>
                        <DialogDescription>
                          Block selected time slots for maintenance.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="reason">Maintenance Reason</Label>
                          <Input
                            id="reason"
                            value={maintenanceReason}
                            onChange={(e) => setMaintenanceReason(e.target.value)}
                            placeholder="Enter reason for maintenance"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setMaintenanceReason('');
                            setSelectedSlots([]);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            updateSlotStatus(selectedSlots, 'maintenance', maintenanceReason);
                            setMaintenanceReason('');
                            setSelectedSlots([]);
                          }}
                        >
                          Schedule
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 bg-transparent"
                    disabled={selectedSlots.length === 0}
                    onClick={() => {
                      updateSlotStatus(selectedSlots, 'available');
                      setSelectedSlots([]);
                    }}
                  >
                    Set Available
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingTimeSlots ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No time slots found for the selected date range.</p>
                  <p className="text-gray-500 text-sm mt-2">Click "Generate Slots" to create new slots.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(
                    timeSlots.reduce((acc: { [key: string]: TimeSlot[] }, slot) => {
                      if (!acc[slot.date]) acc[slot.date] = [];
                      acc[slot.date].push(slot);
                      return acc;
                    }, {})
                  )
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, slots]) => (
                      <div key={date} className="space-y-3">
                        <h3 className="font-semibold text-gray-900">
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {slots.map((slot) => (
                            <div
                              key={slot._id}
                              className={`p-3 rounded-lg border cursor-pointer ${
                                selectedSlots.includes(slot._id)
                                  ? 'ring-2 ring-gray-900 ring-offset-2'
                                  : ''
                              } ${getSlotColor(slot.status)}`}
                              onClick={() => {
                                if (slot.status === 'booked') return;
                                setSelectedSlots((prev) =>
                                  prev.includes(slot._id)
                                    ? prev.filter((id) => id !== slot._id)
                                    : [...prev, slot._id]
                                );
                              }}
                            >
                              <div className="text-sm font-medium text-gray-900">
                                {slot.startTime} - {slot.endTime}
                              </div>
                              <Badge
                                variant={
                                  slot.status === 'available'
                                    ? 'default'
                                    : slot.status === 'booked'
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className="mt-1"
                              >
                                {slot.status}
                              </Badge>
                              {slot.blockReason && (
                                <p className="text-xs text-gray-500 mt-1">{slot.blockReason}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                onClick={generateTimeSlots}
                disabled={isLoadingTimeSlots}
              >
                {isLoadingTimeSlots ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  <>
                    Generate New Time Slots
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 bg-transparent"
                onClick={() => {
                  const today = new Date();
                  const nextWeek = new Date(today);
                  nextWeek.setDate(today.getDate() + 7);
                  
                  setSelectedDateRange({
                    start: today.toISOString().split('T')[0],
                    end: nextWeek.toISOString().split('T')[0],
                  });
                }}
              >
                Generate Next Week
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 bg-transparent"
                onClick={() => {
                  setSelectedSlots([]);
                  fetchTimeSlots();
                }}
              >
                Refresh Slots
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
