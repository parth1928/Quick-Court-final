"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "motion/react"
import {
  ScrollXCarousel,
  ScrollXCarouselContainer,
  ScrollXCarouselWrap,
  ScrollXCarouselProgress,
} from "@/components/ui/scroll-x-carousel"
import {
  CardHoverReveal,
  CardHoverRevealMain,
  CardHoverRevealContent,
} from "@/components/ui/reveal-on-hover"

const popularVenues = [
  {
    id: 1,
    name: "Elite Sports Complex",
    location: "Downtown NYC",
    sports: ["Basketball", "Tennis"],
    price: "$25/hour",
    rating: 4.8,
    image: "/placeholder.svg?height=200&width=300&text=Elite+Sports+Complex",
  },
  {
    id: 2,
    name: "Community Recreation Center",
    location: "Brooklyn",
    sports: ["Volleyball", "Badminton"],
    price: "$15/hour",
    rating: 4.6,
    image: "/placeholder.svg?height=200&width=300&text=Community+Center",
  },
  {
    id: 3,
    name: "Premier Tennis Club",
    location: "Manhattan",
    sports: ["Tennis"],
    price: "$40/hour",
    rating: 4.9,
    image: "/placeholder.svg?height=200&width=300&text=Tennis+Club",
  },
]

const featuredFacilities = [
  {
    id: 1,
    title: "Elite Basketball Training Center",
    type: "Basketball",
    price: "$45/hour",
    description: "Professional NBA-standard basketball court with advanced training equipment and coaching staff available.",
    services: ["Professional Coaching", "Equipment Rental", "Locker Rooms", "Video Analysis"],
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Premier Tennis Academy",
    type: "Tennis",
    price: "$60/hour",
    description: "Championship-grade tennis courts with clay and hard court surfaces, featuring professional lighting systems.",
    services: ["Court Variety", "Night Lighting", "Pro Shop", "Tournaments"],
    imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "Aquatic Sports Complex",
    type: "Swimming",
    price: "$35/hour",
    description: "Olympic-sized swimming pool with diving boards, perfect for competitive training and recreational swimming.",
    services: ["Olympic Pool", "Diving Boards", "Swim Lessons", "Lifeguards"],
    imageUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    title: "Soccer Training Grounds",
    type: "Soccer",
    price: "$40/hour",
    description: "Full-size soccer fields with premium artificial turf, perfect for team training and matches.",
    services: ["Full-Size Fields", "Artificial Turf", "Goal Posts", "Team Facilities"],
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    title: "Indoor Rock Climbing Gym",
    type: "Climbing",
    price: "$25/hour",
    description: "Multi-level climbing walls with various difficulty routes, safety equipment included.",
    services: ["Safety Equipment", "Route Variety", "Instruction", "Bouldering"],
    imageUrl: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 6,
    title: "Martial Arts Dojo",
    type: "Martial Arts",
    price: "$30/hour",
    description: "Traditional martial arts training space with authentic equipment and experienced instructors.",
    services: ["Traditional Equipment", "Expert Instructors", "Group Classes", "Private Sessions"],
    imageUrl: "https://images.unsplash.com/photo-1544737151672-6e4b999de2a6?auto=format&fit=crop&w=800&q=80"
  }
]

