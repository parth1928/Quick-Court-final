"use client"

import { Header } from "@/components/header"
import { VenuesGrid } from "@/components/ui/venues-grid"

export default function VenuesShowcasePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Discover Amazing Sports Venues
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find and book the perfect venue for your next game. From premium courts to 
            community centers, we have something for every sport and budget.
          </p>
        </div>

        {/* Venues Grid */}
        <VenuesGrid />
      </main>
    </div>
  )
}
