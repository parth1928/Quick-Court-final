"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const userStr = localStorage.getItem("user")
    const hasCookie = document.cookie.split(';').some(c=>c.trim().startsWith('authToken='))

    if (userStr && hasCookie) {
      const parsedUser = JSON.parse(userStr)
      // Redirect to appropriate dashboard
      switch (parsedUser.role) {
        case "admin":
          router.push("/admin-dashboard")
          break
        case "owner":
          router.push("/facility-dashboard")
          break
        case "user":
          router.push("/user-home")
          break
      }
    }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-8 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
          Welcome to Quick Court
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          The easiest way to find and book sports facilities. Join our community of
          sports enthusiasts and facility owners.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push("/signup")}
            className="bg-gray-900 text-white hover:bg-gray-800"
            size="lg"
          >
            Get Started
          </Button>
          <Button
            onClick={() => router.push("/login")}
            variant="outline"
            size="lg"
          >
            Sign In
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Find Courts</h3>
            <p className="text-gray-600">
              Discover and book sports facilities in your area with ease
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">List Your Facility</h3>
            <p className="text-gray-600">
              Own a sports facility? List it and start accepting bookings
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Manage Bookings</h3>
            <p className="text-gray-600">
              Easy booking management for both players and facility owners
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