export default function UserHomePage() {
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 350
      const newScrollPosition = direction === 'left' 
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount
      
      carouselRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(user)
  if (parsedUser.role !== "user") {
      router.push("/login")
      return
    }

    setUserData(parsedUser)
  }, [router])

  if (!userData) {
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
      {/* Welcome Section */}
      <div className="bg-gray-900 text-white rounded-2xl p-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome back, {userData.name}!</h1>
          <p className="text-lg mb-6 text-gray-300">
            Discover amazing sports venues near you and book your next game instantly.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" variant="secondary">
              Book Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-gray-900 bg-transparent"
            >
              Browse Venues
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">150+</div>
            <div className="text-sm text-gray-600">Venues</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">25+</div>
            <div className="text-sm text-gray-600">Sports</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">5K+</div>
            <div className="text-sm text-gray-600">Bookings</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">4.8</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Facilities Carousel */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div 
          className="flex items-center justify-between mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Featured Facilities</h2>
            <p className="text-gray-600 text-sm">
              Premium sports facilities with professional equipment
            </p>
          </div>
          
          {/* Navigation Buttons */}
          <motion.div 
            className="flex space-x-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-gray-300 hover:border-gray-400 transition-colors duration-200"
              onClick={() => scrollCarousel('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-gray-300 hover:border-gray-400 transition-colors duration-200"
              onClick={() => scrollCarousel('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
        
        <div className="relative">
          {/* Subtle Gradient Overlays */}
          <div className="pointer-events-none w-8 h-full absolute left-0 top-0 z-10 bg-gradient-to-r from-gray-50 to-transparent" />
          <div className="pointer-events-none w-8 h-full absolute right-0 top-0 z-10 bg-gradient-to-l from-gray-50 to-transparent" />
          
          {/* Scrollable Container */}
          <div 
            ref={carouselRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth-horizontal py-2"
            onWheel={(e) => {
              e.preventDefault();
              e.currentTarget.scrollLeft += e.deltaY;
            }}
          >
            {featuredFacilities.map((facility, index) => (
              <motion.div
                key={facility.id}
                className="min-w-[360px] max-w-[360px] shadow-md border border-gray-200 rounded-lg bg-white flex-shrink-0 overflow-hidden group"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.6 + (index * 0.1),
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -8,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                >
                  <img
                    alt={facility.title}
                    src={facility.imageUrl}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <motion.div 
                    className="absolute top-3 left-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 + (index * 0.1) }}
                  >
                    <Badge className="text-sm px-3 py-1.5 bg-white/90 text-gray-800 border-white/50 backdrop-blur-sm" variant="outline">
                      {facility.type}
                    </Badge>
                  </motion.div>
                  <motion.div 
                    className="absolute top-3 right-3"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 + (index * 0.1) }}
                  >
                    <span className="text-white font-semibold text-lg bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      {facility.price}
                    </span>
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  className="p-5 space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.0 + (index * 0.1) }}
                >
                  <h3 className="text-gray-900 font-semibold text-lg leading-tight transition-colors duration-200 group-hover:text-blue-600">
                    {facility.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                    {facility.description}
                  </p>
                  
                  <motion.div 
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 1.1 + (index * 0.1) }}
                  >
                    {facility.services.slice(0, 2).map((service, serviceIndex) => (
                      <motion.span
                        key={service}
                        className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 1.2 + (index * 0.1) + (serviceIndex * 0.05) }}
                      >
                        {service}
                      </motion.span>
                    ))}
                    {facility.services.length > 2 && (
                      <motion.span 
                        className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 1.3 + (index * 0.1) }}
                      >
                        +{facility.services.length - 2} more
                      </motion.span>
                    )}
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.2 + (index * 0.1) }}
                  >
                    <Button 
                      size="sm" 
                      className="w-full mt-4 bg-gray-900 text-white hover:bg-gray-800 text-sm h-9 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Book Now
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
            
            {/* View All Card */}
            <motion.div 
              className="min-w-[360px] max-w-[360px] flex-shrink-0"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.6 + (featuredFacilities.length * 0.1),
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -8,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="shadow-md border border-gray-200 rounded-lg bg-white hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer group">
                <motion.div 
                  className="h-48 border-2 border-dashed border-gray-300 group-hover:border-gray-400 transition-colors flex flex-col items-center justify-center text-center bg-gray-50"
                  whileHover={{ backgroundColor: "#f8fafc" }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="text-gray-400 mb-3"
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    transition={{ duration: 0.4 }}
                  >
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </motion.div>
                  <motion.h3 
                    className="font-semibold text-gray-700 text-base"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 1.0 + (featuredFacilities.length * 0.1) }}
                  >
                    Browse All
                  </motion.h3>
                </motion.div>
                
                <motion.div 
                  className="p-5 space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.1 + (featuredFacilities.length * 0.1) }}
                >
                  <h3 className="text-gray-900 font-semibold text-lg leading-tight group-hover:text-blue-600 transition-colors duration-200">
                    View All Facilities
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Discover more amazing sports venues and facilities in your area
                  </p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.2 + (featuredFacilities.length * 0.1) }}
                  >
                    <Button 
                      size="sm" 
                      className="w-full mt-4 bg-gray-900 text-white hover:bg-gray-800 text-sm h-9 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Explore More
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Popular Venues */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Venues</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {popularVenues.map((venue) => (
            <Card
              key={venue.id}
              className="overflow-hidden border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <img src={venue.image || "/placeholder.svg"} alt={venue.name} className="w-full h-48 object-cover" />
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{venue.name}</h3>
                <p className="text-gray-600 text-sm mb-2 flex items-center">
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
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">{venue.price}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm ml-1 text-gray-700">{venue.rating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Recent Activity</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Elite Sports Complex</h3>
                <Badge variant="outline" className="border-gray-300 text-gray-700">
                  Completed
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">Basketball Court A</p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                Jan 20, 2024 • 2:00 PM - 3:00 PM
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Community Recreation Center</h3>
                <Badge className="bg-gray-900 text-white">Upcoming</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">Tennis Court 2</p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                Jan 25, 2024 • 4:00 PM - 5:00 PM
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
