"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function MyBookingsDebugPage() {
  const [userData, setUserData] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    
    console.log('🔍 Debug Info:')
    console.log('User from localStorage:', user)
    console.log('Token from localStorage:', token ? token.substring(0, 50) + '...' : 'No token')
    
    setDebugInfo({
      hasUser: !!user,
      hasToken: !!token,
      userRaw: user,
      tokenLength: token?.length || 0
    })

    if (!user) {
      console.log('❌ No user found, redirecting to login')
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(user)
      console.log('✅ Parsed user:', parsedUser)
      
      if (parsedUser.role !== "user") {
        console.log('❌ User role is not "user", redirecting to login')
        router.push("/login")
        return
      }

      setUserData(parsedUser)
    } catch (e) {
      console.error('❌ Error parsing user data:', e)
      router.push("/login")
    }
  }, [router])

  // Load bookings
  useEffect(() => {
    const loadBookings = async () => {
      if (!userData) return
      
      try {
        setLoading(true)
        setError(null)
        
        const token = localStorage.getItem('token')
        console.log('🚀 Making API request...')
        console.log('Token available:', !!token)
        console.log('User ID:', userData.id || userData.userId)
        
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch('/api/users/me/bookings?limit=50', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        })
        
        console.log('📡 API Response Status:', response.status)
        console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()))
        
        const responseText = await response.text()
        console.log('📡 Raw Response:', responseText)
        
        let result
        try {
          result = JSON.parse(responseText)
        } catch (parseError) {
          console.error('❌ Failed to parse JSON response:', parseError)
          throw new Error(`Invalid JSON response: ${responseText}`)
        }
        
        console.log('📡 Parsed Response:', result)
        
        if (!response.ok) {
          throw new Error(result.error || `HTTP ${response.status}: ${responseText}`)
        }
        
        if (result.success) {
          console.log('✅ Bookings loaded:', result.data.bookings?.length || 0)
          setBookings(result.data.bookings || [])
        } else {
          throw new Error('API returned success: false')
        }
        
      } catch (e: any) {
        console.error('❌ Failed to load bookings:', e)
        setError(e.message)
        setBookings([])
      } finally {
        setLoading(false)
      }
    }
    
    loadBookings()
  }, [userData])

  if (!userData) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug: Authentication Check</h1>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p>Checking authentication...</p>
          <pre className="mt-2 text-sm">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Bookings - Debug Mode</h1>
      
      {/* Debug Info */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Debug Information:</h2>
        <div className="text-sm space-y-1">
          <p><strong>User ID:</strong> {userData.id || userData.userId || 'Not found'}</p>
          <p><strong>User Name:</strong> {userData.name || 'Not found'}</p>
          <p><strong>User Role:</strong> {userData.role || 'Not found'}</p>
          <p><strong>Has Token:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Error:</strong> {error || 'None'}</p>
          <p><strong>Bookings Count:</strong> {bookings.length}</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-red-800">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p>Loading bookings...</p>
        </div>
      )}

      {/* Bookings Display */}
      {!loading && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Bookings ({bookings.length})</h2>
          
          {bookings.length === 0 && !error && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>No bookings found. This could mean:</p>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>The user has no bookings in the database</li>
                <li>The API is working but returning empty data</li>
                <li>Database connection issues</li>
              </ul>
            </div>
          )}
          
          {bookings.map((booking: any, index: number) => (
            <div key={booking.id || index} className="border p-4 rounded-lg">
              <h3 className="font-semibold">{booking.venueName || 'Unknown Venue'}</h3>
              <p className="text-sm text-gray-600">{booking.courtName || 'Unknown Court'} • {booking.sport || 'Unknown Sport'}</p>
              <p className="text-sm">Date: {booking.date || 'Unknown'}</p>
              <p className="text-sm">Time: {booking.time || 'Unknown'}</p>
              <p className="text-sm">Status: {booking.status || 'Unknown'}</p>
              <p className="text-sm">Price: ₹{booking.price || 0}</p>
              
              <details className="mt-2">
                <summary className="text-xs cursor-pointer">Raw Data</summary>
                <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                  {JSON.stringify(booking, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}

      {/* Raw State Debug */}
      <details className="mt-8">
        <summary className="text-sm cursor-pointer font-semibold">Full State Debug</summary>
        <pre className="text-xs bg-gray-100 p-4 mt-2 rounded overflow-auto">
          {JSON.stringify({
            userData,
            bookings,
            loading,
            error,
            debugInfo
          }, null, 2)}
        </pre>
      </details>
    </div>
  )
}
