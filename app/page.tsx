"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Building2, BarChart3, Calendar, MapPin, Star, CheckCircle, Shield, Zap } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "User Management",
    description: "Comprehensive user and facility owner management with advanced search and moderation tools.",
  },
  {
    icon: Building2,
    title: "Facility Management",
    description: "Complete facility registration, approval workflow, and detailed venue management system.",
  },
  {
    icon: Calendar,
    title: "Booking System",
    description: "Advanced booking management with real-time availability and automated scheduling.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Powerful analytics and reporting tools to monitor platform performance and revenue.",
  },
  {
    icon: Shield,
    title: "Security & Moderation",
    description: "Built-in security features with comprehensive moderation and reporting capabilities.",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Live updates for bookings, availability, and facility status across all user roles.",
  },
]

const stats = [
  { label: "Active Venues", value: "150+" },
  { label: "Sports Supported", value: "25+" },
  { label: "Monthly Bookings", value: "5K+" },
  { label: "User Satisfaction", value: "4.8/5" },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Facility Owner",
    content:
      "QuickCourt has transformed how I manage my sports complex. The booking system is intuitive and the analytics help me optimize my business.",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "Sports Enthusiast",
    content:
      "Finding and booking courts has never been easier. The platform is reliable and the variety of venues is impressive.",
    rating: 5,
  },
  {
    name: "Admin Team",
    role: "Platform Administrator",
    content:
      "The admin dashboard provides everything we need to manage the platform efficiently. User management and facility approval workflows are seamless.",
    rating: 5,
  },
]

const popularVenues = [
  {
    name: "Elite Sports Complex",
    location: "Downtown NYC",
    sports: ["Basketball", "Tennis"],
    rating: 4.8,
    image: "/placeholder.svg?height=200&width=300&text=Elite+Sports+Complex",
  },
  {
    name: "Community Recreation Center",
    location: "Brooklyn",
    sports: ["Volleyball", "Badminton"],
    rating: 4.6,
    image: "/placeholder.svg?height=200&width=300&text=Community+Center",
  },
  {
    name: "Premier Tennis Club",
    location: "Manhattan",
    sports: ["Tennis"],
    rating: 4.9,
    image: "/placeholder.svg?height=200&width=300&text=Tennis+Club",
  },
]

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("user")
    const authToken = localStorage.getItem("authToken")

    if (user && authToken) {
      setIsAuthenticated(true)
      const parsedUser = JSON.parse(user)

      // Redirect authenticated users to their appropriate dashboard
      switch (parsedUser.userType) {
        case "admin":
          router.push("/dashboard")
          return
        case "facility-owner":
          router.push("/facility-dashboard")
          return
        case "user":
          router.push("/user-home")
          return
        default:
          break
      }
    }
  }, [router])

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">QC</span>
              </div>
              <span className="text-xl font-bold text-gray-900">QuickCourt</span>
            </div>

            <nav className="hidden md:flex items-center space-x-12">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#venues" className="text-gray-600 hover:text-gray-900 transition-colors">
                Venues
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
                Reviews
              </a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                Contact
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              The Complete Sports
              <span className="block">Venue Management Platform</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline facility management, simplify bookings, and enhance user experiences with our comprehensive
              sports venue platform. Perfect for administrators, facility owners, and sports enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="text-lg px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white" asChild>
                <Link href="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 border-gray-300 text-gray-700 bg-transparent"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Manage Sports Venues</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From facility approval to booking management, our platform provides comprehensive tools for every
              stakeholder.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Venues Section */}
      <section id="venues" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover Amazing Sports Venues</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse through our curated selection of top-rated sports facilities across the city.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {popularVenues.map((venue, index) => (
              <Card key={index} className="border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <img src={venue.image || "/placeholder.svg"} alt={venue.name} className="w-full h-48 object-cover" />
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">{venue.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {venue.location}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {venue.sports.map((sport) => (
                      <Badge key={sport} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {sport}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm ml-1 text-gray-700">{venue.rating}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 bg-transparent" asChild>
              <Link href="/signup">
                View All Venues
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Sports Communities</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our users have to say about their experience with QuickCourt.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating }, (_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gray-50 rounded-2xl p-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Transform Your Sports Venue Management?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of facility owners, administrators, and sports enthusiasts who trust QuickCourt for their
              venue management needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="text-lg px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white" asChild>
                <Link href="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 border-gray-300 text-gray-700 bg-transparent"
                asChild
              >
                <Link href="/login">Sign In to Your Account</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-gray-900 mr-2" />
                <span></span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-gray-900 mr-2" />
                <span></span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-gray-900 mr-2" />
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-gray-900 font-bold text-sm">QC</span>
                </div>
                <span className="text-xl font-bold">QuickCourt</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                The complete sports venue management platform for administrators, facility owners, and sports
                enthusiasts.
              </p>
              <div className="text-sm text-gray-400">© 2024 QuickCourt. All rights reserved.</div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/signup" className="hover:text-white transition-colors">
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#venues" className="hover:text-white transition-colors">
                    Venues
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
