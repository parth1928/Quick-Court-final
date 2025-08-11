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

interface Tournament {
  id: number
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
  status: "open" | "closed" | "ongoing" | "completed"
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Professional"
  image: string
  description: string
  organizer: string
  rules?: string[]
}

const mockTournaments: Tournament[] = [
  {
    id: 1,
    name: "Mumbai Basketball Premier League",
    sport: "Basketball",
    category: "5v5",
    venue: "NSCI Indoor Stadium",
    location: "Mumbai",
    startDate: "2024-09-10",
    endDate: "2024-09-20",
    registrationDeadline: "2024-09-01",
    maxParticipants: 12,
    currentParticipants: 8,
    entryFee: 5000,
    prizePool: 100000,
    status: "open",
    difficulty: "Professional",
    image: "/placeholder.svg?height=200&width=300&text=Basketball+Tournament",
    description: "Participate in Mumbai's biggest basketball league. Open to all professional and semi-professional teams.",
    organizer: "Mumbai Basketball Association",
    rules: [
      "Teams must have 5 players + 3 substitutes",
      "All players must be 16+ years old",
      "Standard FIBA rules apply",
      "Entry fee includes GST and court charges"
    ]
  },
  {
    id: 2,
    name: "Chennai Tennis Challenge",
    sport: "Tennis",
    category: "Singles",
    venue: "SDAT Tennis Stadium",
    location: "Chennai",
    startDate: "2024-10-05",
    endDate: "2024-10-10",
    registrationDeadline: "2024-09-25",
    maxParticipants: 32,
    currentParticipants: 20,
    entryFee: 3000,
    prizePool: 50000,
    status: "open",
    difficulty: "Intermediate",
    image: "/placeholder.svg?height=200&width=300&text=Tennis+Tournament",
    description: "Show your skills at the Chennai Tennis Challenge. Open for all state-level players.",
    organizer: "Tamil Nadu Tennis Association",
    rules: [
      "Single players only",
      "All players must be 15+ years old",
      "Standard ITF rules apply",
      "Entry fee includes GST"
    ]
  },
  {
    id: 3,
    name: "Hyderabad Badminton Open",
    sport: "Badminton",
    category: "Singles",
    venue: "Gachibowli Indoor Stadium",
    location: "Hyderabad",
    startDate: "2024-11-01",
    endDate: "2024-11-03",
    registrationDeadline: "2024-10-20",
    maxParticipants: 32,
    currentParticipants: 20,
    entryFee: 1000,
    prizePool: 20000,
    status: "open",
    difficulty: "Advanced",
    image: "/placeholder.svg?height=200&width=300&text=Badminton+Tournament",
    description: "Compete in Hyderabad's premier badminton singles event. Open to all advanced players.",
    organizer: "Telangana Badminton Association",
    rules: [
      "Players must be 14+ years old",
      "BWF rules apply",
      "Entry fee includes GST"
    ]
  },
  {
    id: 4,
    name: "Delhi Football Cup",
    sport: "Football",
    category: "5-a-side",
    venue: "Ambedkar Stadium",
    location: "Delhi",
    startDate: "2024-12-10",
    endDate: "2024-12-15",
    registrationDeadline: "2024-12-01",
    maxParticipants: 20,
    currentParticipants: 15,
    entryFee: 2500,
    prizePool: 30000,
    status: "open",
    difficulty: "Beginner",
    image: "/placeholder.svg?height=200&width=300&text=Football+Tournament",
    description: "Join the Delhi Football Cup for a fun and competitive 5-a-side tournament.",
    organizer: "Delhi Football Association",
    rules: [
      "Teams must have 5 players + 3 substitutes",
      "All players must be 13+ years old",
      "AIFF 5-a-side rules apply",
      "Entry fee includes GST"
    ]
  },
];

export default function TournamentsPage() {
  const [userData, setUserData] = useState<any>(null)
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments)
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>(mockTournaments)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSport, setSelectedSport] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

  const parsedUser = JSON.parse(user)
  if (parsedUser.role !== "user") {
      router.push("/login")
      return
    }

    setUserData(parsedUser)
  }, [router])

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

  const getAvailableSpots = (tournament: Tournament) => {
    return tournament.maxParticipants - tournament.currentParticipants
  }

  if (!userData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sports Tournaments</h1>
          <p className="text-gray-600 mt-1">Discover and register for exciting sports tournaments</p>
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
              <Card key={tournament.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={tournament.image}
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
                    <Link href={`/tournaments/${tournament.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    {tournament.status === "open" && getAvailableSpots(tournament) > 0 && (
                      <Link href={`/tournaments/${tournament.id}/register`} className="flex-1">
                        <Button className="w-full">
                          Register Now
                        </Button>
                      </Link>
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
              <Card key={tournament.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Card content same as above */}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
