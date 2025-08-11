"use client"

import { useState, useEffect } from "react"
import { formatInr } from "@/lib/format"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Trophy, Calendar, MapPin, Users, Clock, DollarSign, 
  Star, ArrowLeft, CheckCircle, XCircle, AlertCircle,
  Medal, Award, Target, Info
} from "lucide-react"

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
  organizerContact: string
  rules: string[]
  schedule?: Array<{
    date: string
    time: string
    event: string
    location: string
  }>
  prizes?: Array<{
    position: string
    prize: string
    amount: number
  }>
  participants?: Array<{
    id: number
    name: string
    team?: string
    registrationDate: string
    avatar?: string
  }>
}

const mockTournament: Tournament = {
  id: 1,
  name: "Spring Basketball Championship",
  sport: "Basketball",
  category: "5v5",
  venue: "Elite Sports Complex",
  location: "Mumbai",
  startDate: "2024-03-15",
  endDate: "2024-03-17",
  registrationDeadline: "2024-03-10",
  maxParticipants: 16,
  currentParticipants: 12,
  entryFee: 3500,
  prizePool: 75000,
  status: "open",
  difficulty: "Intermediate",
  image: "/placeholder.svg?height=400&width=800&text=Basketball+Tournament",
  description: "Join our exciting spring basketball championship! Teams compete in a thrilling 3-day tournament featuring the best amateur teams in the city. This tournament follows FIBA rules and provides an excellent opportunity for teams to showcase their skills in a competitive environment.",
  organizer: "Elite Sports Complex",
  organizerContact: "tournaments@elitesports.in",
  rules: [
    "Teams must have 5 players + 2 substitutes maximum",
    "All players must be 18+ years old with valid ID",
    "Standard FIBA rules apply throughout the tournament",
    "Tournament fee includes court rental, referees, and equipment",
    "Teams must arrive 30 minutes before scheduled games",
    "Unsportsmanlike conduct may result in disqualification",
    "Medical insurance is required for all participants",
    "Tournament organizers reserve the right to modify schedule if needed"
  ],
  schedule: [
    {
      date: "2024-03-15",
      time: "9:00 AM",
      event: "Opening Ceremony & Team Check-in",
      location: "Main Court"
    },
    {
      date: "2024-03-15",
      time: "10:00 AM - 6:00 PM",
      event: "Quarter Finals (8 Games)",
      location: "Courts A, B, C, D"
    },
    {
      date: "2024-03-16",
      time: "10:00 AM - 4:00 PM",
      event: "Semi Finals (4 Games)",
      location: "Courts A, B"
    },
    {
      date: "2024-03-17",
      time: "2:00 PM",
      event: "3rd Place Playoff",
      location: "Main Court"
    },
    {
      date: "2024-03-17",
      time: "4:00 PM",
      event: "Championship Final",
      location: "Main Court"
    },
    {
      date: "2024-03-17",
      time: "6:00 PM",
      event: "Awards Ceremony",
      location: "Main Court"
    }
  ],
  prizes: [
    { position: "1st Place", prize: "Championship Trophy + Cash Prize", amount: 30000 },
    { position: "2nd Place", prize: "Runner-up Trophy + Cash Prize", amount: 20000 },
    { position: "3rd Place", prize: "Bronze Trophy + Cash Prize", amount: 15000 },
    { position: "MVP", prize: "Most Valuable Player Award", amount: 5000 },
    { position: "Best Sportsmanship", prize: "Fair Play Award", amount: 5000 }
  ],
  participants: [
    { id: 1, name: "Thunder Bolts", team: "Team Captain: Mike Johnson", registrationDate: "2024-01-15", avatar: "/placeholder.svg?height=40&width=40&text=TB" },
    { id: 2, name: "City Slammers", team: "Team Captain: Sarah Davis", registrationDate: "2024-01-18", avatar: "/placeholder.svg?height=40&width=40&text=CS" },
    { id: 3, name: "Court Kings", team: "Team Captain: James Wilson", registrationDate: "2024-01-20", avatar: "/placeholder.svg?height=40&width=40&text=CK" },
    { id: 4, name: "Rim Rockers", team: "Team Captain: Lisa Chen", registrationDate: "2024-01-22", avatar: "/placeholder.svg?height=40&width=40&text=RR" },
  ]
}

