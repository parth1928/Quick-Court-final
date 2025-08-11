"use client"

import { useState, useEffect } from "react"
import { formatInr } from "@/lib/format"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { 
  Trophy, Plus, Edit, Trash2, Eye, Users, Calendar, 
  MapPin, DollarSign, CheckCircle, XCircle, AlertCircle,
  Filter, Search, Download, Mail, Settings
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
  status: "draft" | "open" | "closed" | "ongoing" | "completed" | "cancelled"
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Professional"
  description: string
  organizer: string
  createdDate: string
  isApproved: boolean
}

const mockTournaments: Tournament[] = [
  {
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
  entryFee: 5000,
  prizePool: 75000,
    status: "open",
    difficulty: "Intermediate",
    description: "Premier basketball tournament for amateur teams",
    organizer: "Elite Sports Complex",
    createdDate: "2024-01-15",
    isApproved: true
  },
  {
    id: 2,
    name: "Tennis Masters Open",
    sport: "Tennis",
    category: "Singles",
    venue: "Premier Tennis Club",
  location: "Chennai",
    startDate: "2024-04-01",
    endDate: "2024-04-07",
    registrationDeadline: "2024-03-25",
    maxParticipants: 32,
    currentParticipants: 28,
  entryFee: 3000,
  prizePool: 50000,
    status: "open",
    difficulty: "Advanced",
    description: "Professional-level tennis tournament",
    organizer: "Tennis Masters Association",
    createdDate: "2024-01-20",
    isApproved: true
  },
  {
    id: 3,
    name: "Youth Soccer League",
    sport: "Football",
    category: "11v11",
    venue: "Central Park Fields",
  location: "Hyderabad",
    startDate: "2024-05-01",
    endDate: "2024-07-31",
    registrationDeadline: "2024-04-20",
    maxParticipants: 24,
    currentParticipants: 8,
  entryFee: 6000,
  prizePool: 90000,
    status: "draft",
    difficulty: "Beginner",
    description: "Youth soccer league for ages 16-18",
    organizer: "Mumbai Youth Sports",
    createdDate: "2024-02-01",
    isApproved: false
  }
]

export default function TournamentManagementPage() {
  const [userData, setUserData] = useState<any>(null)
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments)
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>(mockTournaments)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
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
  // Allow only facility owners to manage tournaments now (admins no special UI)
  if (parsedUser.role !== "owner") {
      router.push("/user-home")
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
        tournament.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.organizer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(tournament => tournament.status === statusFilter)
    }

    setFilteredTournaments(filtered)
  }, [tournaments, searchTerm, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800"
      case "open": return "bg-green-100 text-green-800"
      case "closed": return "bg-red-100 text-red-800"
      case "ongoing": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-purple-100 text-purple-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleApproveTournament = (tournamentId: number) => {
    setTournaments(prev => prev.map(t => 
      t.id === tournamentId ? { ...t, isApproved: true, status: "open" as const } : t
    ))
    toast({
      title: "Tournament Approved",
      description: "The tournament has been approved and is now open for registration."
    })
  }

  const handleRejectTournament = (tournamentId: number) => {
    setTournaments(prev => prev.map(t => 
      t.id === tournamentId ? { ...t, status: "cancelled" as const } : t
    ))
    toast({
      title: "Tournament Rejected",
      description: "The tournament has been rejected and cancelled."
    })
  }

  const handleStatusChange = (tournamentId: number, newStatus: string) => {
    setTournaments(prev => prev.map(t => 
      t.id === tournamentId ? { ...t, status: newStatus as any } : t
    ))
    toast({
      title: "Status Updated",
      description: `Tournament status has been changed to ${newStatus}.`
    })
  }

  const handleDeleteTournament = (tournamentId: number) => {
    setTournaments(prev => prev.filter(t => t.id !== tournamentId))
    toast({
      title: "Tournament Deleted",
      description: "The tournament has been permanently deleted."
    })
  }

  const pendingApprovalTournaments = tournaments.filter(t => !t.isApproved && t.status === "draft")
  const activeTournaments = tournaments.filter(t => t.status === "open" || t.status === "ongoing")
  const completedTournaments = tournaments.filter(t => t.status === "completed")

  if (!userData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tournament Management</h1>
          <p className="text-gray-600 mt-1">Manage and oversee all tournaments</p>
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
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-xl font-bold text-yellow-600">{pendingApprovalTournaments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-xl font-bold text-green-600">{activeTournaments.length}</p>
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Participants</p>
                <p className="text-xl font-bold text-blue-600">
                  {tournaments.reduce((sum, t) => sum + t.currentParticipants, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Alert */}
      {pendingApprovalTournaments.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have {pendingApprovalTournaments.length} tournament{pendingApprovalTournaments.length !== 1 ? 's' : ''} pending approval.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tournaments</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval ({pendingApprovalTournaments.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeTournaments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTournaments.length})</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Search</Label>
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
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="all">
          <TournamentTable 
            tournaments={filteredTournaments} 
            onApprove={handleApproveTournament}
            onReject={handleRejectTournament}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteTournament}
            onEdit={(tournament) => {
              setSelectedTournament(tournament)
              setIsEditDialogOpen(true)
            }}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        <TabsContent value="pending">
          <TournamentTable 
            tournaments={pendingApprovalTournaments} 
            onApprove={handleApproveTournament}
            onReject={handleRejectTournament}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteTournament}
            onEdit={(tournament) => {
              setSelectedTournament(tournament)
              setIsEditDialogOpen(true)
            }}
            getStatusColor={getStatusColor}
            showApprovalActions={true}
          />
        </TabsContent>

        <TabsContent value="active">
          <TournamentTable 
            tournaments={activeTournaments} 
            onApprove={handleApproveTournament}
            onReject={handleRejectTournament}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteTournament}
            onEdit={(tournament) => {
              setSelectedTournament(tournament)
              setIsEditDialogOpen(true)
            }}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        <TabsContent value="completed">
          <TournamentTable 
            tournaments={completedTournaments} 
            onApprove={handleApproveTournament}
            onReject={handleRejectTournament}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteTournament}
            onEdit={(tournament) => {
              setSelectedTournament(tournament)
              setIsEditDialogOpen(true)
            }}
            getStatusColor={getStatusColor}
          />
        </TabsContent>
      </Tabs>

      {/* Create Tournament Dialog */}
      <CreateTournamentDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={(newTournament) => {
          setTournaments(prev => [...prev, newTournament])
          toast({
            title: "Tournament Created",
            description: "New tournament has been created successfully."
          })
        }}
      />

      {/* Edit Tournament Dialog */}
      {selectedTournament && (
        <EditTournamentDialog 
          tournament={selectedTournament}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={(updatedTournament) => {
            setTournaments(prev => prev.map(t => 
              t.id === updatedTournament.id ? updatedTournament : t
            ))
            toast({
              title: "Tournament Updated",
              description: "Tournament has been updated successfully."
            })
          }}
        />
      )}
    </div>
  )
}

