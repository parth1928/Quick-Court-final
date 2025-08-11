"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { 
  Trophy, Plus, Calendar as CalendarIcon, MapPin, Users, DollarSign,
  Edit, Trash2, Eye, Mail, Phone, Clock, Award, Target, Info
} from "lucide-react"
import { format } from "date-fns"

interface HostedTournament {
  id: number
  name: string
  sport: string
  category: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants: number
  currentParticipants: number
  entryFee: number
  prizePool: number
  status: "draft" | "submitted" | "approved" | "open" | "ongoing" | "completed"
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Professional"
  courts: string[]
  amenities: string[]
  rules: string[]
  contactEmail: string
  contactPhone: string
  createdDate: string
  revenue?: number
}

const mockHostedTournaments: HostedTournament[] = [
  {
    id: 1,
    name: "Spring Basketball Championship",
    sport: "Basketball",
    category: "5v5",
    description: "Premier basketball tournament for amateur teams in our state-of-the-art facility.",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    registrationDeadline: "2024-03-10",
    maxParticipants: 16,
    currentParticipants: 12,
    entryFee: 3500,
    prizePool: 75000,
    status: "open",
    difficulty: "Intermediate",
    courts: ["Court A", "Court B", "Court C"],
    amenities: ["Locker Rooms", "Parking", "Cafeteria", "Medical Support"],
    rules: [
      "Teams must have 5 players + 2 substitutes maximum",
      "All players must be 18+ years old",
      "Standard FIBA rules apply",
      "Medical insurance required"
    ],
    contactEmail: "tournaments@elitesports.in",
    contactPhone: "+91 98765 43210",
    createdDate: "2024-01-15",
    revenue: 42000
  },
  {
    id: 2,
    name: "Summer Tennis Open",
    sport: "Tennis",
    category: "Singles",
    description: "Professional-level tennis tournament with certified courts and equipment.",
    startDate: "2024-06-01",
    endDate: "2024-06-07",
    registrationDeadline: "2024-05-20",
    maxParticipants: 32,
    currentParticipants: 8,
    entryFee: 2500,
    prizePool: 50000,
    status: "draft",
    difficulty: "Advanced",
    courts: ["Center Court", "Court 1", "Court 2"],
    amenities: ["Pro Shop", "Parking", "Refreshments"],
    rules: [
      "ITF rules and regulations",
      "Best of 3 sets format",
      "Players must bring their own rackets"
    ],
    contactEmail: "tennis@elitesports.in",
    contactPhone: "+91 87654 32109",
    createdDate: "2024-02-01"
  }
]

