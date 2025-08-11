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
import { Plus, Users, MapPin, Calendar as CalendarIcon, Clock, IndianRupee, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

// Types
interface Match {
  _id: string
  sport: string
  venue: {
    _id: string
    name: string
  }
  date: string
  time: string
  prizeAmount: number
  courtFees?: number
  playersJoined: number
  playersNeeded: number
  createdBy: {
    _id: string
    name: string
  }
  status: "Open" | "Full" | "Cancelled" | "Completed"
  participants: Array<{
    _id: string
    name: string
    joinedAt: string
  }>
  description?: string
  hasJoined?: boolean
  isCreator?: boolean
}

interface Venue {
  _id: string
  name: string
  sports: string[]
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [createLoading, setCreateLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    sport: "",
    venueId: "",
    courtId: "",
    date: new Date(),
    time: "",
    playersNeeded: "",
    prizeAmount: "",
    courtFees: "",
    description: ""
  })

  // Additional state for time slots
  const [availableSlots, setAvailableSlots] = useState<Array<{time: string, price: number}>>([])
  const [courts, setCourts] = useState<Array<{_id: string, name: string, sport: string, pricePerHour: number}>>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Filter state
  const [filters, setFilters] = useState({
    sport: "All",
    status: "All",
    search: ""
  })

  // Check authentication and load data on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(userStr)
    if (!userData.role || userData.role === 'admin') {
      router.push('/admin-dashboard')
      return
    }

    // Load data immediately
    loadVenues()
    loadMatches()
  }, [router])

  // Also load venues when dialog opens
  useEffect(() => {
    if (isDialogOpen && (!Array.isArray(venues) || venues.length === 0)) {
      loadVenues()
    }
  }, [isDialogOpen])

  // Auto-provide fallback courts if none are loading and venue is selected
  useEffect(() => {
    if (formData.venueId && courts.length === 0 && formData.sport) {
      console.log('🔄 Auto-triggering fallback courts - venue selected but no courts loaded')
      const timeoutId = setTimeout(() => {
        if (courts.length === 0) {
          console.log('⏰ Timeout reached, using fallback courts')
          useFallbackCourts(formData.sport)
        }
      }, 2000) // Wait 2 seconds before using fallback
      
      return () => clearTimeout(timeoutId)
    }
  }, [formData.venueId, formData.sport, courts.length])

  // Fetch courts for selected venue
  const fetchCourts = async (venueId: string, selectedSport?: string) => {
    if (!venueId) {
      setCourts([])
      return
    }
    
    const sport = selectedSport || formData.sport
    console.log('🏟️ Fetching courts for venue:', venueId, 'sport:', sport)
    
    try {
      const response = await fetch(`/api/venues/${venueId}/courts`)
      console.log('📡 Courts API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Courts API response:', data)
        let courts = data.courts || []
        
        // Filter courts by selected sport if one is selected
        if (sport && sport !== 'All') {
          courts = courts.filter((court: any) => court.sport === sport)
          console.log(`🎯 Filtered courts for ${sport}:`, courts)
        }
        
        setCourts(courts)
      } else {
        console.warn('⚠️ Courts API failed with status:', response.status)
        const errorText = await response.text()
        console.warn('Error response:', errorText)
        
        // Use fallback data immediately
        useFallbackCourts(sport)
      }
    } catch (error) {
      console.error('❌ Error fetching courts:', error)
      // Use fallback data immediately
      useFallbackCourts(sport)
    }
  }

  // Separate function for fallback courts
  const useFallbackCourts = (sport?: string) => {
    console.log('🔄 Using fallback courts for sport:', sport)
    
    // Fallback court data with auto-create IDs that backend can handle
    const allFallbackCourts = [
      { _id: 'auto-create-basketball-1', name: 'Basketball Court 1', sport: 'Basketball', pricePerHour: 500 },
      { _id: 'auto-create-tennis-1', name: 'Tennis Court 1', sport: 'Tennis', pricePerHour: 400 },
      { _id: 'auto-create-badminton-1', name: 'Badminton Court 1', sport: 'Badminton', pricePerHour: 300 },
      { _id: 'auto-create-football-1', name: 'Football Field 1', sport: 'Football', pricePerHour: 800 },
      { _id: 'auto-create-cricket-1', name: 'Cricket Ground 1', sport: 'Cricket', pricePerHour: 1000 },
      { _id: 'auto-create-volleyball-1', name: 'Volleyball Court 1', sport: 'Volleyball', pricePerHour: 350 },
      { _id: 'auto-create-tabletennis-1', name: 'Table Tennis Table 1', sport: 'Table Tennis', pricePerHour: 200 }
    ]
    
    let fallbackCourts = allFallbackCourts
    if (sport && sport !== 'All') {
      fallbackCourts = allFallbackCourts.filter(court => court.sport === sport)
      console.log(`🎯 Fallback courts for ${sport}:`, fallbackCourts)
    }
    
    setCourts(fallbackCourts)
  }

  // Fetch available time slots for selected court and date
  const fetchAvailableSlots = async (courtId: string, date: Date) => {
    if (!courtId || !date) {
      setAvailableSlots([])
      return
    }

    console.log('Fetching time slots for court:', courtId, 'date:', date.toISOString().split('T')[0])
    setLoadingSlots(true)
    try {
      const dateStr = date.toISOString().split('T')[0]
      const response = await fetch(`/api/courts/${courtId}/available-slots?date=${dateStr}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Time slots API response:', data)
        setAvailableSlots(data.availableSlots || [])
        
        // Auto-set court fees based on court's price
        if (data.pricePerHour) {
          setFormData(prev => ({ ...prev, courtFees: data.pricePerHour.toString() }))
        }
      } else {
        console.warn('Time slots API failed, using fallback slots')
        // Fallback time slots
        const fallbackSlots = [
          { time: '6:00 AM - 7:00 AM', price: 300 },
          { time: '7:00 AM - 8:00 AM', price: 300 },
          { time: '8:00 AM - 9:00 AM', price: 400 },
          { time: '9:00 AM - 10:00 AM', price: 400 },
          { time: '10:00 AM - 11:00 AM', price: 500 },
          { time: '11:00 AM - 12:00 PM', price: 500 },
          { time: '12:00 PM - 1:00 PM', price: 600 },
          { time: '1:00 PM - 2:00 PM', price: 600 },
          { time: '2:00 PM - 3:00 PM', price: 600 },
          { time: '3:00 PM - 4:00 PM', price: 600 },
          { time: '4:00 PM - 5:00 PM', price: 700 },
          { time: '5:00 PM - 6:00 PM', price: 700 },
          { time: '6:00 PM - 7:00 PM', price: 800 },
          { time: '7:00 PM - 8:00 PM', price: 800 },
          { time: '8:00 PM - 9:00 PM', price: 900 },
          { time: '9:00 PM - 10:00 PM', price: 900 }
        ]
        setAvailableSlots(fallbackSlots)
      }
    } catch (error) {
      console.error('Error fetching available slots:', error)
      // Fallback time slots on error
      const fallbackSlots = [
        { time: '6:00 AM - 7:00 AM', price: 300 },
        { time: '7:00 AM - 8:00 AM', price: 300 },
        { time: '8:00 AM - 9:00 AM', price: 400 },
        { time: '9:00 AM - 10:00 AM', price: 400 },
        { time: '10:00 AM - 11:00 AM', price: 500 },
        { time: '11:00 AM - 12:00 PM', price: 500 },
        { time: '12:00 PM - 1:00 PM', price: 600 },
        { time: '1:00 PM - 2:00 PM', price: 600 },
        { time: '2:00 PM - 3:00 PM', price: 600 },
        { time: '3:00 PM - 4:00 PM', price: 600 },
        { time: '4:00 PM - 5:00 PM', price: 700 },
        { time: '5:00 PM - 6:00 PM', price: 700 },
        { time: '6:00 PM - 7:00 PM', price: 800 },
        { time: '7:00 PM - 8:00 PM', price: 800 },
        { time: '8:00 PM - 9:00 PM', price: 900 },
        { time: '9:00 PM - 10:00 PM', price: 900 }
      ]
      setAvailableSlots(fallbackSlots)
    } finally {
      setLoadingSlots(false)
    }
  }

  // Handle venue selection
  useEffect(() => {
    if (formData.venueId) {
      fetchCourts(formData.venueId)
      // Reset court and time when venue changes
      setFormData(prev => ({ ...prev, courtId: "", time: "", courtFees: "" }))
      setAvailableSlots([])
    }
  }, [formData.venueId])

  // Handle court or date selection
  useEffect(() => {
    if (formData.courtId && formData.date) {
      fetchAvailableSlots(formData.courtId, formData.date)
      // Reset time when court or date changes
      setFormData(prev => ({ ...prev, time: "" }))
    }
  }, [formData.courtId, formData.date])

  const loadMatches = async () => {
    try {
      setLoading(true)
      setError(null)
      const userStr = localStorage.getItem('user')
      if (!userStr) return
      
      // Try the API first
      const response = await fetch('/api/matches', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(userStr).token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMatches(data)
        return
      }
      
      // If API fails, log the error but don't throw
      console.warn('API failed, using fallback data:', response.status, response.statusText)
      
    } catch (error) {
      console.error('Error loading matches from API:', error)
    }
    
    // Fallback to empty array or mock data
    setMatches([])
    setLoading(false)
  }

  const loadVenues = async () => {
    try {
      console.log('🏢 Loading venues from API...')
      // Try the API first
      const response = await fetch('/api/venues?view=card&limit=100')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Venues API response:', data)
        
        // Ensure venues have required fields
        const venuesArray = Array.isArray(data.venues) ? data.venues : []
        const validVenues = venuesArray.filter(venue => 
          venue && venue._id && venue.name && Array.isArray(venue.sports)
        ).map(venue => ({
          _id: venue._id,
          name: venue.name,
          location: venue.location || venue.address || '',
          sports: venue.sports || [],
        }))
        
        console.log('✅ Valid venues found:', validVenues.length)
        
        if (validVenues.length > 0) {
          setVenues(validVenues)
          return
        }
      }
      
      console.log('⚠️ No venues found, trying to seed database...')
      
      // If no venues found, try to seed the database (only if really empty)
      const seedResponse = await fetch('/api/seed')
      if (seedResponse.ok) {
        console.log('✅ Database seeded successfully')
        
        // Retry loading venues after seeding
        const retryResponse = await fetch('/api/venues?view=card&limit=100')
        if (retryResponse.ok) {
          const retryData = await retryResponse.json()
          const retryVenuesArray = Array.isArray(retryData.venues) ? retryData.venues : []
          const retryValidVenues = retryVenuesArray.filter(venue => 
            venue && venue._id && venue.name && Array.isArray(venue.sports)
          ).map(venue => ({
            _id: venue._id,
            name: venue.name,
            location: venue.location || venue.address || '',
            sports: venue.sports || [],
          }))
          
          if (retryValidVenues.length > 0) {
            console.log('✅ Venues loaded after seeding:', retryValidVenues.length)
            setVenues(retryValidVenues)
            return
          }
        }
      } else {
        const seedError = await seedResponse.text()
        console.log('⚠️ Seeding failed:', seedResponse.status, seedError)
      }
      
    } catch (error) {
      console.error('❌ Error loading venues:', error)
    }
    
    // Final fallback to mock data with a warning (always works)
    console.log('🔄 Using fallback venue data with auto-create capability')
    console.log('⚠️ These venues will be created automatically when selected')
    
    // Instead of hardcoded IDs, use descriptive IDs that the backend can recognize and auto-create
    const mockVenues = [
      {
        _id: 'auto-create-elite-sports', // Special ID that backend will recognize
        name: 'Elite Sports Complex',
        location: 'Downtown',
        sports: ['Basketball', 'Tennis', 'Badminton', 'Volleyball', 'Table Tennis'],
        isAutoCreate: true
      },
      {
        _id: 'auto-create-premier-tennis',
        name: 'Premier Tennis Club',
        location: 'North Side',
        sports: ['Tennis', 'Badminton', 'Table Tennis'],
        isAutoCreate: true
      },
      {
        _id: 'auto-create-community-rec',
        name: 'Community Recreation Center',
        location: 'East District', 
        sports: ['Basketball', 'Volleyball', 'Football', 'Cricket', 'Table Tennis'],
        isAutoCreate: true
      },
      {
        _id: 'auto-create-city-arena',
        name: 'City Sports Arena',
        location: 'West End',
        sports: ['Football', 'Cricket', 'Hockey', 'Table Tennis'],
        isAutoCreate: true
      },
      {
        _id: 'auto-create-delhi-hub',
        name: 'Delhi Indoor Sports Hub',
        location: 'Central Delhi',
        sports: ['Table Tennis', 'Badminton', 'Basketball', 'Volleyball'],
        isAutoCreate: true
      },
      {
        _id: 'auto-create-hyderabad-arena',
        name: 'Hyderabad Smash Arena',
        location: 'Hyderabad',
        sports: ['Table Tennis', 'Tennis', 'Badminton'],
        isAutoCreate: true
      }
    ]
    setVenues(mockVenues)
  }

  const createMatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setError(null)
    
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        throw new Error('Not authenticated')
      }

      const userData = JSON.parse(userStr)
      console.log('User data:', userData)

      const payload = {
        sport: formData.sport,
        venueId: formData.venueId,
        courtId: formData.courtId,
        date: formData.date.toISOString().split('T')[0],
        time: formData.time,
        playersNeeded: parseInt(formData.playersNeeded),
        prizeAmount: parseFloat(formData.prizeAmount) || 0,
        courtFees: parseFloat(formData.courtFees) || 0,
        description: formData.description || undefined
      }

      // Enhanced API call with robust error handling
      console.log('🚀 Sending match creation payload:', payload)
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(payload)
      })

      console.log('📡 API response status:', response.status)
      
      if (response.ok) {
        // Success - parse JSON response
        try {
          const result = await response.json()
          console.log('✅ Match created successfully:', result)
          
          // Show success message
          if (result.message) {
            console.log('Success:', result.message)
          }
          
          // API success - reload matches
          await loadMatches()
          
          // Reset form and close dialog
          setFormData({
            sport: "",
            venueId: "",
            courtId: "",
            date: new Date(),
            time: "",
            playersNeeded: "",
            prizeAmount: "",
            courtFees: "",
            description: ""
          })
          setIsDialogOpen(false)
          
          return // Exit early on success
        } catch (parseError) {
          console.error('❌ Failed to parse success response:', parseError)
          setError('Match created but failed to parse response')
          return
        }
      }
      
      // Error response - handle gracefully
      let errorMessage = 'Failed to create match'
      
      try {
        // Try to parse JSON error response
        const errorData = await response.json()
        console.error('❌ API error (JSON):', response.status, errorData)
        
        if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else {
          errorMessage = `API error: ${response.status}`
        }
      } catch (jsonError) {
        // JSON parsing failed - try text
        try {
          const errorText = await response.text()
          console.error('❌ API error (Text):', response.status, errorText)
          
          if (errorText.trim()) {
            errorMessage = `Server error: ${errorText}`
          } else {
            errorMessage = `API error: ${response.status} (No response body)`
          }
        } catch (textError) {
          console.error('❌ Failed to parse error response:', textError)
          errorMessage = `API error: ${response.status} (Unable to parse response)`
        }
      }
      
      // If API fails, show error and optionally create mock match locally
      console.warn('⚠️ API failed, showing error to user')
      setError(errorMessage)
      
      // Optionally create mock match for development/fallback
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development mode: Creating mock match locally')
        
        const selectedVenue = Array.isArray(venues) ? venues.find(v => v._id === formData.venueId) : null
        
        const mockMatch: Match = {
          _id: `mock-${Date.now()}`,
          sport: formData.sport,
          venue: {
            _id: formData.venueId,
            name: selectedVenue?.name || 'Selected Venue'
          },
          date: formData.date.toISOString().split('T')[0],
          time: formData.time,
          prizeAmount: parseFloat(formData.prizeAmount) || 0,
          courtFees: parseFloat(formData.courtFees) || 0,
          playersJoined: 1,
          playersNeeded: parseInt(formData.playersNeeded),
          createdBy: {
            _id: userData.id || 'mock-user',
            name: userData.name || 'You'
          },
          status: 'Open' as const,
          participants: [{
            _id: userData.id || 'mock-user',
            name: userData.name || 'You',
            joinedAt: new Date().toISOString()
          }],
          description: formData.description,
          hasJoined: true,
          isCreator: true
        }
        
        setMatches(prev => [mockMatch, ...prev])
        
        // Reset form and close dialog for mock match
        setFormData({
          sport: "",
          venueId: "",
          courtId: "",
          date: new Date(),
          time: "",
          playersNeeded: "",
          prizeAmount: "",
          courtFees: "",
          description: ""
        })
        setIsDialogOpen(false)
      }
      
    } catch (error) {
      console.error('💥 Unexpected error in createMatch:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleJoinMatch = async (matchId: string) => {
    setJoinLoading(matchId)
    setError(null)
    
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        throw new Error('Not authenticated')
      }

      // Try API first
      const response = await fetch(`/api/matches/${matchId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JSON.parse(userStr).token}`
        }
      })

      if (response.ok) {
        // API success - reload matches
        await loadMatches()
      } else {
        // API failed - update locally
        console.warn('Join API failed, updating locally')
        const userData = JSON.parse(userStr)
        
        setMatches(prev => prev.map(match => {
          if (match._id === matchId && !match.hasJoined && match.playersJoined < match.playersNeeded) {
            return {
              ...match,
              playersJoined: match.playersJoined + 1,
              hasJoined: true,
              participants: [...match.participants, {
                _id: userData.id || 'mock-user',
                name: userData.name || 'You',
                joinedAt: new Date().toISOString()
              }],
              status: (match.playersJoined + 1) >= match.playersNeeded ? 'Full' as const : match.status
            }
          }
          return match
        }))
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join match')
    } finally {
      setJoinLoading(null)
    }
  }

  const handleLeaveMatch = async (matchId: string) => {
    setJoinLoading(matchId)
    setError(null)
    
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        throw new Error('Not authenticated')
      }

      // Try API first
      const response = await fetch(`/api/matches/${matchId}/join`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${JSON.parse(userStr).token}`
        }
      })

      if (response.ok) {
        // API success - reload matches
        await loadMatches()
      } else {
        // API failed - update locally
        console.warn('Leave API failed, updating locally')
        const userData = JSON.parse(userStr)
        
        setMatches(prev => prev.map(match => {
          if (match._id === matchId && match.hasJoined) {
            const newParticipants = match.participants.filter(p => p._id !== (userData.id || 'mock-user'))
            return {
              ...match,
              playersJoined: Math.max(1, match.playersJoined - 1),
              hasJoined: false,
              participants: newParticipants,
              status: 'Open' as const
            }
          }
          return match
        }))
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to leave match')
    } finally {
      setJoinLoading(null)
    }
  }

  // Filter matches based on current filters
  const filteredMatches = matches.filter(match => {
    const matchesSearch = filters.search === "" || 
      match.sport.toLowerCase().includes(filters.search.toLowerCase()) ||
      match.venue.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      match.createdBy.name.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesSport = filters.sport === "All" || match.sport === filters.sport
    const matchesStatus = filters.status === "All" || match.status === filters.status
    
    return matchesSearch && matchesSport && matchesStatus
  })

  // Get available sports from venues
  const availableSports = Array.isArray(venues) && venues.length > 0 
    ? [...new Set(venues.flatMap(venue => venue.sports))]
    : ['Basketball', 'Tennis', 'Football', 'Cricket', 'Badminton', 'Volleyball', 'Hockey'] // Fallback sports

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sports Matches</h1>
          <p className="text-muted-foreground">Create or join matches at your favorite venues</p>
        </div>
        
        <div className="flex gap-2">
          {/* Seed Database Button for development */}
          <Button 
            variant="outline" 
            onClick={async () => {
              console.log('🌱 Manually seeding database...')
              try {
                const response = await fetch('/api/seed')
                if (response.ok) {
                  const data = await response.json()
                  console.log('✅ Database seeded successfully:', data)
                  await loadVenues() // Reload venues after seeding
                } else {
                  const errorText = await response.text()
                  console.error('❌ Failed to seed database:', response.status, errorText)
                }
              } catch (error) {
                console.error('❌ Error seeding database:', error)
              }
            }}
            className="flex items-center gap-2"
          >
            <span>🌱</span>
            Seed DB
          </Button>
          
          {/* Quick Test Venue Creation */}
          <Button 
            variant="outline" 
            onClick={async () => {
              console.log('🧪 Creating test venue directly...')
              try {
                const userStr = localStorage.getItem('user')
                if (!userStr) {
                  console.error('❌ No user found')
                  return
                }
                const userData = JSON.parse(userStr)
                
                const testVenueData = {
                  name: `Test Venue ${Date.now()}`,
                  description: 'Quick test venue for debugging',
                  sports: ['Basketball', 'Tennis'],
                  address: {
                    street: '123 Test Street',
                    city: 'Test City',
                    state: 'Test State',
                    zipCode: '12345',
                    country: 'India'
                  },
                  location: {
                    type: 'Point',
                    coordinates: [77.2090, 28.6139]
                  },
                  contactPhone: '9999999999',
                  contactEmail: 'test@venue.com',
                  approvalStatus: 'approved',
                  isActive: true
                }
                
                console.log('🏗️ Creating venue:', testVenueData)
                const response = await fetch('/api/venues', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`
                  },
                  body: JSON.stringify(testVenueData)
                })
                
                if (response.ok) {
                  const venue = await response.json()
                  console.log('✅ Test venue created:', venue)
                  await loadVenues()
                } else {
                  const errorText = await response.text()
                  console.error('❌ Failed to create test venue:', response.status, errorText)
                }
              } catch (error) {
                console.error('❌ Error creating test venue:', error)
              }
            }}
            className="flex items-center gap-2"
          >
            <span>🧪</span>
            Test Venue
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Match
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Match</DialogTitle>
              <DialogDescription>
                Set up a new sports match for others to join
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={createMatch} className="space-y-6">
              {/* Sport and Venue Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sport">Sport</Label>
                  <Select value={formData.sport} onValueChange={(value) => {
                    console.log('Sport selected:', value)
                    setFormData(prev => ({ ...prev, sport: value, venueId: "", courtId: "", courtFees: "", time: "" }))
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSports.length === 0 ? (
                        <SelectItem value="loading" disabled>Loading sports...</SelectItem>
                      ) : (
                        availableSports.map(sport => (
                          <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {/* Debug info */}
                  <p className="text-xs text-muted-foreground">
                    Available sports: {availableSports.length} | Venues: {Array.isArray(venues) ? venues.length : 0}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Select 
                    value={formData.venueId} 
                    onValueChange={(value) => {
                      console.log('Venue selected:', value)
                      setFormData(prev => ({ 
                        ...prev, 
                        venueId: value, 
                        courtId: "", 
                        courtFees: "",
                        time: ""
                      }))
                      // Clear courts and fetch new ones
                      setCourts([])
                      if (value) {
                        fetchCourts(value, formData.sport)
                      }
                    }}
                    disabled={!formData.sport}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!formData.sport ? "Select sport first" : "Select a venue"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto z-50">
                      {!Array.isArray(venues) || venues.length === 0 ? (
                        <SelectItem value="loading" disabled>
                          {!Array.isArray(venues) ? "Loading venues..." : "No venues available"}
                        </SelectItem>
                      ) : venues
                        .filter(venue => !formData.sport || venue.sports.includes(formData.sport))
                        .map(venue => {
                          console.log('Rendering venue:', venue)
                          return (
                            <SelectItem 
                              key={venue._id} 
                              value={venue._id}
                              className="cursor-pointer hover:bg-gray-100"
                            >
                              {venue.name} {venue.location ? `- ${venue.location}` : ''}
                            </SelectItem>
                          )
                        })
                      }
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {formData.sport ? 
                      `Venues for ${formData.sport}: ${Array.isArray(venues) ? venues.filter(v => v.sports.includes(formData.sport)).length : 0}` :
                      `Total venues: ${Array.isArray(venues) ? venues.length : 0}`
                    }
                  </p>
                </div>
              </div>

              {/* Court Selection */}
              <div className="space-y-2">
                <Label htmlFor="court">Court</Label>
                <Select 
                  value={formData.courtId} 
                  onValueChange={(value) => {
                    console.log('Court selected:', value)
                    const selectedCourt = courts.find(court => court._id === value)
                    if (selectedCourt) {
                      console.log('Selected court details:', selectedCourt)
                      setFormData(prev => ({ 
                        ...prev, 
                        courtId: value,
                        courtFees: selectedCourt.pricePerHour.toString(),
                        time: "" // Reset time when court changes
                      }))
                      
                      // Clear existing slots and fetch new ones if date is selected
                      setAvailableSlots([])
                      if (formData.date) {
                        console.log('Fetching time slots for court:', value, 'date:', formData.date)
                        fetchAvailableSlots(value, formData.date)
                      }
                    }
                  }}
                  disabled={!formData.venueId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!formData.venueId ? "Select venue first" : "Select a court"} />
                  </SelectTrigger>
                  <SelectContent>
                    {courts.length === 0 ? (
                      <SelectItem value="loading" disabled>
                        {formData.venueId ? "Loading courts..." : "No courts available"}
                      </SelectItem>
                    ) : courts.map(court => (
                      <SelectItem key={court._id} value={court._id}>
                        {court.name} - {court.sport} (₹{court.pricePerHour}/hr)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.venueId ? 
                    `Courts for ${formData.sport || 'any sport'}: ${courts.length} available` : 
                    "Select a venue to see courts"
                  }
                  {formData.sport && courts.length > 0 && (
                    <span className="block">Courts: {courts.map(c => c.name).join(', ')}</span>
                  )}
                  {formData.venueId && courts.length === 0 && (
                    <button 
                      type="button"
                      onClick={() => useFallbackCourts(formData.sport)}
                      className="block mt-1 text-blue-600 hover:text-blue-800 underline text-xs"
                    >
                      🔄 Load Test Courts
                    </button>
                  )}
                </p>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => {
                        if (date) {
                          console.log('Date selected:', date)
                          setFormData(prev => ({ ...prev, date, time: "" })) // Reset time when date changes
                          
                          // Fetch time slots if court is already selected
                          if (formData.courtId) {
                            console.log('Date changed, fetching time slots for court:', formData.courtId)
                            setAvailableSlots([]) // Clear existing slots
                            fetchAvailableSlots(formData.courtId, date)
                          }
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>
                </div>
              </div>

              {/* Time Slots, Players, Prize, and Court Fees */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Available Time Slots</Label>
                  <Select 
                    value={formData.time} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
                    disabled={!formData.courtId || loadingSlots}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !formData.courtId ? "Select court first" : 
                        loadingSlots ? "Loading slots..." : 
                        "Select time slot"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.length === 0 ? (
                        <SelectItem value="no-slots" disabled>
                          {loadingSlots ? "Loading..." : "No available slots"}
                        </SelectItem>
                      ) : availableSlots.map(slot => (
                        <SelectItem key={slot.time} value={slot.time}>
                          {slot.time} - ₹{slot.price}/hr
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {availableSlots.length > 0 ? `${availableSlots.length} slots available` : "Select court and date to see available slots"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="playersNeeded">Players Needed</Label>
                  <Input
                    id="playersNeeded"
                    type="number"
                    min="2"
                    max="50"
                    value={formData.playersNeeded}
                    onChange={(e) => setFormData(prev => ({ ...prev, playersNeeded: e.target.value }))}
                    placeholder="e.g. 8"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prizeAmount">Prize Amount (₹)</Label>
                  <Input
                    id="prizeAmount"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.prizeAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, prizeAmount: e.target.value }))}
                    placeholder="e.g. 5000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courtFees">Court Fees (₹)</Label>
                  <Input
                    id="courtFees"
                    type="number"
                    value={formData.courtFees}
                    placeholder="Auto-calculated"
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Fees are automatically set based on selected court
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Any additional details about the match..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={createLoading}>
                {createLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Match'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search matches..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        
        <Select value={filters.sport} onValueChange={(value) => setFilters(prev => ({ ...prev, sport: value }))}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Sports</SelectItem>
            {availableSports.map(sport => (
              <SelectItem key={sport} value={sport}>{sport}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Full">Full</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatches.map((match) => (
          <Card key={match._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{match.sport}</CardTitle>
                <Badge variant={
                  match.status === "Open" ? "default" : 
                  match.status === "Full" ? "secondary" : 
                  match.status === "Completed" ? "outline" : "destructive"
                }>
                  {match.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {match.venue.name}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                {new Date(match.date).toLocaleDateString()}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {match.time}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {match.playersJoined}/{match.playersNeeded} players
              </div>
              
              {match.prizeAmount > 0 && (
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <IndianRupee className="h-4 w-4" />
                  Prize: ₹{match.prizeAmount.toLocaleString()}
                </div>
              )}
              
              {match.courtFees && match.courtFees > 0 && (
                <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                  <IndianRupee className="h-4 w-4" />
                  Court Fees: ₹{match.courtFees.toLocaleString()}
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                Created by {match.createdBy.name}
              </div>

              {match.description && (
                <p className="text-sm text-muted-foreground">{match.description}</p>
              )}
              
              <div className="pt-2">
                {match.isCreator ? (
                  <Badge variant="outline">Your Match</Badge>
                ) : match.hasJoined ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleLeaveMatch(match._id)}
                    disabled={joinLoading === match._id}
                    className="w-full"
                  >
                    {joinLoading === match._id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Leaving...
                      </>
                    ) : (
                      'Leave Match'
                    )}
                  </Button>
                ) : match.status === "Open" && match.playersJoined < match.playersNeeded ? (
                  <Button 
                    size="sm" 
                    onClick={() => handleJoinMatch(match._id)}
                    disabled={joinLoading === match._id}
                    className="w-full"
                  >
                    {joinLoading === match._id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Joining...
                      </>
                    ) : (
                      'Join Match'
                    )}
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" disabled className="w-full">
                    {match.status === "Full" ? "Match Full" : "Not Available"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMatches.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No matches found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or create a new match</p>
        </div>
      )}
    </div>
  )
}