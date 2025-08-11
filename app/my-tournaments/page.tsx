"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, Calendar, MapPin, Users, Clock, 
  Award, Medal, Star, Eye, Download,
  CheckCircle, AlertCircle, Play
} from "lucide-react"

interface TournamentRegistration {
  id: number
  tournamentId: number
  tournamentName: string
  sport: string
  venue: string
  location: string
  startDate: string
  endDate: string
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  registrationDate: string
  entryFee: number
  participationType: "individual" | "team"
  teamName?: string
  position?: number
  prize?: number
  matchesPlayed?: number
  matchesWon?: number
  points?: number
  image: string
  nextMatch?: {
    date: string
    time: string
    opponent: string
    court: string
  }
}

const mockRegistrations: TournamentRegistration[] = [
  {
    id: 1,
    tournamentId: 1,
    tournamentName: "Spring Basketball Championship",
    sport: "Basketball",
    venue: "Elite Sports Complex",
    location: "Downtown NYC",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    status: "upcoming",
    registrationDate: "2024-02-01",
    entryFee: 150,
    participationType: "team",
    teamName: "Thunder Bolts",
    image: "/placeholder.svg?height=200&width=300&text=Basketball+Tournament",
    nextMatch: {
      date: "2024-03-15",
      time: "10:30 AM",
      opponent: "City Slammers",
      court: "Court A"
    }
  },
  {
    id: 2,
    tournamentId: 2,
    tournamentName: "Summer Tennis Open",
    sport: "Tennis",
    venue: "Premier Tennis Club",
    location: "Manhattan",
    startDate: "2024-02-01",
    endDate: "2024-02-07",
    status: "completed",
    registrationDate: "2024-01-15",
    entryFee: 75,
    participationType: "individual",
    position: 3,
    prize: 200,
    matchesPlayed: 5,
    matchesWon: 4,
    points: 85,
    image: "/placeholder.svg?height=200&width=300&text=Tennis+Tournament"
  },
  {
    id: 3,
    tournamentId: 3,
    tournamentName: "Volleyball League Championship",
    sport: "Volleyball",
    venue: "Sports Arena Plus",
    location: "Brooklyn",
    startDate: "2024-02-20",
    endDate: "2024-02-22",
    status: "ongoing",
    registrationDate: "2024-01-20",
    entryFee: 120,
    participationType: "team",
    teamName: "Net Ninjas",
    matchesPlayed: 3,
    matchesWon: 2,
    points: 75,
    image: "/placeholder.svg?height=200&width=300&text=Volleyball+Tournament",
    nextMatch: {
      date: "2024-02-21",
      time: "2:00 PM",
      opponent: "Spike Masters",
      court: "Court B"
    }
  }
]

