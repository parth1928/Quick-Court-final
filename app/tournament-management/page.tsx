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
import { Plus, Users, MapPin, Calendar as CalendarIcon, Clock, IndianRupee, Trophy } from "lucide-react"

const existingTournaments = [
  {
    id: 1,
    name: "Elite Basketball Championship",
    sport: "Basketball",
    venue: "Elite Sports Complex",
    startDate: "2024-02-15",
    endDate: "2024-02-18",
    registrationDeadline: "2024-02-10",
    prizePool: 50000,
    teamsRegistered: 8,
    maxTeams: 16,
    entryFee: 2000,
    createdBy: "Tournament Organizer",
    status: "Open",
    format: "Single Elimination",
  },
  {
    id: 2,
    name: "Premier Tennis Open",
    sport: "Tennis",
    venue: "Premier Tennis Club",
    startDate: "2024-02-20",
    endDate: "2024-02-22",
    registrationDeadline: "2024-02-15",
    prizePool: 25000,
    teamsRegistered: 12,
    maxTeams: 32,
    entryFee: 1500,
    createdBy: "Tennis Federation",
    status: "Open",
    format: "Round Robin",
  },
  {
    id: 3,
    name: "Community Volleyball League",
    sport: "Volleyball",
    venue: "Community Recreation Center",
    startDate: "2024-02-08",
    endDate: "2024-02-10",
    registrationDeadline: "2024-02-05",
    prizePool: 15000,
    teamsRegistered: 12,
    maxTeams: 12,
    entryFee: 1000,
    createdBy: "Sports Committee",
    status: "Full",
    format: "Double Elimination",
  },
]

const sportsOptions = ["Basketball", "Tennis", "Volleyball", "Badminton", "Football", "Table Tennis", "Cricket"]
const venueOptions = [
  "Elite Sports Complex",
  "Premier Tennis Club", 
  "Community Recreation Center",
  "Urban Basketball Arena",
  "Fitness & Sports Hub",
  "Sports Stadium",
  "Athletic Center"
]

const formatOptions = ["Single Elimination", "Double Elimination", "Round Robin", "Swiss System"]

