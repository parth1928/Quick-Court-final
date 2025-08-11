"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
<<<<<<< Updated upstream
import { Card, CardContent } from "@/components/ui/card"
=======
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
>>>>>>> Stashed changes
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
<<<<<<< Updated upstream
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Users, MapPin, Calendar as CalendarIcon, Clock, IndianRupee } from "lucide-react"

const existingMatches = [
  {
    id: 1,
=======
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Users, MapPin, Calendar as CalendarIcon, Clock, Trophy } from "lucide-react"

const matchesData = [
  {
    id: 1,
    title: "Basketball Match",
>>>>>>> Stashed changes
    sport: "Basketball",
    venue: "Elite Sports Complex",
    date: "2024-01-28",
    time: "6:00 PM - 8:00 PM",
<<<<<<< Updated upstream
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
=======
    playersJoined: 3,
    playersNeeded: 8,
    status: "Open",
    createdBy: "John Smith",
    joinedUsers: ["John Smith", "Mike Johnson", "Sarah Davis"],
  },
  {
    id: 2,
    title: "Tennis Match",
    sport: "Tennis", 
    venue: "Premier Tennis Club",
    date: "2024-01-30",
    time: "4:00 PM - 6:00 PM",
    playersJoined: 1,
    playersNeeded: 4,
    status: "Open",
    createdBy: "Sarah Johnson",
    joinedUsers: ["Sarah Johnson"],
  },
  {
    id: 3,
    title: "Volleyball Match",
    sport: "Volleyball",
    venue: "Community Recreation Center", 
    date: "2024-01-25",
    time: "7:00 PM - 9:00 PM",
    playersJoined: 12,
    playersNeeded: 12,
    status: "Full",
    createdBy: "Mike Wilson",
    joinedUsers: ["Mike Wilson", "Tom Brown", "Lisa Green", "Alex White", "Emma Black", "David Blue", "Nina Red", "Jake Yellow", "Amy Purple", "Chris Orange", "Mia Pink", "Ryan Gray"],
  },
]

export default function MatchesPage() {
  const [userData, setUserData] = useState<any>(null)
  const [matches, setMatches] = useState(matchesData)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newMatch, setNewMatch] = useState({
    sport: "",
    venue: "",
    date: "",
    time: "",
>>>>>>> Stashed changes
    playersNeeded: "",
  })
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }
<<<<<<< Updated upstream

    const parsedUser = JSON.parse(user)
    if (parsedUser.userType !== "user") {
      router.push("/login")
      return
    }

=======
    const parsedUser = JSON.parse(user)
    if (parsedUser.role !== "user") {
      router.push("/login")
      return
    }
