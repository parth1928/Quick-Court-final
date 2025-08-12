"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PriceRangeSlider, TimeRangeSlider, MinimalSlider } from "@/components/ui/enhanced-slider"
import { Calendar, TrendingUp, DollarSign, Users, Clock, Filter } from "lucide-react"

export default function Reports() {
  const [revenueRange, setRevenueRange] = useState([0, 5000])
  const [timeFilter, setTimeFilter] = useState([9, 18])
  const [utilizationRange, setUtilizationRange] = useState([0])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">Analyze performance and track key metrics for your facilities</p>
      </div>

      {/* Filter Controls */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Revenue Range ($)</label>
              <PriceRangeSlider 
                value={revenueRange} 
                onValueChange={setRevenueRange} 
                max={10000} 
                min={0} 
                step={100}
                currency="$"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Peak Hours Filter</label>
              <TimeRangeSlider 
                value={timeFilter} 
                onValueChange={setTimeFilter} 
                min={6} 
                max={23}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Min Utilization Rate (%)</label>
              <MinimalSlider 
                value={utilizationRange} 
                onValueChange={setUtilizationRange} 
                max={100} 
                min={0} 
                color="green"
              />
              <div className="text-sm text-gray-600 mt-1">
                {utilizationRange[0]}% and above
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">$12,450</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">234</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
                <p className="text-2xl font-bold text-gray-900">78%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Peak Hour</p>
                <p className="text-2xl font-bold text-gray-900">6-8 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Revenue chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Court Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Utilization chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Court */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Performance by Court</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Basketball Court A", revenue: "$3,200", utilization: "85%", bookings: 64 },
              { name: "Tennis Court 1", revenue: "$2,800", utilization: "72%", bookings: 56 },
              { name: "Volleyball Court", revenue: "$1,900", utilization: "65%", bookings: 38 },
            ].map((court, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{court.name}</h3>
                  <p className="text-sm text-gray-600">{court.bookings} bookings this month</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{court.revenue}</p>
                  <p className="text-sm text-gray-600">{court.utilization} utilization</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
