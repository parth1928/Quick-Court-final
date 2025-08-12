"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestBookingAPIPage() {
  const [testResults, setTestResults] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const addLog = (message: string) => {
    setTestResults(prev => prev + '\n' + new Date().toLocaleTimeString() + ': ' + message)
  }

  const testBookingAPI = async () => {
    setLoading(true)
    setTestResults('')
    
    try {
      addLog('🧪 Starting booking API test...')
      
      // Check if user is logged in
      const token = localStorage.getItem('token')
      if (!token) {
        addLog('❌ No authentication token found. Please log in first.')
        return
      }
      addLog('✅ Authentication token found')
      
      // Test 1: Test venue creation first
      addLog('📡 Testing venue creation...')
      const venueResponse = await fetch('/api/test-venue', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      addLog(`📡 Venue creation API response: ${venueResponse.status} ${venueResponse.statusText}`)
      
      if (venueResponse.ok) {
        const venueData = await venueResponse.json()
        addLog(`✅ Venue creation successful! Venue ID: ${venueData.data?.id}`)
      } else {
        const venueError = await venueResponse.text()
        addLog(`❌ Venue creation failed: ${venueError}`)
        return
      }
      
      // Test 2: Check booking list API
      addLog('📡 Testing GET /api/users/me/bookings...')
      const listResponse = await fetch('/api/users/me/bookings?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      addLog(`📡 Booking list API response: ${listResponse.status} ${listResponse.statusText}`)
      
      if (listResponse.ok) {
        const listData = await listResponse.json()
        addLog(`✅ Booking list API successful. Found ${listData.data?.bookings?.length || 0} bookings`)
      } else {
        const errorText = await listResponse.text()
        addLog(`❌ Booking list API failed: ${errorText}`)
      }
      
      // Test 3: Test booking creation with minimal data
      addLog('📡 Testing POST /api/users/me/bookings...')
      
      const testBookingData = {
        venueName: 'Test Venue API ' + Date.now(),
        courtName: 'Test Court API',
        sportType: 'badminton',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
        totalPrice: 500,
        pricingBreakdown: {
          baseRate: 400,
          tax: 72,
          platformFee: 28,
          currency: 'INR'
        },
        status: 'confirmed',
        paymentStatus: 'paid',
        notes: 'Test booking via API testing page'
      }
      
      addLog(`📡 Sending booking data: ${JSON.stringify(testBookingData, null, 2)}`)
      
      const createResponse = await fetch('/api/users/me/bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testBookingData)
      })
      
      addLog(`📡 Booking creation API response: ${createResponse.status} ${createResponse.statusText}`)
      
      const createResponseText = await createResponse.text()
      addLog(`📡 Booking creation response body: ${createResponseText}`)
      
      if (createResponse.ok) {
        const createData = JSON.parse(createResponseText)
        addLog(`✅ Booking creation successful! Booking ID: ${createData.data?.id}`)
      } else {
        addLog(`❌ Booking creation failed: ${createResponseText}`)
      }
      
    } catch (error: any) {
      addLog(`💥 Test failed with error: ${error.message}`)
      console.error('Test error:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearLogs = () => {
    setTestResults('')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Booking API Test Page</CardTitle>
          <p className="text-sm text-gray-600">
            This page tests the booking API endpoints to diagnose any issues.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={testBookingAPI} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? '🔄 Testing...' : '🧪 Run Booking API Test'}
            </Button>
            <Button 
              onClick={clearLogs} 
              variant="outline"
              disabled={loading}
            >
              🗑️ Clear Logs
            </Button>
          </div>
          
          {testResults && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm">Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono whitespace-pre-wrap bg-black text-green-400 p-3 rounded overflow-auto max-h-96">
                  {testResults}
                </pre>
              </CardContent>
            </Card>
          )}
          
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Instructions</h3>
              <ol className="text-sm space-y-1 text-yellow-700 list-decimal list-inside">
                <li>Make sure you're logged in as a user (not admin/owner)</li>
                <li>Click "Run Booking API Test" to test the booking endpoints</li>
                <li>Check the test results for any errors</li>
                <li>If successful, you should see a new test booking created</li>
                <li>Check the browser console (F12) for additional debug info</li>
              </ol>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