>>>>>>> Stashed changes
    setUserData(parsedUser)
  }, [router])

  const handleCreateMatch = () => {
<<<<<<< Updated upstream
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
=======
    if (!newMatch.sport || !newMatch.venue || !newMatch.date || !newMatch.time || !newMatch.playersNeeded) {
      return
    }

    const match = {
      id: matches.length + 1,
      title: `${newMatch.sport} Match`,
      sport: newMatch.sport,
      venue: newMatch.venue,
      date: newMatch.date,
      time: newMatch.time,
      playersJoined: 1, // Creator automatically joins
      playersNeeded: parseInt(newMatch.playersNeeded),
      status: "Open",
      createdBy: userData?.name || "You",
      joinedUsers: [userData?.name || "You"],
    }

    setMatches([match, ...matches])
    setNewMatch({ sport: "", venue: "", date: "", time: "", playersNeeded: "" })
    setIsCreateDialogOpen(false)
  }

  const handleJoinMatch = (matchId: number) => {
    setMatches(matches.map(match => {
      if (match.id === matchId && match.status === "Open" && !match.joinedUsers.includes(userData?.name)) {
        const newPlayersJoined = match.playersJoined + 1
        return {
          ...match,
          playersJoined: newPlayersJoined,
          joinedUsers: [...match.joinedUsers, userData?.name],
          status: newPlayersJoined >= match.playersNeeded ? "Full" : "Open"
        }
      }
      return match
    }))
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
=======
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
>>>>>>> Stashed changes
          <DialogTrigger asChild>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create a Match
            </Button>
          </DialogTrigger>
<<<<<<< Updated upstream
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
=======
          <DialogContent className="border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Create a New Match</DialogTitle>
              <DialogDescription className="text-gray-600">
                Fill in the details to create a match for other players to join.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sport" className="text-gray-700">Sport</Label>
                <Select value={newMatch.sport} onValueChange={(value) => setNewMatch(prev => ({ ...prev, sport: value }))}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basketball">Basketball</SelectItem>
                    <SelectItem value="Tennis">Tennis</SelectItem>
                    <SelectItem value="Volleyball">Volleyball</SelectItem>
                    <SelectItem value="Badminton">Badminton</SelectItem>
                    <SelectItem value="Football">Football</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue" className="text-gray-700">Venue</Label>
                <Select value={newMatch.venue} onValueChange={(value) => setNewMatch(prev => ({ ...prev, venue: value }))}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Elite Sports Complex">Elite Sports Complex</SelectItem>
                    <SelectItem value="Premier Tennis Club">Premier Tennis Club</SelectItem>
                    <SelectItem value="Community Recreation Center">Community Recreation Center</SelectItem>
                    <SelectItem value="SportZone Arena">SportZone Arena</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-gray-700">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newMatch.date}
                    onChange={(e) => setNewMatch(prev => ({ ...prev, date: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-gray-700">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newMatch.time}
                    onChange={(e) => setNewMatch(prev => ({ ...prev, time: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="playersNeeded" className="text-gray-700">Number of Players Needed</Label>
                <Input
                  id="playersNeeded"
                  type="number"
                  placeholder="e.g., 8"
                  value={newMatch.playersNeeded}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, playersNeeded: e.target.value }))}
                  className="border-gray-300"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-gray-300 text-gray-700">
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
      {/* Active Matches */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Available Matches</h2>
        <div className="grid gap-6">
          {matches.map((match) => (
            <Card key={match.id} className="border-gray-200 hover:shadow-lg transition-shadow">
=======
      {/* Matches List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Available Matches</h2>
        <div className="grid gap-4">
          {matches.map((match) => (
            <Card key={match.id} className="border-gray-200 hover:shadow-md transition-shadow">
>>>>>>> Stashed changes
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
<<<<<<< Updated upstream
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
=======
                      <h3 className="text-lg font-semibold text-gray-900">{match.title}</h3>
                      <Badge
                        variant={match.status === "Open" ? "default" : "secondary"}
                        className={match.status === "Open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                      >
                        {match.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-1" />
                        <span>{match.sport}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{match.venue}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>{new Date(match.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{match.time}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{match.playersJoined}/{match.playersNeeded} players</span>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {(() => {
                      const isCreator = match.createdBy === userData?.name
                      const hasJoined = match.joinedUsers.includes(userData?.name)
                      const isFull = match.status === "Full"
                      
                      if (isCreator) {
                        return (
                          <Button disabled className="bg-gray-100 text-gray-400 cursor-not-allowed">
                            Your Match
                          </Button>
                        )
                      } else if (hasJoined) {
                        return (
                          <Button disabled className="bg-green-100 text-green-600 cursor-not-allowed">
                            Joined
                          </Button>
                        )
                      } else if (isFull) {
                        return (
                          <Button disabled className="bg-gray-100 text-gray-400 cursor-not-allowed">
                            Match Full
                          </Button>
                        )
                      } else {
                        return (
                          <Button 
                            onClick={() => handleJoinMatch(match.id)}
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                          >
                            Join Match
                          </Button>
                        )
                      }
                    })()}
>>>>>>> Stashed changes
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