export default function TournamentDetailsPage() {
  const [userData, setUserData] = useState<any>(null)
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const router = useRouter()
  const params = useParams()

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
    
    // In a real app, fetch tournament data based on params.id
    setTournament(mockTournament)
    
    // Check if user is already registered
    const registrations = JSON.parse(localStorage.getItem("tournamentRegistrations") || "[]")
    setIsRegistered(registrations.includes(parseInt(params.id as string)))
  }, [router, params.id])

  if (!userData || !tournament) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

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

  const getAvailableSpots = () => {
    return tournament.maxParticipants - tournament.currentParticipants
  }

  const registrationProgress = (tournament.currentParticipants / tournament.maxParticipants) * 100

  const isRegistrationOpen = () => {
    const now = new Date()
    const deadline = new Date(tournament.registrationDeadline)
    return tournament.status === "open" && now < deadline && getAvailableSpots() > 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <p className="text-gray-600 mt-1">Tournament Details & Registration</p>
        </div>
      </div>

      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="aspect-video md:aspect-[3/1] relative">
          <img
            src={tournament.image}
            alt={tournament.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getStatusColor(tournament.status)}>
                  {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                </Badge>
                <Badge className={getDifficultyColor(tournament.difficulty)}>
                  {tournament.difficulty}
                </Badge>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{tournament.name}</h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {tournament.venue}, {tournament.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Tournament Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{tournament.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sport:</span>
                        <span className="font-medium">{tournament.sport}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{tournament.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Organizer:</span>
                        <span className="font-medium">{tournament.organizer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact:</span>
                        <span className="font-medium">{tournament.organizerContact}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Entry Fee:</span>
                          <span className="font-bold text-green-600">₹{tournament.entryFee.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prize Pool:</span>
                          <span className="font-bold text-yellow-600">₹{tournament.prizePool.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty:</span>
                        <Badge className={getDifficultyColor(tournament.difficulty)}>
                          {tournament.difficulty}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={getStatusColor(tournament.status)}>
                          {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {tournament.prizes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      Prize Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tournament.prizes.map((prize, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Medal className="h-5 w-5 text-yellow-500" />
                            <div>
                              <span className="font-medium">{prize.position}</span>
                              <p className="text-sm text-gray-600">{prize.prize}</p>
                            </div>
                          </div>
                            <span className="font-bold text-green-600">₹{prize.amount.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Tournament Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tournament.schedule ? (
                    <div className="space-y-4">
                      {tournament.schedule.map((event, index) => (
                        <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                          <div className="flex flex-col items-center justify-center bg-blue-100 text-blue-800 rounded-lg p-3 min-w-[80px]">
                            <span className="text-xs font-medium">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="text-lg font-bold">{new Date(event.date).getDate()}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{event.time}</span>
                            </div>
                            <h4 className="font-semibold text-gray-900">{event.event}</h4>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Schedule will be announced soon.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Tournament Rules & Regulations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tournament.rules.map((rule, index) => (
                      <div key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-gray-700">{rule}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="participants" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Registered Participants ({tournament.currentParticipants}/{tournament.maxParticipants})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tournament.participants && tournament.participants.length > 0 ? (
                    <div className="space-y-3">
                      {tournament.participants.map((participant) => (
                        <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Avatar>
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>{participant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">{participant.name}</h4>
                            {participant.team && (
                              <p className="text-sm text-gray-600">{participant.team}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Registered</p>
                              <p className="text-xs text-gray-500">{new Date(participant.registrationDate).toLocaleDateString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No participants registered yet. Be the first to join!</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Registration Progress</span>
                  <span>{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                </div>
                <Progress value={registrationProgress} className="h-2" />
                <p className="text-xs text-gray-600">
                  {getAvailableSpots()} spot{getAvailableSpots() !== 1 ? 's' : ''} remaining
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Registration Deadline:</span>
                  <span className="text-sm font-medium">
                    {new Date(tournament.registrationDeadline).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Entry Fee:</span>
                  <span className="text-lg font-bold text-green-600">{formatInr(tournament.entryFee)}</span>
                </div>
              </div>

              {isRegistered ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">You're registered!</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Registration Details
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {isRegistrationOpen() ? (
                    <Link href={`/tournaments/${tournament.id}/register`}>
                      <Button className="w-full">
                        Register Now - {formatInr(tournament.entryFee)}
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      {tournament.status === "closed" && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="text-red-800 text-sm">Registration Closed</span>
                        </div>
                      )}
                      {getAvailableSpots() === 0 && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <span className="text-yellow-800 text-sm">Tournament Full</span>
                        </div>
                      )}
                      <Button disabled className="w-full">
                        Registration Unavailable
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tournament Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Tournament Dates</p>
                  <p className="text-xs text-gray-600">
                    {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{tournament.venue}</p>
                  <p className="text-xs text-gray-600">{tournament.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Participants</p>
                          <p className="text-xs text-gray-600">{tournament.currentParticipants} of {tournament.maxParticipants} registered</p>
                          <span className="text-xs text-gray-600">GST included in all fees</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Prize Pool</p>
                  <p className="text-xs text-gray-600">{formatInr(tournament.prizePool)} total prizes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