export default function TournamentHostingPage() {
  const [userData, setUserData] = useState<any>(null)
  const [tournaments, setTournaments] = useState<HostedTournament[]>(mockHostedTournaments)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<HostedTournament | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

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
  }, [router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800"
      case "submitted": return "bg-yellow-100 text-yellow-800"
      case "approved": return "bg-green-100 text-green-800"
      case "open": return "bg-blue-100 text-blue-800"
      case "ongoing": return "bg-purple-100 text-purple-800"
      case "completed": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const activeTournaments = tournaments.filter(t => t.status === "open" || t.status === "ongoing")
  const draftTournaments = tournaments.filter(t => t.status === "draft" || t.status === "submitted")
  const completedTournaments = tournaments.filter(t => t.status === "completed")
  const totalRevenue = tournaments.reduce((sum, t) => sum + (t.revenue || 0), 0)

  if (!userData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tournament Hosting</h1>
          <p className="text-gray-600 mt-1">Create and manage tournaments at your facility</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Tournament
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Tournaments</p>
                <p className="text-xl font-bold text-blue-600">{activeTournaments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-green-600">₹{totalRevenue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Participants</p>
                <p className="text-xl font-bold text-purple-600">
                  {tournaments.reduce((sum, t) => sum + t.currentParticipants, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-bold text-yellow-600">{completedTournaments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tournaments</TabsTrigger>
          <TabsTrigger value="active">Active ({activeTournaments.length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({draftTournaments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTournaments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <TournamentGrid tournaments={tournaments} getStatusColor={getStatusColor} onEdit={setSelectedTournament} />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <TournamentGrid tournaments={activeTournaments} getStatusColor={getStatusColor} onEdit={setSelectedTournament} />
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <TournamentGrid tournaments={draftTournaments} getStatusColor={getStatusColor} onEdit={setSelectedTournament} />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <TournamentGrid tournaments={completedTournaments} getStatusColor={getStatusColor} onEdit={setSelectedTournament} />
        </TabsContent>
      </Tabs>

      {/* Create Tournament Dialog */}
      <CreateTournamentDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={(newTournament) => {
          setTournaments(prev => [...prev, { ...newTournament, id: Date.now() }])
          toast({
            title: "Tournament Created",
            description: "Your tournament has been created and submitted for approval."
          })
        }}
      />

      {/* Edit Tournament Dialog */}
      {selectedTournament && (
        <EditTournamentDialog 
          tournament={selectedTournament}
          open={!!selectedTournament}
          onOpenChange={(open) => !open && setSelectedTournament(null)}
          onSuccess={(updatedTournament) => {
            setTournaments(prev => prev.map(t => 
              t.id === updatedTournament.id ? updatedTournament : t
            ))
            setSelectedTournament(null)
            toast({
              title: "Tournament Updated",
              description: "Tournament details have been updated successfully."
            })
          }}
        />
      )}
    </div>
  )
}

function TournamentGrid({ tournaments, getStatusColor, onEdit }: {
  tournaments: HostedTournament[]
  getStatusColor: (status: string) => string
  onEdit: (tournament: HostedTournament) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tournaments.map((tournament) => (
        <Card key={tournament.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-video relative bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
            <div className="absolute top-4 right-4">
              <Badge className={getStatusColor(tournament.status)}>
                {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
              </Badge>
            </div>
            <div className="absolute bottom-4 left-6 right-6">
              <h3 className="text-xl font-bold mb-2">{tournament.name}</h3>
              <div className="flex items-center gap-4 text-sm opacity-90">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  {new Date(tournament.startDate).toLocaleDateString('en-IN')}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {tournament.currentParticipants}/{tournament.maxParticipants}
                </span>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{tournament.sport}</span>
                <span className="text-gray-600">{tournament.category}</span>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2">{tournament.description}</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Entry Fee:</span>
                <span className="font-medium text-green-600">₹{tournament.entryFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Prize Pool:</span>
                <span className="font-medium text-yellow-600">₹{tournament.prizePool.toLocaleString('en-IN')}</span>
              </div>
              {tournament.revenue && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-bold text-blue-600">₹{tournament.revenue.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Registration Deadline:</span>
                <span className="font-medium">{new Date(tournament.registrationDeadline).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => onEdit(tournament)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {tournaments.length === 0 && (
        <Card className="col-span-full p-12 text-center">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tournaments yet</h3>
          <p className="text-gray-600">Create your first tournament to start hosting events at your facility.</p>
        </Card>
      )}
    </div>
  )
}

function CreateTournamentDialog({ open, onOpenChange, onSuccess }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (tournament: Omit<HostedTournament, 'id'>) => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    category: "",
    description: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    maxParticipants: "",
    entryFee: "",
    prizePool: "",
    difficulty: "",
    contactEmail: "",
    contactPhone: "",
    rules: [""]
  })

  const handleSubmit = () => {
    const newTournament: Omit<HostedTournament, 'id'> = {
      ...formData,
      maxParticipants: parseInt(formData.maxParticipants),
      entryFee: parseInt(formData.entryFee),
      prizePool: parseInt(formData.prizePool),
      currentParticipants: 0,
      status: "draft",
      courts: ["Court A", "Court B"],
      amenities: ["Parking", "Locker Rooms"],
      rules: formData.rules.filter(rule => rule.trim()),
      createdDate: new Date().toISOString(),
      difficulty: formData.difficulty as any
    }
    
    onSuccess(newTournament)
    onOpenChange(false)
    
    // Reset form
    setFormData({
      name: "",
      sport: "",
      category: "",
      description: "",
      startDate: "",
      endDate: "",
      registrationDeadline: "",
      maxParticipants: "",
      entryFee: "",
      prizePool: "",
      difficulty: "",
      contactEmail: "",
      contactPhone: "",
      rules: [""]
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Tournament</DialogTitle>
          <DialogDescription>
            Create a new tournament to host at your facility.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Spring Basketball Championship"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sport">Sport *</Label>
              <Select 
                value={formData.sport} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, sport: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basketball">Basketball</SelectItem>
                  <SelectItem value="Tennis">Tennis</SelectItem>
                  <SelectItem value="Volleyball">Volleyball</SelectItem>
                  <SelectItem value="Badminton">Badminton</SelectItem>
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Cricket">Cricket</SelectItem>
                  <SelectItem value="Table Tennis">Table Tennis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., 5v5, Singles, Doubles"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your tournament..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationDeadline">Registration Deadline *</Label>
              <Input
                id="registrationDeadline"
                type="date"
                value={formData.registrationDeadline}
                onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants *</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
                placeholder="16"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entryFee">Entry Fee (₹) *</Label>
              <Input
                id="entryFee"
                type="number"
                value={formData.entryFee}
                onChange={(e) => setFormData(prev => ({ ...prev, entryFee: e.target.value }))}
                placeholder="2500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prizePool">Prize Pool (₹)</Label>
              <Input
                id="prizePool"
                type="number"
                value={formData.prizePool}
                onChange={(e) => setFormData(prev => ({ ...prev, prizePool: e.target.value }))}
                placeholder="50000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="tournaments@yourfacility.in"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Tournament
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditTournamentDialog({ tournament, open, onOpenChange, onSuccess }: {
  tournament: HostedTournament
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (tournament: HostedTournament) => void
}) {
  // Similar implementation to CreateTournamentDialog but pre-filled with tournament data
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Tournament</DialogTitle>
          <DialogDescription>
            Edit details for {tournament.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 text-center text-gray-500">
          Tournament edit form coming soon...
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