export default function MyTournamentsPage() {
  const [userData, setUserData] = useState<any>(null)
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>(mockRegistrations)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-800"
      case "ongoing": return "bg-green-100 text-green-800"
      case "completed": return "bg-gray-100 text-gray-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2: return <Medal className="h-5 w-5 text-gray-400" />
      case 3: return <Award className="h-5 w-5 text-amber-600" />
      default: return <Star className="h-5 w-5 text-gray-400" />
    }
  }

  const upcomingTournaments = registrations.filter(r => r.status === "upcoming")
  const ongoingTournaments = registrations.filter(r => r.status === "ongoing")
  const completedTournaments = registrations.filter(r => r.status === "completed")

  if (!userData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tournaments</h1>
          <p className="text-gray-600 mt-1">Track your tournament registrations and performance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Tournaments</p>
            <p className="text-2xl font-bold text-blue-600">{registrations.length}</p>
          </div>
          <Link href="/tournaments">
            <Button>
              <Trophy className="h-4 w-4 mr-2" />
              Browse Tournaments
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-xl font-bold text-blue-600">{upcomingTournaments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ongoing</p>
                <p className="text-xl font-bold text-green-600">{ongoingTournaments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-bold text-purple-600">{completedTournaments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Winnings</p>
                <p className="text-xl font-bold text-yellow-600">
                  ${completedTournaments.reduce((sum, t) => sum + (t.prize || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tournaments</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingTournaments.length})</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing ({ongoingTournaments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTournaments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrations.map((registration) => (
              <TournamentCard key={registration.id} registration={registration} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingTournaments.map((registration) => (
              <TournamentCard key={registration.id} registration={registration} />
            ))}
          </div>
          {upcomingTournaments.length === 0 && (
            <EmptyState 
              title="No upcoming tournaments"
              description="You don't have any upcoming tournaments. Browse available tournaments to register."
              actionText="Browse Tournaments"
              actionHref="/tournaments"
            />
          )}
        </TabsContent>

        <TabsContent value="ongoing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ongoingTournaments.map((registration) => (
              <TournamentCard key={registration.id} registration={registration} />
            ))}
          </div>
          {ongoingTournaments.length === 0 && (
            <EmptyState 
              title="No ongoing tournaments"
              description="You don't have any active tournaments at the moment."
            />
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedTournaments.map((registration) => (
              <TournamentCard key={registration.id} registration={registration} />
            ))}
          </div>
          {completedTournaments.length === 0 && (
            <EmptyState 
              title="No completed tournaments"
              description="You haven't completed any tournaments yet."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TournamentCard({ registration }: { registration: TournamentRegistration }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-800"
      case "ongoing": return "bg-green-100 text-green-800"
      case "completed": return "bg-gray-100 text-gray-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2: return <Medal className="h-5 w-5 text-gray-400" />
      case 3: return <Award className="h-5 w-5 text-amber-600" />
      default: return <Star className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={registration.image}
          alt={registration.tournamentName}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className={getStatusColor(registration.status)}>
            {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
          </Badge>
        </div>
        {registration.position && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-white bg-opacity-90 rounded-full px-2 py-1">
            {getPositionIcon(registration.position)}
            <span className="text-xs font-medium">#{registration.position}</span>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{registration.tournamentName}</CardTitle>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {registration.venue}, {registration.location}
            </div>
          </div>
          <Trophy className="h-5 w-5 text-yellow-500 flex-shrink-0" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{registration.sport}</span>
          <span className="text-gray-600">
            {registration.participationType === "team" ? "Team" : "Individual"}
          </span>
        </div>

        {registration.teamName && (
          <div className="text-sm">
            <span className="text-gray-600">Team: </span>
            <span className="font-medium">{registration.teamName}</span>
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Date:
            </span>
            <span className="font-medium">
              {new Date(registration.startDate).toLocaleDateString()} - {new Date(registration.endDate).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Entry Fee:</span>
            <span className="font-medium text-green-600">${registration.entryFee}</span>
          </div>

          {registration.prize && (
            <div className="flex items-center justify-between">
              <span>Prize Won:</span>
              <span className="font-bold text-yellow-600">${registration.prize}</span>
            </div>
          )}
        </div>

        {/* Next Match Info */}
        {registration.nextMatch && registration.status === "upcoming" && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Next Match</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>vs {registration.nextMatch.opponent}</span>
                <span>{registration.nextMatch.court}</span>
              </div>
              <div className="flex justify-between">
                <span>{new Date(registration.nextMatch.date).toLocaleDateString()}</span>
                <span>{registration.nextMatch.time}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tournament Progress */}
        {registration.status === "ongoing" && registration.matchesPlayed && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Matches Won</span>
              <span>{registration.matchesWon}/{registration.matchesPlayed}</span>
            </div>
            <Progress value={(registration.matchesWon! / registration.matchesPlayed) * 100} className="h-2" />
            {registration.points && (
              <div className="text-center text-sm text-gray-600">
                {registration.points} points
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Link href={`/tournaments/${registration.tournamentId}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
          
          {registration.status === "completed" && (
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ title, description, actionText, actionHref }: {
  title: string
  description: string
  actionText?: string
  actionHref?: string
}) {
  return (
    <Card className="p-12 text-center">
      <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {actionText && actionHref && (
        <Link href={actionHref}>
          <Button>
            {actionText}
          </Button>
        </Link>
      )}
    </Card>
  )
}
