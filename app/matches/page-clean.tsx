"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Users, MapPin, Calendar as CalendarIcon, Clock, IndianRupee } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface Match {
  id: string
  sport: string
  venue: string
  date: string
  time: string
  prizeAmount: number
  courtFees: number
  playersJoined: number
  playersNeeded: number
  createdBy: string
  status: "Open" | "Full" | "Cancelled" | "Completed"
  description?: string
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([
    {
      id: "1",
      sport: "Basketball",
      venue: "Elite Sports Complex",
      date: "2025-08-15",
      time: "6:00 PM - 8:00 PM",
      prizeAmount: 500,
      courtFees: 100,
      playersJoined: 2,
      playersNeeded: 4,
      createdBy: "John Doe",
      status: "Open",
      description: "Friendly basketball match. All skill levels welcome!"
    },
    {
      id: "2",
      sport: "Tennis",
      venue: "Premier Tennis Club",
      date: "2025-08-16",
      time: "7:00 AM - 9:00 AM",
      prizeAmount: 300,
      courtFees: 80,
      playersJoined: 1,
      playersNeeded: 2,
      createdBy: "Sarah Wilson",
      status: "Open",
      description: "Morning tennis session. Looking for doubles partner."
    },
    {
      id: "3",
      sport: "Badminton",
      venue: "Community Recreation Center",
      date: "2025-08-17",
      time: "5:00 PM - 7:00 PM",
      prizeAmount: 200,
      courtFees: 60,
      playersJoined: 4,
      playersNeeded: 4,
      createdBy: "Mike Chen",
      status: "Full",
      description: "Competitive badminton doubles tournament."
    }
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastCreated, setLastCreated] = useState<Match | null>(null)
  const [formData, setFormData] = useState({
    sport: "",
    venue: "",
    date: "",
    time: "",
    playersNeeded: "",
    prizeAmount: "",
    courtFees: "",
    description: ""
  })

  const sports = ["Basketball", "Tennis", "Badminton", "Football", "Cricket", "Volleyball", "Table Tennis"]
  const venues = ["Elite Sports Complex", "Premier Tennis Club", "Community Recreation Center", "City Sports Arena"]
  const timeSlots = [
    "6:00 AM - 8:00 AM",
    "8:00 AM - 10:00 AM", 
    "10:00 AM - 12:00 PM",
    "12:00 PM - 2:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM",
    "6:00 PM - 8:00 PM",
    "8:00 PM - 10:00 PM"
  ]

  const createMatch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.sport || !formData.venue || !formData.date || !formData.time || !formData.playersNeeded) {
      alert('Please fill in all required fields (Sport, Venue, Date, Time, Players Needed)')
      return
    }
    
    // Validate players needed
    const playersNum = parseInt(formData.playersNeeded)
    if (isNaN(playersNum) || playersNum < 2 || playersNum > 50) {
      alert('Players needed must be between 2 and 50')
      return
    }
    
    // Validate date is not in the past
    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      alert('Cannot create matches for past dates')
      return
    }
    
    const newMatch: Match = {
      id: Date.now().toString(),
      sport: formData.sport,
      venue: formData.venue,
      date: formData.date,
      time: formData.time,
      playersNeeded: playersNum,
      prizeAmount: parseFloat(formData.prizeAmount) || 0,
      courtFees: parseFloat(formData.courtFees) || 0,
      playersJoined: 1, // Creator joins automatically
      createdBy: "You",
      status: "Open",
      description: formData.description
    }

    // Add match to the top of the list
    setMatches(prev => [newMatch, ...prev])
    setLastCreated(newMatch)
    setShowSuccess(true)
    
    // Auto-hide the success banner after 6 seconds
    setTimeout(() => setShowSuccess(false), 6000)
    
    // Reset form
    setFormData({
      sport: "",
      venue: "",
      date: "",
      time: "",
      playersNeeded: "",
      prizeAmount: "",
      courtFees: "",
      description: ""
    })
    
    setIsDialogOpen(false)
    
    // Show additional feedback in console
    console.log('✅ Demo match created successfully:', newMatch)
  }

  const joinMatch = (matchId: string) => {
    setMatches(prev => prev.map(match => {
      if (match.id === matchId && match.playersJoined < match.playersNeeded) {
        const updatedMatch = {
          ...match,
          playersJoined: match.playersJoined + 1
        }
        // Update status if full
        if (updatedMatch.playersJoined >= updatedMatch.playersNeeded) {
          updatedMatch.status = "Full"
        }
        return updatedMatch
      }
      return match
    }))
  }

  const addDemoMatches = () => {
    const demoMatches: Match[] = [
      {
        id: `demo-${Date.now()}-1`,
        sport: "Football",
        venue: "City Sports Arena",
        date: "2025-08-20",
        time: "5:00 PM - 7:00 PM",
        prizeAmount: 1000,
        courtFees: 200,
        playersJoined: 6,
        playersNeeded: 11,
        createdBy: "Demo User",
        status: "Open",
        description: "Competitive football match for experienced players"
      },
      {
        id: `demo-${Date.now()}-2`,
        sport: "Cricket",
        venue: "Community Recreation Center",
        date: "2025-08-18",
        time: "9:00 AM - 12:00 PM",
        prizeAmount: 2000,
        courtFees: 150,
        playersJoined: 8,
        playersNeeded: 22,
        createdBy: "Cricket Club",
        status: "Open",
        description: "Weekend cricket tournament - all skill levels welcome"
      }
    ]
    setMatches(prev => [...demoMatches, ...prev])
    console.log('✅ Demo matches added')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-green-500"
      case "Full": return "bg-blue-500"
      case "Cancelled": return "bg-red-500"
      case "Completed": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
            <p className="text-gray-600 mt-2">Find and join sports matches in your area</p>
          </div>
          
          <div className="flex space-x-3">
            {/* Demo Button */}
            <Button 
              onClick={addDemoMatches}
              variant="outline"
              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            >
              Add Demo Matches
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Match
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Match</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new sports match
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={createMatch} className="space-y-4">
                  <div>
                    <Label htmlFor="sport">Sport *</Label>
                    <Select value={formData.sport} onValueChange={(value) => setFormData(prev => ({...prev, sport: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map(sport => (
                          <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="venue">Venue *</Label>
                    <Select value={formData.venue} onValueChange={(value) => setFormData(prev => ({...prev, venue: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select venue" />
                      </SelectTrigger>
                      <SelectContent>
                        {venues.map(venue => (
                          <SelectItem key={venue} value={venue}>{venue}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="time">Time Slot *</Label>
                    <Select value={formData.time} onValueChange={(value) => setFormData(prev => ({...prev, time: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(slot => (
                          <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="playersNeeded">Players Needed *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 4"
                      min="2"
                      max="50"
                      value={formData.playersNeeded}
                      onChange={(e) => setFormData(prev => ({...prev, playersNeeded: e.target.value}))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="prizeAmount">Prize Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 500"
                      min="0"
                      value={formData.prizeAmount}
                      onChange={(e) => setFormData(prev => ({...prev, prizeAmount: e.target.value}))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="courtFees">Court Fees (₹)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 100"
                      min="0"
                      value={formData.courtFees}
                      onChange={(e) => setFormData(prev => ({...prev, courtFees: e.target.value}))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      placeholder="Match details, rules, etc."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Create Match
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Success Banner */}
        {showSuccess && lastCreated && (
          <div className="mb-6 rounded-lg border border-green-300 bg-green-100 p-6 text-green-800 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-800">Match Created Successfully! 🎉</h3>
                  <div className="mt-2 text-sm space-y-1">
                    <p><strong>Sport:</strong> {lastCreated.sport}</p>
                    <p><strong>Venue:</strong> {lastCreated.venue}</p>
                    <p><strong>Date:</strong> {lastCreated.date}</p>
                    <p><strong>Time:</strong> {lastCreated.time}</p>
                    <p><strong>Players:</strong> {lastCreated.playersJoined}/{lastCreated.playersNeeded}</p>
                    {lastCreated.prizeAmount > 0 && <p><strong>Prize:</strong> ₹{lastCreated.prizeAmount}</p>}
                    {lastCreated.courtFees > 0 && <p><strong>Court Fees:</strong> ₹{lastCreated.courtFees}</p>}
                    {lastCreated.description && <p><strong>Description:</strong> {lastCreated.description}</p>}
                  </div>
                  <p className="mt-3 text-sm font-medium">Your match has been added to the list below and is ready for players to join!</p>
                </div>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="flex-shrink-0 text-green-600 hover:text-green-800 transition-colors"
                aria-label="Dismiss"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <Card key={match.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{match.sport}</CardTitle>
                  <Badge className={`${getStatusColor(match.status)} text-white`}>
                    {match.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{match.venue}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{match.date}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">{match.time}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {match.playersJoined}/{match.playersNeeded} players
                  </span>
                </div>
                
                {match.prizeAmount > 0 && (
                  <div className="flex items-center text-green-600">
                    <IndianRupee className="h-4 w-4 mr-2" />
                    <span className="text-sm font-semibold">₹{match.prizeAmount} prize</span>
                  </div>
                )}
                
                {match.courtFees > 0 && (
                  <div className="flex items-center text-orange-600">
                    <IndianRupee className="h-4 w-4 mr-2" />
                    <span className="text-sm">₹{match.courtFees} court fees</span>
                  </div>
                )}
                
                {match.description && (
                  <p className="text-gray-600 text-sm">{match.description}</p>
                )}
                
                <div className="text-xs text-gray-500">
                  Created by {match.createdBy}
                </div>
                
                {match.status === "Open" && (
                  <Button 
                    onClick={() => joinMatch(match.id)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Join Match
                  </Button>
                )}
                
                {match.status !== "Open" && (
                  <Button disabled className="w-full">
                    {match.status}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {matches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No matches found</p>
            <p className="text-gray-400 text-sm mt-2">Create your first match to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}
