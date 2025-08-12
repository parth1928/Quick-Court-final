"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatInr } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Plus, Trophy, Calendar, Users, DollarSign } from "lucide-react"
import { CreateFacilityModal } from "@/components/create-facility-modal"

interface Facility {
  _id: string;
  name: string;
  location: string;
  sports: string[];
  status: string;
  rating: number;
  totalBookings: number;
  monthlyRevenue: number;
  image: string;
}

interface Tournament {
  _id: string;
  name: string;
  sport: string;
  category?: string;
  venue?: string;
  location?: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  participants: any[];
  entryFee: number;
  prizePool: number;
  status: string;
  difficulty: string;
  description?: string;
  organizer?: string;
  organizerContact?: string;
  createdBy: string;
  createdAt: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function MyFacilitiesPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function EmptyState() {
    return (
      <div className="col-span-2 text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Plus className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No facilities yet</h3>
        <p className="text-sm text-gray-600 mb-4">Get started by adding your first sports facility</p>
        <CreateFacilityModal onSuccess={() => {
          fetchFacilities();
        }} />
      </div>
    );
  }

  // Function to fetch tournaments
  const fetchTournaments = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token || !userData?._id) {
        return;
      }

      const response = await fetch(`/api/tournaments?createdBy=${userData._id}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tournaments");
      }

      const data = await response.json();
      setTournaments(data.tournaments || []);
    } catch (error: any) {
      console.error("Error fetching tournaments:", error);
    }
  };

  // Function to fetch facilities
  const fetchFacilities = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch("/api/facilities", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid auth data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch facilities");
      }

      const data = await response.json();
      setFacilities(data);
    } catch (error: any) {
      console.error("Error fetching facilities:", error);
      setError(error.message);
      if (error.message.includes("Authentication")) {
        router.push("/login");
      }
    }
  };

  // Fetch facilities and tournaments on mount and when user data changes
  useEffect(() => {
    if (userData?.role === "owner") {
      fetchFacilities();
      fetchTournaments();
    }
  }, [userData]);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!userStr || !token) {
          router.push("/login");
          return;
        }

        const parsedUser = JSON.parse(userStr) as UserData;
        
        if (parsedUser.role !== "owner") {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        // Verify token is still valid
        const response = await fetch("/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Token verification failed");
        }

        setUserData(parsedUser);
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (!userData || isLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">My Business</h1>
          <p className="text-gray-600 mt-2">Manage your sports facilities and tournaments</p>
        </div>
      </div>

      <Tabs defaultValue="facilities" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="facilities" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">My Facilities</h2>
              <p className="text-gray-600 mt-1">Manage your sports facilities</p>
            </div>
            <CreateFacilityModal onSuccess={() => {
              fetchFacilities();
            }} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {facilities.length === 0 ? (
              <EmptyState />
            ) : (
              facilities.map((facility) => (
                <Card key={facility._id} className="border-gray-200 overflow-hidden">
                  <img 
                    src={facility.image || "/placeholder.svg"} 
                    alt={facility.name} 
                    className="w-full h-48 object-cover"
                  />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gray-900">{facility.name}</CardTitle>
                      <Badge
                        variant="secondary"
                        className={facility.status === "Active" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}
                      >
                        {facility.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{facility.location}</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {facility.sports.map((sport) => (
                          <Badge 
                            key={sport} 
                            variant="outline" 
                            className="text-xs border-gray-300 text-gray-700"
                          >
                            {sport}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-gray-900">{facility.rating.toFixed(1)}</div>
                          <div className="text-xs text-gray-600">Rating</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">{facility.totalBookings}</div>
                          <div className="text-xs text-gray-600">Bookings</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">{formatInr(facility.monthlyRevenue)}</div>
                          <div className="text-xs text-gray-600">Revenue</div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-gray-300 text-gray-700 bg-transparent"
                          onClick={() => router.push(`/facility-management/${facility._id}`)}
                        >
                          Manage
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-gray-300 text-gray-700 bg-transparent"
                          onClick={() => router.push(`/facility-dashboard/${facility._id}`)}
                        >
                          View Stats
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">My Tournaments</h2>
              <p className="text-gray-600 mt-1">Tournaments you've created and hosted</p>
            </div>
            <Button onClick={() => router.push('/tournament-hosting')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {tournaments.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No tournaments yet</h3>
                <p className="text-sm text-gray-600 mb-4">Start hosting tournaments to attract more players</p>
                <Button onClick={() => router.push('/tournament-hosting')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tournament
                </Button>
              </div>
            ) : (
              tournaments.map((tournament) => (
                <Card key={tournament._id} className="border-gray-200 overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gray-900">{tournament.name}</CardTitle>
                      <Badge
                        variant="secondary"
                        className={
                          tournament.status === "open" ? "bg-green-100 text-green-800" :
                          tournament.status === "ongoing" ? "bg-blue-100 text-blue-800" :
                          tournament.status === "completed" ? "bg-gray-100 text-gray-800" :
                          tournament.status === "draft" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-700"
                        }
                      >
                        {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Trophy className="h-4 w-4 mr-2" />
                          <span>{tournament.sport}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{tournament.location || tournament.venue || 'TBA'}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{tournament.participants.length}/{tournament.maxParticipants}</span>
                        </div>
                      </div>

                      {tournament.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{tournament.description}</p>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-gray-900">{formatInr(tournament.entryFee)}</div>
                          <div className="text-xs text-gray-600">Entry Fee</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">{formatInr(tournament.prizePool)}</div>
                          <div className="text-xs text-gray-600">Prize Pool</div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-gray-300 text-gray-700 bg-transparent"
                          onClick={() => router.push(`/tournament-management/${tournament._id}`)}
                        >
                          Manage
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-gray-300 text-gray-700 bg-transparent"
                          onClick={() => router.push(`/tournaments/${tournament._id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
