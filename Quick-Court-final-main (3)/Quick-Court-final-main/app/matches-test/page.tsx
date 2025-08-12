"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function MatchesTestPage() {
  const [dbStatus, setDbStatus] = useState<string>("checking")
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data for creating a test match
  const [formData, setFormData] = useState({
    sport: "Basketball",
    venueId: "",
    date: "2025-08-15",
    time: "18:00",
    playersNeeded: "8",
    prizeAmount: "1000",
    description: "Test match"
  })

  useEffect(() => {
    checkDatabaseConnection()
    loadMatches()
  }, [])

  const checkDatabaseConnection = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setDbStatus(data.status)
    } catch (error) {
      setDbStatus("error")
    }
  }

  const loadMatches = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/matches-test')
      const data = await response.json()
      
      if (data.success) {
        setMatches(data.data)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const createTestMatch = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/matches-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        await loadMatches() // Reload matches
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Failed to create match')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Matches Database Test</h1>
        <p className="text-muted-foreground">Test database connection and basic CRUD operations</p>
      </div>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Database Status
            {dbStatus === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {dbStatus === "error" && <XCircle className="h-5 w-5 text-red-500" />}
            {dbStatus === "checking" && <Loader2 className="h-5 w-5 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-sm ${
            dbStatus === "success" ? "text-green-600" : 
            dbStatus === "error" ? "text-red-600" : "text-gray-600"
          }`}>
            {dbStatus === "success" && "✅ Database connected successfully"}
            {dbStatus === "error" && "❌ Database connection failed"}
            {dbStatus === "checking" && "🔄 Checking database connection..."}
          </p>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Create Test Match */}
      <Card>
        <CardHeader>
          <CardTitle>Create Test Match</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sport">Sport</Label>
              <Input
                id="sport"
                value={formData.sport}
                onChange={(e) => setFormData(prev => ({ ...prev, sport: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="venueId">Venue ID (get from database)</Label>
              <Input
                id="venueId"
                placeholder="Enter a valid venue ObjectId"
                value={formData.venueId}
                onChange={(e) => setFormData(prev => ({ ...prev, venueId: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="playersNeeded">Players Needed</Label>
              <Input
                id="playersNeeded"
                type="number"
                value={formData.playersNeeded}
                onChange={(e) => setFormData(prev => ({ ...prev, playersNeeded: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="prizeAmount">Prize Amount</Label>
              <Input
                id="prizeAmount"
                type="number"
                value={formData.prizeAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, prizeAmount: e.target.value }))}
              />
            </div>
          </div>
          
          <Button 
            onClick={createTestMatch} 
            disabled={loading || !formData.venueId}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'Create Test Match'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Matches List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Matches ({matches.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !matches.length ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>Loading matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No matches found</p>
          ) : (
            <div className="space-y-2">
              {matches.map((match) => (
                <div key={match._id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{match.sport}</h4>
                      <p className="text-sm text-muted-foreground">
                        Venue: {match.venue?.name || 'Unknown'} | 
                        Date: {new Date(match.date).toLocaleDateString()} | 
                        Time: {match.time}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Players: {match.participants?.length || 0}/{match.playersNeeded} | 
                        Prize: ₹{match.prizeAmount}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {match.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
