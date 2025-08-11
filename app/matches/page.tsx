"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Users, MapPin, Calendar as CalendarIcon, Clock, IndianRupee, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

// Types
interface Match {
  _id: string
  sport: string
  venue: {
    _id: string
    name: string
  }
  date: string
  time: string
  prizeAmount: number
  playersJoined: number
  playersNeeded: number
  createdBy: {
    _id: string
    name: string
  }
  status: "Open" | "Full" | "Cancelled" | "Completed"
  participants: Array<{
    _id: string
    name: string
    joinedAt: string
  }>
  description?: string
  hasJoined?: boolean
  isCreator?: boolean
}

interface Venue {
  _id: string
  name: string
  sports: string[]
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [createLoading, setCreateLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    sport: "",
    venueId: "",
    date: new Date(),
    time: "",
    playersNeeded: "",
    prizeAmount: "",
    description: ""
  })

  // Filter state
  const [filters, setFilters] = useState({
    sport: "All",
    status: "All",
    search: ""
  })

  // Check authentication and load data on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(userStr)
    if (!userData.role || userData.role === 'admin') {
      router.push('/admin-dashboard')
      return
    }

    // Load data immediately
    loadVenues()
    loadMatches()
  }, [router])

  // Also load venues when dialog opens
  useEffect(() => {
    if (isDialogOpen && venues.length === 0) {
      loadVenues()
    }
  }, [isDialogOpen])

  const loadMatches = async () => {
    try {
      setLoading(true)
      setError(null)
      const userStr = localStorage.getItem('user')
      if (!userStr) return
      
      // Try the API first
      const response = await fetch('/api/matches', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(userStr).token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMatches(data)
        return
      }
      
      // If API fails, log the error but don't throw
      console.warn('API failed, using fallback data:', response.status, response.statusText)
      
    } catch (error) {
      console.error('Error loading matches from API:', error)
    }
    
    // Fallback to empty array or mock data
    setMatches([])
    setLoading(false)
  }

  const loadVenues = async () => {
    try {
      // Try the API first
      const response = await fetch('/api/venues')
      if (response.ok) {
        const data = await response.json()
        setVenues(data)
        return
      }
    } catch (error) {
      console.error('Error loading venues from API:', error)
    }
    
    // Fallback to mock data if API fails
    const mockVenues = [
      {
        _id: '1',
        name: 'Elite Sports Complex',
        sports: ['Basketball', 'Tennis', 'Badminton', 'Volleyball']
      },
      {
        _id: '2', 
        name: 'Premier Tennis Club',
        sports: ['Tennis', 'Badminton']
      },
      {
        _id: '3',
        name: 'Community Recreation Center', 
        sports: ['Basketball', 'Volleyball', 'Football', 'Cricket']
      },
      {
        _id: '4',
        name: 'City Sports Arena',
        sports: ['Football', 'Cricket', 'Hockey']
      }
    ]
    setVenues(mockVenues)
  }

  const createMatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setError(null)
    
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        throw new Error('Not authenticated')
      }

      const payload = {
        sport: formData.sport,
        venueId: formData.venueId,
        date: formData.date.toISOString().split('T')[0],
        time: formData.time,
        playersNeeded: parseInt(formData.playersNeeded),
        prizeAmount: parseFloat(formData.prizeAmount) || 0,
        description: formData.description || undefined
      }

      // Try API first
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(userStr).token}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        // API success - reload matches
        await loadMatches()
      } else {
        // API failed - create mock match locally
        console.warn('API failed, creating mock match locally')
        
        const userData = JSON.parse(userStr)
        const selectedVenue = venues.find(v => v._id === formData.venueId)
        
        const mockMatch: Match = {
          _id: `mock-${Date.now()}`,
          sport: formData.sport,
          venue: {
            _id: formData.venueId,
            name: selectedVenue?.name || 'Selected Venue'
          },
          date: formData.date.toISOString().split('T')[0],
          time: formData.time,
          prizeAmount: parseFloat(formData.prizeAmount) || 0,
          playersJoined: 1,
          playersNeeded: parseInt(formData.playersNeeded),
          createdBy: {
            _id: userData.id || 'mock-user',
            name: userData.name || 'You'
          },
          status: 'Open' as const,
          participants: [{
            _id: userData.id || 'mock-user',
            name: userData.name || 'You',
            joinedAt: new Date().toISOString()
          }],
          description: formData.description,
          hasJoined: true,
          isCreator: true
        }
        
        setMatches(prev => [mockMatch, ...prev])
      }

      // Reset form and close dialog
      setFormData({
        sport: "",
        venueId: "",
        date: new Date(),
        time: "",
        playersNeeded: "",
        prizeAmount: "",
        description: ""
      })
      setIsDialogOpen(false)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create match')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleJoinMatch = async (matchId: string) => {
    setJoinLoading(matchId)
    setError(null)
    
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        throw new Error('Not authenticated')
      }

      // Try API first
      const response = await fetch(`/api/matches/${matchId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JSON.parse(userStr).token}`
        }
      })

      if (response.ok) {
        // API success - reload matches
        await loadMatches()
      } else {
        // API failed - update locally
        console.warn('Join API failed, updating locally')
        const userData = JSON.parse(userStr)
        
        setMatches(prev => prev.map(match => {
          if (match._id === matchId && !match.hasJoined && match.playersJoined < match.playersNeeded) {
            return {
              ...match,
              playersJoined: match.playersJoined + 1,
              hasJoined: true,
              participants: [...match.participants, {
                _id: userData.id || 'mock-user',
                name: userData.name || 'You',
                joinedAt: new Date().toISOString()
              }],
              status: (match.playersJoined + 1) >= match.playersNeeded ? 'Full' as const : match.status
            }
          }
          return match
        }))
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join match')
    } finally {
      setJoinLoading(null)
    }
  }

  const handleLeaveMatch = async (matchId: string) => {
    setJoinLoading(matchId)
    setError(null)
    
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        throw new Error('Not authenticated')
      }

      // Try API first
      const response = await fetch(`/api/matches/${matchId}/join`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${JSON.parse(userStr).token}`
        }
      })

      if (response.ok) {
        // API success - reload matches
        await loadMatches()
      } else {
        // API failed - update locally
        console.warn('Leave API failed, updating locally')
        const userData = JSON.parse(userStr)
        
        setMatches(prev => prev.map(match => {
          if (match._id === matchId && match.hasJoined) {
            const newParticipants = match.participants.filter(p => p._id !== (userData.id || 'mock-user'))
            return {
              ...match,
              playersJoined: Math.max(1, match.playersJoined - 1),
              hasJoined: false,
              participants: newParticipants,
              status: 'Open' as const
            }
          }
          return match
        }))
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to leave match')
    } finally {
      setJoinLoading(null)
    }
  }

  // Filter matches based on current filters
  const filteredMatches = matches.filter(match => {
    const matchesSearch = filters.search === "" || 
      match.sport.toLowerCase().includes(filters.search.toLowerCase()) ||
      match.venue.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      match.createdBy.name.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesSport = filters.sport === "All" || match.sport === filters.sport
    const matchesStatus = filters.status === "All" || match.status === filters.status
    
    return matchesSearch && matchesSport && matchesStatus
  })

  // Get available sports from venues
  const availableSports = venues.length > 0 
    ? [...new Set(venues.flatMap(venue => venue.sports))]
    : ['Basketball', 'Tennis', 'Football', 'Cricket', 'Badminton', 'Volleyball', 'Hockey'] // Fallback sports

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sports Matches</h1>
          <p className="text-muted-foreground">Create or join matches at your favorite venues</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Match
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Match</DialogTitle>
              <DialogDescription>
                Set up a new sports match for others to join
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={createMatch} className="space-y-6">
              {/* Sport and Venue Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sport">Sport</Label>
                  <Select value={formData.sport} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, sport: value, venueId: "" }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSports.length === 0 ? (
                        <SelectItem value="" disabled>Loading sports...</SelectItem>
                      ) : (
                        availableSports.map(sport => (
                          <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {/* Debug info */}
                  <p className="text-xs text-muted-foreground">
                    Available sports: {availableSports.length} | Venues: {venues.length}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Select 
                    value={formData.venueId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, venueId: value }))}
                    disabled={!formData.sport}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!formData.sport ? "Select sport first" : "Select a venue"} />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.length === 0 ? (
                        <SelectItem value="" disabled>Loading venues...</SelectItem>
                      ) : venues
                        .filter(venue => !formData.sport || venue.sports.includes(formData.sport))
                        .map(venue => (
                          <SelectItem key={venue._id} value={venue._id}>
                            {venue.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  {/* Debug info */}
                  <p className="text-xs text-muted-foreground">
                    {formData.sport ? 
                      `Venues for ${formData.sport}: ${venues.filter(v => v.sports.includes(formData.sport)).length}` :
                      `Total venues: ${venues.length}`
                    }
                  </p>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>
                </div>
              </div>

              {/* Time, Players, and Prize */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="playersNeeded">Players Needed</Label>
                  <Input
                    id="playersNeeded"
                    type="number"
                    min="2"
                    max="50"
                    value={formData.playersNeeded}
                    onChange={(e) => setFormData(prev => ({ ...prev, playersNeeded: e.target.value }))}
                    placeholder="e.g. 8"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prizeAmount">Prize Amount (₹)</Label>
                  <Input
                    id="prizeAmount"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.prizeAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, prizeAmount: e.target.value }))}
                    placeholder="e.g. 5000"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Any additional details about the match..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={createLoading}>
                {createLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Match'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search matches..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        
        <Select value={filters.sport} onValueChange={(value) => setFilters(prev => ({ ...prev, sport: value }))}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Sports</SelectItem>
            {availableSports.map(sport => (
              <SelectItem key={sport} value={sport}>{sport}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Full">Full</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatches.map((match) => (
          <Card key={match._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{match.sport}</CardTitle>
                <Badge variant={
                  match.status === "Open" ? "default" : 
                  match.status === "Full" ? "secondary" : 
                  match.status === "Completed" ? "outline" : "destructive"
                }>
                  {match.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {match.venue.name}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                {new Date(match.date).toLocaleDateString()}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {match.time}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {match.playersJoined}/{match.playersNeeded} players
              </div>
              
              {match.prizeAmount > 0 && (
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <IndianRupee className="h-4 w-4" />
                  ₹{match.prizeAmount.toLocaleString()}
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                Created by {match.createdBy.name}
              </div>

              {match.description && (
                <p className="text-sm text-muted-foreground">{match.description}</p>
              )}
              
              <div className="pt-2">
                {match.isCreator ? (
                  <Badge variant="outline">Your Match</Badge>
                ) : match.hasJoined ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleLeaveMatch(match._id)}
                    disabled={joinLoading === match._id}
                    className="w-full"
                  >
                    {joinLoading === match._id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Leaving...
                      </>
                    ) : (
                      'Leave Match'
                    )}
                  </Button>
                ) : match.status === "Open" && match.playersJoined < match.playersNeeded ? (
                  <Button 
                    size="sm" 
                    onClick={() => handleJoinMatch(match._id)}
                    disabled={joinLoading === match._id}
                    className="w-full"
                  >
                    {joinLoading === match._id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Joining...
                      </>
                    ) : (
                      'Join Match'
                    )}
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" disabled className="w-full">
                    {match.status === "Full" ? "Match Full" : "Not Available"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMatches.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No matches found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or create a new match</p>
        </div>
      )}
    </div>
  )
}
