"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatInr } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus } from "lucide-react"
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

function EmptyState() {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Plus className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No facilities yet</h3>
      <p className="text-sm text-gray-600 mb-4">Get started by adding your first sports facility</p>
      <CreateFacilityModal onSuccess={() => {
        // Refresh facilities list
        const token = localStorage.getItem("token")
        if (!token) return

        fetch("/api/facilities", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then((res) => res.json())
          .then((data) => {
            if (data) {
              setFacilities(data)
            }
          })
          .catch(console.error)
      }} />
    </div>
  );
}

export default function MyFacilitiesPage() {
  const [userData, setUserData] = useState<any>(null)
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Fetch facilities
  useEffect(() => {
    async function fetchFacilities() {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const response = await fetch("/api/facilities", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()
        
        if (response.ok) {
          setFacilities(data)
        } else {
          console.error("Error fetching facilities:", data.error)
        }
      } catch (error) {
        console.error("Error fetching facilities:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFacilities()
  }, [])

  // Auth check
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
          <h1 className="text-3xl font-bold text-gray-900">My Facilities</h1>
          <p className="text-gray-600 mt-2">Manage your sports facilities</p>
        </div>
        <CreateFacilityModal onSuccess={() => {
          // Refresh facilities list
          const token = localStorage.getItem("token")
          if (!token) return

          fetch("/api/facilities", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
            .then((res) => res.json())
            .then((data) => {
              if (data) {
                setFacilities(data)
              }
            })
            .catch(console.error)
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
    </div>
  )
}
