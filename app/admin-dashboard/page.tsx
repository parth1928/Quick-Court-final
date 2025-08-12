"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { AdminManagement } from '@/components/admin/AdminManagement'
import { Users, Building2, Calendar, Activity, TrendingUp, Shield, MapPin, Clock, Eye, RefreshCw } from 'lucide-react'

interface StatBox { title:string; value:string; change:string; icon: any }

interface PendingVenue {
  _id: string
  name: string
  owner: {
    name: string
    email: string
    phone: string
  } | null
  shortLocation: string
  createdAt: string
  approvalStatus: string
  description: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pendingVenues, setPendingVenues] = useState<PendingVenue[]>([])
  const [venuesLoading, setVenuesLoading] = useState(true)

  // Fetch admin statistics from API
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        console.error('Failed to fetch stats')
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch pending venue registrations
  const fetchPendingVenues = async () => {
    try {
      setVenuesLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/admin/venues/approval?status=pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📋 Pending venues fetched:', data.venues?.length || 0)
        setPendingVenues(data.venues || [])
      } else {
        console.error('Failed to fetch pending venues:', response.status)
        setPendingVenues([])
      }
    } catch (error) {
      console.error('Error fetching pending venues:', error)
      setPendingVenues([])
    } finally {
      setVenuesLoading(false)
    }
  }

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) { router.replace('/login'); return }
    const u = JSON.parse(userStr)
    if (u.role !== 'admin') { router.replace('/login'); return }
    setUser(u)
    
    // Fetch real statistics and pending venues
    fetchStats()
    fetchPendingVenues()
  }, [router])

  if (!user || loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-gray-600'>Loading...</div>
      </div>
    )
  }

  // Icon mapping for API responses
  const iconMap: { [key: string]: any } = { 
    Users, Building2, Calendar, Activity, TrendingUp, Shield, MapPin, Clock, Eye, RefreshCw 
  };

  // Use real stats or fallback to default
  const rawStatData = stats?.summary || [
    { title:'Total Users', value:'Loading...', change:'...', icon:Users },
    { title:'Facility Owners', value:'Loading...', change:'...', icon:Building2 },
    { title:'Bookings (30d)', value:'Loading...', change:'...', icon:Calendar },
    { 
      title:'Pending Approvals', 
      value: venuesLoading ? 'Loading...' : pendingVenues.length.toString(), 
      change: venuesLoading ? '...' : `${pendingVenues.length} facilities`, 
      icon:Activity 
    },
  ];

  // Map string icon names to actual icon components
  const statData = rawStatData.map((s: StatBox) => ({
    ...s,
    icon: typeof s.icon === 'string' ? iconMap[s.icon] || Activity : s.icon
  }));

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Admin Dashboard</h1>
        <p className='text-gray-600 mt-1'>Platform overview & moderation tools</p>
      </div>

      <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        {statData.map((s: StatBox) => {
          const IconComponent = s.icon;
          return (
            <Card key={s.title} className='border-gray-200'>
              <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
                <CardTitle className='text-sm font-medium text-gray-600'>{s.title}</CardTitle>
                <IconComponent className='h-4 w-4 text-gray-400' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-900'>{s.value}</div>
                <div className='flex items-center text-xs text-gray-500 mt-1'><TrendingUp className='h-3 w-3 mr-1' />{s.change}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card className='border-gray-200'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className='text-gray-900 text-base'>Recent Registrations</CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={fetchPendingVenues}
                disabled={venuesLoading}
              >
                <RefreshCw className={`h-4 w-4 ${venuesLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/venue-approval')}
              >
                <Eye className="h-4 w-4 mr-1" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {venuesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">Loading pending registrations...</div>
              </div>
            ) : pendingVenues.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">No pending facility registrations</div>
              </div>
            ) : (
              pendingVenues.slice(0, 5).map((venue) => (
                <div key={venue._id} className='flex items-center justify-between border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors'>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className='font-medium text-gray-900'>{venue.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {venue.approvalStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className='text-xs text-gray-500'>
                        Owner: {venue.owner?.name || 'Unknown'}
                      </p>
                      {venue.shortLocation && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className='text-xs text-gray-500'>{venue.shortLocation}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className='text-xs text-gray-500'>
                        {new Date(venue.createdAt).toLocaleDateString()} at {new Date(venue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/venue-approval`)}
                    className="ml-3"
                  >
                    Review
                  </Button>
                </div>
              ))
            )}
            {pendingVenues.length > 5 && (
              <div className="text-center pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push('/venue-approval')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View {pendingVenues.length - 5} more pending registrations
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className='border-gray-200'>
          <CardHeader><CardTitle className='text-gray-900 text-base'>System Activity (Sample)</CardTitle></CardHeader>
          <CardContent className='space-y-4'>
            {[ 'New booking created', 'Venue approved', 'User registered', 'Owner added court' ].map((a,i)=>(
              <div key={i} className='flex items-center justify-between border border-gray-200 rounded-lg p-3'>
                <span className='text-sm text-gray-700'>{a}</span>
                <span className='text-xs text-gray-500'>Just now</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Admin Management Tabs */}
      <div className="mt-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="admin-stats">Admin Stats</TabsTrigger>
            <TabsTrigger value="admin-management">Admin Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Welcome to the admin dashboard. Use the tabs above to view admin statistics and manage admin users.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="admin-stats" className="mt-6">
            <AdminDashboard />
          </TabsContent>
          
          <TabsContent value="admin-management" className="mt-6">
            <AdminManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
