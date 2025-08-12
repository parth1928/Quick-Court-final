"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatInr } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Plus, Trophy, Calendar, Users } from "lucide-react"
import { CreateVenueModal } from "@/components/create-venue-modal"

interface VenueCard {
  _id: string; id?: string; name: string; shortLocation?: string; description?: string; startingPrice?: number; rating?: number; reviewCount?: number; sports?: string[]; images?: string[]; photos?: string[]; approvalStatus?: string; status?: string;
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
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [venues, setVenues] = useState<VenueCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Empty state for venues
  function EmptyVenues() {
    return (
      <div className="col-span-2 text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Plus className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No venues yet</h3>
        <p className="text-sm text-gray-600 mb-4">Add your first venue to start receiving bookings</p>
        <CreateVenueModal onSuccess={() => { fetchVenues(); }} />
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

  const fetchVenues = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log('No token available for fetch');
        router.push('/login');
        return;
      }

      console.log('Fetching venues for owner using dedicated API');
      
      // Use the dedicated owner facilities API
      const res = await fetch('/api/owner/facilities', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        console.error('Failed to fetch owner facilities:', res.status, res.statusText);
        const errorText = await res.text().catch(() => 'No response text');
        console.error('Error response:', errorText);
        return;
      }

      const data = await res.json();
      console.log('Owner facilities response:', data.venues?.length || 0, 'venues');
      
      // Normalize the venue data
      const normalized = (data.venues || []).map((v: any) => ({
        _id: v._id || v.id,
        name: v.name,
        description: v.description,
        shortLocation: v.location || (v.address ? `${v.address.city || ''}${v.address.city && v.address.state ? ', ' : ''}${v.address.state || ''}` : ''),
        startingPrice: v.startingPrice || v.price || 0,
        rating: v.rating || 0,
        reviewCount: v.reviewCount || v.reviews || 0,
        sports: v.sports || [],
        images: v.images || v.photos || [],
        photos: v.photos || v.images || [],
        approvalStatus: v.status || v.approvalStatus || 'pending',
        status: v.status || v.approvalStatus || 'pending',
      }));

      setVenues(normalized);

    } catch (e) { 
      console.error('Fetch venues error', e); 
    }
  }

  // Fetch venues & tournaments when user ready
  useEffect(() => {
    if (userData?.role === "owner") {
      fetchTournaments();
  fetchVenues();
    }
  }, [userData]);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking auth...");
        const token = localStorage.getItem("token");

        if (!token) {
          console.log("Missing token, redirecting to login");
          router.push("/login");
          return;
        }

        // Decode the JWT token to get user info
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const tokenData = JSON.parse(jsonPayload);
        console.log("Token data:", tokenData);

        const parsedUser = {
          _id: tokenData.userId,
          role: tokenData.role,
          email: tokenData.email,
          name: tokenData.name || 'Facility Owner'
        } as UserData;
        console.log("Parsed user:", { id: parsedUser._id, role: parsedUser.role });
        
        if (parsedUser.role !== "owner") {
          console.log("User is not an owner, redirecting to login");
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
          console.log("Token verification failed");
          throw new Error("Token verification failed");
        }

        console.log("Auth successful, setting user data");
        setUserData(parsedUser);
        
        // Immediately fetch venues after user data is set using owner facilities API
        const venuesRes = await fetch('/api/owner/facilities', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (venuesRes.ok) {
          const data = await venuesRes.json();
          console.log('Initial venues load:', data.venues?.length || 0, 'venues found');
          const normalized = (data.venues || []).map((v: any) => ({
            _id: v._id || v.id,
            name: v.name,
            description: v.description,
            shortLocation: v.location || (v.address ? `${v.address.city || ''}${v.address.city && v.address.state ? ', ' : ''}${v.address.state || ''}` : ''),
            startingPrice: v.startingPrice || v.price || 0,
            rating: v.rating || 0,
            reviewCount: v.reviewCount || v.reviews || 0,
            sports: v.sports || [],
            images: v.images || v.photos || [],
            photos: v.photos || v.images || [],
            approvalStatus: v.status || v.approvalStatus || 'pending',
            status: v.status || v.approvalStatus || 'pending',
          }));
          setVenues(normalized);
        }

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
          <p className="text-gray-600 mt-2">Manage your venues and tournaments</p>
        </div>
      </div>

      <Tabs defaultValue="venues" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="venues">Venues</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
        </TabsList>
        <TabsContent value="venues" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">My Venues</h2>
              <p className="text-gray-600 mt-1">Manage your venues & create new ones ({venues.length} venues)</p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-blue-600 mt-1">Owner ID: {userData?._id} | Using API: /api/owner/facilities</p>
              )}
            </div>
            <CreateVenueModal onSuccess={() => { fetchVenues(); }} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {venues.length === 0 ? (
              <EmptyVenues />
            ) : (
              venues.map(v => (
                <Card key={v._id || v.id} className="border-gray-200 overflow-hidden">
                  <img src={(v.images && v.images[0]) || (v.photos && v.photos[0]) || '/placeholder.jpg'} alt={v.name} className="w-full h-40 object-cover" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gray-900 text-base">{v.name}</CardTitle>
                      <Badge variant="secondary" className={`text-xs ${ (v.approvalStatus==='approved'||v.status==='approved') ? 'bg-green-100 text-green-800' : (v.approvalStatus==='pending'||v.status==='pending') ? 'bg-yellow-100 text-yellow-800' : (v.approvalStatus==='rejected'||v.status==='rejected') ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700' }`}>
                        {(v.approvalStatus || v.status || '').charAt(0).toUpperCase() + (v.approvalStatus || v.status || '').slice(1) || '—'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <p className="text-xs text-gray-600 line-clamp-2">{v.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {(v.sports || []).slice(0,4).map(s => (
                        <Badge key={s} variant="outline" className="text-[10px] px-1 py-0.5 border-gray-300">{s}</Badge>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>₹{v.startingPrice || 0} / hr</span>
                      <span>{v.rating || 0}★ ({v.reviewCount || 0})</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-gray-300 text-gray-700 bg-transparent"
                        onClick={() => router.push(`/venue-management/${v._id}`)}
                      >
                        Manage
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 border-gray-300 text-gray-700 bg-transparent" onClick={()=>{ /* future: view public venue */ }}>
                        View
                      </Button>
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
