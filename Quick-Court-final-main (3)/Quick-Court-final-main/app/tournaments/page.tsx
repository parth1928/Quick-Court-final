"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Calendar, MapPin, Users, Filter, Search, Clock, Star } from "lucide-react"
import PaySimulator from "@/components/pay-simulator"
import { toast } from "@/components/ui/use-toast"

interface Tournament {
  _id: string
  name: string
  sport: string
  category: string
  venue: string
  location: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants: number
  currentParticipants: number
  entryFee: number
  prizePool: number
  status: "draft" | "submitted" | "approved" | "open" | "closed" | "ongoing" | "completed" | "cancelled"
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Professional"
  description: string
  organizer: string
  participants: Array<{
    _id: string
    user: string
    name: string
    registrationDate: string
  }>
  rules?: string[]
  hasJoined?: boolean
}

export default function TournamentsPage() {
  const [userData, setUserData] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSport, setSelectedSport] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("user")
    const token = localStorage.getItem("authToken")
    
    if (user && token) {
      try {
        const parsedUser = JSON.parse(user)
        setUserData(parsedUser)
        setIsAuthenticated(true)
      } catch (e) {
        console.error('Error parsing user data:', e)
        setIsAuthenticated(false)
      }
    } else {
      setIsAuthenticated(false)
    }
  }, [router])

  // Fetch tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true)
        
        // Fetch tournaments without authentication for public browsing
        const response = await fetch('/api/tournaments', {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
          throw new Error(errorMessage)
        }
        
        const data = await response.json()
        
        if (!data.tournaments) {
          console.warn('No tournaments array in response:', data)
          setTournaments([])
          setFilteredTournaments([])
          return
        }
        
        const tournamentsWithCounts = data.tournaments.map((tournament: any) => ({
          ...tournament,
          currentParticipants: tournament.participants?.length || 0,
          hasJoined: isAuthenticated && userData ? tournament.participants?.some((p: any) => {
            return p.user === userData._id || p.user === userData.userId
          }) : false
        }))
        
        setTournaments(tournamentsWithCounts)
        setFilteredTournaments(tournamentsWithCounts)
      } catch (err: any) {
        console.error('Error fetching tournaments:', err)
        setError(err.message)
        setTournaments([])
        setFilteredTournaments([])
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [isAuthenticated, userData])

  useEffect(() => {
    let filtered = tournaments

    if (searchTerm) {
      filtered = filtered.filter(tournament =>
        tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.venue.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedSport !== "all") {
      filtered = filtered.filter(tournament => tournament.sport === selectedSport)
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(tournament => tournament.difficulty === selectedDifficulty)
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(tournament => tournament.status === selectedStatus)
    }

    setFilteredTournaments(filtered)
  }, [tournaments, searchTerm, selectedSport, selectedDifficulty, selectedStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800"
      case "closed": return "bg-red-100 text-red-800"
      case "ongoing": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800"
      case "Intermediate": return "bg-yellow-100 text-yellow-800"
      case "Advanced": return "bg-orange-100 text-orange-800"
      case "Professional": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleJoinTournament = async (tournamentId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to join tournaments.",
        variant: "destructive"
      })
      router.push('/login')
      return
    }

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Use cookie-based authentication
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to join tournament')
      }

      const result = await response.json()
      
      // Update local state
      setTournaments(prev => prev.map(t => 
        t._id === tournamentId 
          ? { ...t, currentParticipants: result.currentParticipants, hasJoined: true }
          : t
      ))

      toast({
        title: "Success!",
        description: "You have successfully joined the tournament.",
      })
    } catch (err: any) {
      console.error('Error joining tournament:', err)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      })
    }
  }

  const getAvailableSpots = (tournament: Tournament) => {
    return tournament.maxParticipants - tournament.currentParticipants
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tournaments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Authentication Status Banner */}
      {!isAuthenticated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Browse Tournaments</h3>
                <p className="text-sm text-blue-600">Log in to join tournaments and track your registrations.</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sports Tournaments</h1>
          <p className="text-gray-600 mt-1">
            {isAuthenticated ? 'Discover and register for exciting sports tournaments' : 'Browse available tournaments'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <span className="text-sm text-gray-600">Find Your Next Challenge</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tournaments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sport</label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="Cricket">Cricket</SelectItem>
                  <SelectItem value="Kabaddi">Kabaddi</SelectItem>
                  <SelectItem value="Badminton">Badminton</SelectItem>
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Hockey">Hockey</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedSport("all")
                  setSelectedDifficulty("all")
                  setSelectedStatus("all")
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tournament Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tournaments</TabsTrigger>
          <TabsTrigger value="open">Open Registration</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Live Tournaments</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <Card key={tournament._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src="/placeholder.svg"
                    alt={tournament.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge className={getStatusColor(tournament.status)}>
                      {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{tournament.name}</CardTitle>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {tournament.venue}, {tournament.location}
                      </div>
                    </div>
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{tournament.sport}</span>
                    <Badge className={getDifficultyColor(tournament.difficulty)}>
                      {tournament.difficulty}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">{tournament.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Start Date:
                      </span>
                      <span className="font-medium">{new Date(tournament.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Registration:
                      </span>
                      <span className="font-medium">{new Date(tournament.registrationDeadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Participants:
                      </span>
                      <span className="font-medium">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Entry Fee:</span>
                      <span className="font-bold text-green-600">₹{tournament.entryFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Prize Pool:</span>
                      <span className="font-bold text-yellow-600">₹{tournament.prizePool.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/tournaments/${tournament._id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    {tournament.status === "open" && getAvailableSpots(tournament) > 0 && (
                      <div className="flex-1">
                        <PaySimulator
                          amount={tournament.entryFee}
                          descriptor={`Tournament Registration - ${tournament.name}`}
                          buttonLabel="Register & Pay"
                          onSuccess={(tx) => {
                            // Handle successful tournament registration
                            console.log("Tournament registration successful:", tx)
                            
                            // Store registration data (in real app, this would go to your API)
                            const registrationData = {
                              transactionId: tx.id,
                              tournamentId: tournament._id,
                              tournamentName: tournament.name,
                              entryFee: tournament.entryFee,
                              registrationDate: new Date().toISOString(),
                              status: "Registered"
                            }
                            
                            // Example API call (uncomment for real implementation):
                            // await fetch("/api/tournaments/register", { 
                            //   method: "POST", 
                            //   body: JSON.stringify(registrationData) 
                            // })
                            
                            toast({
                              title: "Registration Successful!",
                              description: `Redirecting to confirmation page...`,
                            })
                            
                            // Redirect to payment completed page with tournament details
                            const queryParams = new URLSearchParams({
                              txId: tx.id,
                              amount: tournament.entryFee.toString(),
                              type: "tournament",
                              tournamentId: tournament._id.toString(),
                              tournamentName: tournament.name,
                              venue: tournament.venue,
                              startDate: tournament.startDate
                            })
                            
                            setTimeout(() => {
                              window.location.href = `/payment-completed?${queryParams.toString()}`
                            }, 1000)
                          }}
                          onFailure={() => {
                            toast({
                              title: "Registration Failed",
                              description: "Please try again or use a different payment method",
                              variant: "destructive",
                            })
                          }}
                        />
                      </div>
                    )}
                    {tournament.status === "closed" && (
                      <Button disabled className="flex-1">
                        Registration Closed
                      </Button>
                    )}
                    {getAvailableSpots(tournament) === 0 && tournament.status === "open" && (
                      <Button disabled className="flex-1">
                        Tournament Full
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTournaments.length === 0 && (
            <Card className="p-12 text-center">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tournaments found</h3>
              <p className="text-gray-600">Try adjusting your filters to find more tournaments.</p>
            </Card>
          )}
        </TabsContent>

        {/* Similar content for other tabs with filtered data */}
        <TabsContent value="open">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.filter(t => t.status === "open").map((tournament) => (
              // Same card component as above
              <Card key={tournament._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Card content same as above */}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
