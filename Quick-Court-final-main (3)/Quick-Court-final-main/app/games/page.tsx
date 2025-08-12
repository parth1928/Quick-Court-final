"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Users, Clock, Search, Gamepad2 } from "lucide-react"

interface Game {
  id: string
  name: string
  category: string
  playersMin: number
  playersMax: number
  duration: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  description: string
  image: string
  venues: number
  popularity: number
}

const games: Game[] = [
  {
    id: "1",
    name: "Basketball",
    category: "Team Sports",
    playersMin: 8,
    playersMax: 10,
    duration: "40-60 mins",
    difficulty: "Intermediate",
    description: "Fast-paced team sport played on a court with hoops. Great for cardio and team building.",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=300&fit=crop",
    venues: 45,
    popularity: 95
  },
  {
    id: "2",
    name: "Tennis",
    category: "Racket Sports",
    playersMin: 2,
    playersMax: 4,
    duration: "60-90 mins",
    difficulty: "Intermediate",
    description: "Classic racket sport that can be played singles or doubles. Perfect for improving agility and focus.",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&h=300&fit=crop",
    venues: 38,
    popularity: 88
  },
  {
    id: "3",
    name: "Badminton",
    category: "Racket Sports",
    playersMin: 2,
    playersMax: 4,
    duration: "30-60 mins",
    difficulty: "Beginner",
    description: "Indoor racket sport with shuttlecocks. Easy to learn and great for all skill levels.",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&h=300&fit=crop",
    venues: 52,
    popularity: 82
  },
  {
    id: "4",
    name: "Football",
    category: "Team Sports",
    playersMin: 18,
    playersMax: 22,
    duration: "90 mins",
    difficulty: "Intermediate",
    description: "The world's most popular sport. Great for endurance, teamwork, and tactical thinking.",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=300&fit=crop",
    venues: 28,
    popularity: 92
  },
  {
    id: "5",
    name: "Volleyball",
    category: "Team Sports",
    playersMin: 12,
    playersMax: 12,
    duration: "60-90 mins",
    difficulty: "Intermediate",
    description: "Team sport played with a net. Excellent for jumping ability and hand-eye coordination.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
    venues: 31,
    popularity: 75
  },
  {
    id: "6",
    name: "Cricket",
    category: "Team Sports",
    playersMin: 22,
    playersMax: 22,
    duration: "3-8 hours",
    difficulty: "Advanced",
    description: "Strategic bat-and-ball game. Requires patience, skill, and tactical awareness.",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&h=300&fit=crop",
    venues: 18,
    popularity: 78
  },
  {
    id: "7",
    name: "Table Tennis",
    category: "Racket Sports",
    playersMin: 2,
    playersMax: 4,
    duration: "30-45 mins",
    difficulty: "Beginner",
    description: "Fast-paced indoor sport requiring quick reflexes and precision. Perfect for small spaces.",
    image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=500&h=300&fit=crop",
    venues: 67,
    popularity: 71
  },
  {
    id: "8",
    name: "Swimming",
    category: "Individual Sports",
    playersMin: 1,
    playersMax: 8,
    duration: "30-60 mins",
    difficulty: "Beginner",
    description: "Full-body workout in water. Excellent for cardiovascular health and muscle strength.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop",
    venues: 22,
    popularity: 85
  },
  {
    id: "9",
    name: "Squash",
    category: "Racket Sports",
    playersMin: 2,
    playersMax: 2,
    duration: "45-60 mins",
    difficulty: "Advanced",
    description: "High-intensity racket sport in an enclosed court. Great for fitness and agility.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
    venues: 15,
    popularity: 68
  },
  {
    id: "10",
    name: "Hockey",
    category: "Team Sports",
    playersMin: 20,
    playersMax: 22,
    duration: "70 mins",
    difficulty: "Advanced",
    description: "Fast-paced team sport with sticks and ball. Requires skill, speed, and teamwork.",
    image: "https://images.unsplash.com/photo-1578763089554-8255e73e6ed4?w=500&h=300&fit=crop",
    venues: 12,
    popularity: 64
  },
  {
    id: "11",
    name: "Boxing",
    category: "Combat Sports",
    playersMin: 2,
    playersMax: 2,
    duration: "45-60 mins",
    difficulty: "Advanced",
    description: "Combat sport focusing on punching techniques. Great for fitness, discipline, and self-defense.",
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=500&h=300&fit=crop",
    venues: 19,
    popularity: 73
  },
  {
    id: "12",
    name: "Yoga",
    category: "Fitness",
    playersMin: 1,
    playersMax: 20,
    duration: "60-90 mins",
    difficulty: "Beginner",
    description: "Mind-body practice combining physical postures, breathing, and meditation.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=300&fit=crop",
    venues: 34,
    popularity: 79
  }
]

export default function GamesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")

  const categories = ["all", ...Array.from(new Set(games.map(game => game.category)))]
  const difficulties = ["all", "Beginner", "Intermediate", "Advanced"]

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || game.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "all" || game.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800"
      case "Intermediate": return "bg-yellow-100 text-yellow-800"
      case "Advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Games</h1>
          <p className="text-gray-600">Discover sports and activities available at our venues</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === "all" ? "All Levels" : difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredGames.length} of {games.length} games
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="relative">
                <img 
                  src={game.image} 
                  alt={game.name} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <Badge className={`${getDifficultyColor(game.difficulty)} border-0`}>
                    {game.difficulty}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">{game.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Gamepad2 className="h-4 w-4 mr-1" />
                    {game.popularity}%
                  </div>
                </div>

                <Badge variant="outline" className="mb-3 text-xs">
                  {game.category}
                </Badge>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {game.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    {game.playersMin === game.playersMax 
                      ? `${game.playersMin} players` 
                      : `${game.playersMin}-${game.playersMax} players`
                    }
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {game.duration}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    {game.venues} venues available
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/venues?sport=${game.name.toLowerCase()}`}>
                      Find Venues
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/games/${game.id}`}>
                      Learn More
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <Gamepad2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No games found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find more games.</p>
          </div>
        )}

        {/* Popular Categories */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(1).map((category) => (
              <Card 
                key={category} 
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {games.filter(game => game.category === category).length}
                  </div>
                  <div className="text-sm font-medium text-gray-900">{category}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