export default function TournamentManagementPage() {
  const [userData, setUserData] = useState<any>(null)
  const [tournaments, setTournaments] = useState(existingTournaments)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(new Date())
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(new Date())
  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    venue: "",
    prizePool: "",
    maxTeams: "",
    entryFee: "",
    format: "",
  })
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(user)
    if (parsedUser.userType !== "facility") {
      router.push("/login")
      return
    }

    setUserData(parsedUser)
  }, [router])

  const handleCreateTournament = () => {
    if (!selectedStartDate || !selectedEndDate || !formData.name || !formData.sport || !formData.venue || !formData.maxTeams || !formData.format) {
      return
    }

    const registrationDeadline = new Date(selectedStartDate)
    registrationDeadline.setDate(registrationDeadline.getDate() - 3) // 3 days before start

    const newTournament = {
      id: tournaments.length + 1,
      name: formData.name,
      sport: formData.sport,
      venue: formData.venue,
      startDate: selectedStartDate?.toISOString().split('T')[0] || "",
      endDate: selectedEndDate?.toISOString().split('T')[0] || "",
      registrationDeadline: registrationDeadline.toISOString().split('T')[0],
      prizePool: Number.parseInt(formData.prizePool) || 0,
      teamsRegistered: 0,
      maxTeams: Number.parseInt(formData.maxTeams),
      entryFee: Number.parseInt(formData.entryFee) || 0,
      createdBy: userData?.name || "You",
      status: "Open",
      format: formData.format,
    }

    setTournaments([newTournament, ...tournaments])
    setFormData({ name: "", sport: "", venue: "", prizePool: "", maxTeams: "", entryFee: "", format: "" })
    setSelectedStartDate(new Date())
    setSelectedEndDate(new Date())
    setIsCreateModalOpen(false)
  }

  const handleRegisterTeam = (tournamentId: number) => {
    setTournaments(tournaments.map(tournament => 
      tournament.id === tournamentId && tournament.teamsRegistered < tournament.maxTeams
        ? { 
            ...tournament, 
            teamsRegistered: tournament.teamsRegistered + 1,
            status: tournament.teamsRegistered + 1 === tournament.maxTeams ? "Full" : "Open"
          }
        : tournament
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
          <h1 className="text-3xl font-bold text-gray-900">Tournament Management</h1>
          <p className="text-gray-600 mt-2">Create and manage tournaments for your facility</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="border-gray-200 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Create New Tournament</DialogTitle>
              <DialogDescription className="text-gray-600">
                Set up a tournament and manage team registrations.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Tournament Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Elite Basketball Championship"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="border-gray-300"
                />
              </div>

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

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700">Start Date</Label>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedStartDate}
                      onSelect={setSelectedStartDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border border-gray-300"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">End Date</Label>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedEndDate}
                      onSelect={setSelectedEndDate}
                      disabled={(date) => date < new Date() || (selectedStartDate ? date < selectedStartDate : false)}
                      className="rounded-md border border-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxTeams" className="text-gray-700">Maximum Teams</Label>
                  <Input
                    id="maxTeams"
                    type="number"
                    placeholder="e.g., 16"
                    value={formData.maxTeams}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxTeams: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="format" className="text-gray-700">Tournament Format</Label>
                  <Select value={formData.format} onValueChange={(value) => setFormData(prev => ({ ...prev, format: value }))}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {formatOptions.map((format) => (
                        <SelectItem key={format} value={format}>
                          {format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entryFee" className="text-gray-700">Entry Fee (Optional)</Label>
                  <div className="relative">
                    <IndianRupee className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      id="entryFee"
                      type="number"
                      placeholder="0"
                      value={formData.entryFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, entryFee: e.target.value }))}
                      className="border-gray-300 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prizePool" className="text-gray-700">Prize Pool (Optional)</Label>
                  <div className="relative">
                    <IndianRupee className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      id="prizePool"
                      type="number"
                      placeholder="0"
                      value={formData.prizePool}
                      onChange={(e) => setFormData(prev => ({ ...prev, prizePool: e.target.value }))}
                      className="border-gray-300 pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="border-gray-300 text-gray-700">
                  Cancel
                </Button>
                <Button onClick={handleCreateTournament} className="bg-gray-900 hover:bg-gray-800 text-white">
                  Create Tournament
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Tournaments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Available Tournaments</h2>
        <div className="grid gap-6">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{tournament.name}</h3>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {tournament.sport}
                      </Badge>
                      <Badge
                        variant={tournament.status === "Open" ? "default" : "secondary"}
                        className={
                          tournament.status === "Open" 
                            ? "bg-gray-900 text-white" 
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {tournament.status}
                      </Badge>
                      {tournament.prizePool > 0 && (
                        <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
                          <Trophy className="h-3 w-3 mr-1" />
                          ₹{tournament.prizePool.toLocaleString()}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{tournament.venue}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>{new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{tournament.teamsRegistered}/{tournament.maxTeams} teams</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Format: {tournament.format}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div>
                        Registration Deadline: <span className="font-medium">{new Date(tournament.registrationDeadline).toLocaleDateString()}</span>
                      </div>
                      {tournament.entryFee > 0 && (
                        <div>
                          Entry Fee: <span className="font-medium">₹{tournament.entryFee}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                      Organized by: <span className="font-medium">{tournament.createdBy}</span>
                    </div>
                  </div>

                  <div className="ml-4">
                    <Button
                      onClick={() => handleRegisterTeam(tournament.id)}
                      disabled={tournament.status === "Full" || tournament.createdBy === userData?.name}
                      className={
                        tournament.status === "Full" || tournament.createdBy === userData?.name
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      }
                    >
                      {tournament.createdBy === userData?.name ? "Your Tournament" : 
                       tournament.status === "Full" ? "Tournament Full" : "Register Team"}
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
