"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Users, MapPin, Calendar as CalendarIcon, Clock, IndianRupee } from "lucide-react"

const existingMatches = [
  {
    id: 1,
    sport: "Basketball",
    venue: "Elite Sports Complex",
    date: "2024-01-28",
    time: "6:00 PM - 8:00 PM",
    prizeAmount: 5000,
    playersJoined: 3,
    playersNeeded: 8,
    createdBy: "John Smith",
    status: "Open",
  },
  {
    id: 2,
    sport: "Tennis",
    venue: "Premier Tennis Club",
    date: "2024-01-30",
    time: "4:00 PM - 6:00 PM",
    prizeAmount: 3000,
    playersJoined: 1,
    playersNeeded: 4,
    createdBy: "Sarah Johnson",
    status: "Open",
  },
  {
    id: 3,
    sport: "Volleyball",
    venue: "Community Recreation Center",
    date: "2024-01-25",
    time: "7:00 PM - 9:00 PM",
    prizeAmount: 2000,
    playersJoined: 12,
    playersNeeded: 12,
    createdBy: "Mike Wilson",
    status: "Full",
  },
]

const sportsOptions = ["Basketball", "Tennis", "Volleyball", "Badminton", "Football", "Table Tennis"]
const venueOptions = [
  "Elite Sports Complex",
  "Premier Tennis Club", 
  "Community Recreation Center",
  "Urban Basketball Arena",
  "Fitness & Sports Hub"
]

export default function MatchesPage() {
  const [userData, setUserData] = useState<any>(null)
  const [matches, setMatches] = useState(existingMatches)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [formData, setFormData] = useState({
    sport: "",
    venue: "",
    time: "",
    prizeAmount: "",
    playersNeeded: "",
  })
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(user)
    if (parsedUser.userType !== "user") {
      router.push("/login")
      return
    }

    setUserData(parsedUser)
  }, [router])

  const handleCreateMatch = () => {
    if (!selectedDate || !formData.sport || !formData.venue || !formData.time || !formData.playersNeeded) {
      return
    }

    const newMatch = {
      id: matches.length + 1,
      sport: formData.sport,
      venue: formData.venue,
      date: selectedDate?.toISOString().split('T')[0] || "",
      time: formData.time,
      prizeAmount: Number.parseInt(formData.prizeAmount) || 0,
      playersJoined: 1, // Creator automatically joins
      playersNeeded: Number.parseInt(formData.playersNeeded),
      createdBy: userData?.name || "You",
      status: "Open",
    }

    setMatches([newMatch, ...matches])
    setFormData({ sport: "", venue: "", time: "", prizeAmount: "", playersNeeded: "" })
    setSelectedDate(new Date())
    setIsCreateModalOpen(false)
  }

  const handleJoinMatch = (matchId: number) => {
    setMatches(matches.map(match => 
      match.id === matchId && match.playersJoined < match.playersNeeded
        ? { 
            ...match, 
            playersJoined: match.playersJoined + 1,
            status: match.playersJoined + 1 === match.playersNeeded ? "Full" : "Open"
          }
        : match
    ))
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
          <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
          <p className="text-gray-600 mt-2">Create or join matches with other players</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create a Match
            </Button>
          </DialogTrigger>
          <DialogContent className="border-gray-200 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Create New Match</DialogTitle>
              <DialogDescription className="text-gray-600">
                Set up a match and invite other players to join.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sport" className="text-gray-700">Sport</Label>
                  <Select value={formData.sport} onValueChange={(value) => setFormData(prev => ({ ...prev, sport: value }))}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Select sport" />
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
                  <Label htmlFor="venue" className="text-gray-700">Venue</Label>
                  <Select value={formData.venue} onValueChange={(value) => setFormData(prev => ({ ...prev, venue: value }))}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Select venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venueOptions.map((venue) => (
                        <SelectItem key={venue} value={venue}>
                          {venue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Select Date</Label>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border border-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-gray-700">Time</Label>
                  <Input
                    id="time"
                    placeholder="e.g., 6:00 PM - 8:00 PM"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playersNeeded" className="text-gray-700">Players Needed</Label>
                  <Input
                    id="playersNeeded"
                    type="number"
                    placeholder="e.g., 8"
                    value={formData.playersNeeded}
                    onChange={(e) => setFormData(prev => ({ ...prev, playersNeeded: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prizeAmount" className="text-gray-700">Prize Money (Optional)</Label>
                  <div className="relative">
                    <IndianRupee className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      id="prizeAmount"
                      type="number"
                      placeholder="0"
                      value={formData.prizeAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, prizeAmount: e.target.value }))}
                      className="border-gray-300 pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="border-gray-300 text-gray-700">
                  Cancel
                </Button>
                <Button onClick={handleCreateMatch} className="bg-gray-900 hover:bg-gray-800 text-white">
                  Create Match
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Matches */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Available Matches</h2>
        <div className="grid gap-6">
          {matches.map((match) => (
            <Card key={match.id} className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {match.sport}
                      </Badge>
                      <Badge
                        variant={match.status === "Open" ? "default" : "secondary"}
                        className={
                          match.status === "Open" 
                            ? "bg-gray-900 text-white" 
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {match.status}
                      </Badge>
                      {match.prizeAmount > 0 && (
                        <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          {match.prizeAmount.toLocaleString()}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{match.venue}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>{new Date(match.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{match.time}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{match.playersJoined}/{match.playersNeeded} players</span>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                      Created by: <span className="font-medium">{match.createdBy}</span>
                    </div>
                  </div>

                  <div className="ml-4">
                    <Button
                      onClick={() => handleJoinMatch(match.id)}
                      disabled={match.status === "Full" || match.createdBy === userData?.name}
                      className={
                        match.status === "Full" || match.createdBy === userData?.name
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      }
                    >
                      {match.createdBy === userData?.name ? "Your Match" : 
                       match.status === "Full" ? "Match Full" : "Join Match"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
