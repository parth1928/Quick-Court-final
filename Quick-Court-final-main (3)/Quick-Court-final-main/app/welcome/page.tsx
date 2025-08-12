"use client"

import Link from "next/link"
import { ArrowRight, Users, Building2, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">QC</span>
              </div>
              <span className="text-xl font-bold text-gray-900">QuickCourt</span>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Manage Sports Venues
            <span className="block">Efficiently</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Comprehensive admin dashboard for managing sports facilities, users, bookings, and facility approvals with
            powerful analytics and reporting tools.
          </p>
          <Button size="lg" className="text-lg px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white" asChild>
            <Link href="/login">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6 border-gray-200">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">User Management</h3>
              <p className="text-gray-600">
                Manage users and facility owners with comprehensive search, filtering, and moderation tools.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-gray-200">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-6 w-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Facility Approval</h3>
              <p className="text-gray-600">
                Review and approve facility registrations with detailed information and photo galleries.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-gray-200">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Analytics Dashboard</h3>
              <p className="text-gray-600">
                Monitor platform performance with comprehensive analytics, charts, and reporting tools.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Join QuickCourt today and start managing your sports venue business more efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white" asChild>
              <Link href="/signup">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 bg-transparent" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