function TournamentTable({ 
  tournaments, 
  onApprove, 
  onReject, 
  onStatusChange, 
  onDelete, 
  onEdit,
  getStatusColor,
  showApprovalActions = false 
}: {
  tournaments: Tournament[]
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onStatusChange: (id: number, status: string) => void
  onDelete: (id: number) => void
  onEdit: (tournament: Tournament) => void
  getStatusColor: (status: string) => string
  showApprovalActions?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tournament</TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments.map((tournament) => (
              <TableRow key={tournament.id}>
                <TableCell>
                  <div>
                    <h4 className="font-medium">{tournament.name}</h4>
                    <p className="text-sm text-gray-600">{tournament.organizer}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-medium">{tournament.sport}</span>
                    <p className="text-sm text-gray-600">{tournament.category}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-medium">{tournament.venue}</span>
                    <p className="text-sm text-gray-600">{tournament.location}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{new Date(tournament.startDate).toLocaleDateString()}</p>
                    <p className="text-gray-600">to {new Date(tournament.endDate).toLocaleDateString()}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span className="font-medium">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                    <p className="text-gray-600">{formatInr(tournament.entryFee)} fee</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(tournament.status)}>
                    {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {showApprovalActions && !tournament.isApproved && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onApprove(tournament.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReject(tournament.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(tournament)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(tournament.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {tournaments.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No tournaments found
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CreateTournamentDialog({ open, onOpenChange, onSuccess }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (tournament: Tournament) => void
}) {
  // Implementation for create tournament form would go here
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Tournament</DialogTitle>
          <DialogDescription>
            Create a new tournament for your facility.
          </DialogDescription>
        </DialogHeader>
        {/* Tournament creation form would go here */}
        <div className="p-4 text-center text-gray-500">
          Tournament creation form coming soon...
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Create Tournament
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditTournamentDialog({ tournament, open, onOpenChange, onSuccess }: {
  tournament: Tournament
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (tournament: Tournament) => void
}) {
  // Implementation for edit tournament form would go here
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Tournament</DialogTitle>
          <DialogDescription>
            Edit tournament details for {tournament.name}.
          </DialogDescription>
        </DialogHeader>
        {/* Tournament edit form would go here */}
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
