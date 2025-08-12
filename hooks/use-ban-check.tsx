"use client"

import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function useBanCheck() {
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkUserStatus = async () => {
    try {
      // Only run in browser environment
      if (typeof window === 'undefined') return
      
      // Only check if user has an auth token
      const cookies = document.cookie.split(';')
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='))
      if (!authCookie || authCookie.split('=')[1].trim() === '') {
        console.log('No auth token found, skipping ban check')
        return
      }
      
      const response = await fetch('/api/auth/check-status')
      
      // Handle network errors or non-ok responses
      if (!response.ok) {
        console.log('Status check failed with status:', response.status)
        return
      }
      
      const data = await response.json()

      if (data.success && data.shouldLogout) {
        console.log('User is banned/suspended, logging out...')
        
        // Clear auth token
        document.cookie = 'authToken=; Max-Age=0; path=/'
        
        // Redirect to banned page
        router.push('/banned')
        
        // Clear the interval since user is being logged out
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    } catch (error) {
      console.log('Failed to check user status (this is normal if not logged in):', error)
    }
  }

  useEffect(() => {
    // Check immediately on mount
    checkUserStatus()

    // Set up periodic checking every 30 seconds
    intervalRef.current = setInterval(checkUserStatus, 30000)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Also check when the window gains focus
  useEffect(() => {
    const handleFocus = () => {
      checkUserStatus()
    }

    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])
}

// Component wrapper for easy use
export function BanCheckProvider({ children }: { children: React.ReactNode }) {
  useBanCheck()
  return children
}
