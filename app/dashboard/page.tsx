"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Calendar, Users, Activity, TrendingUp } from "lucide-react"

const statsData = [
  {
    title: "Total Users",
    value: "12,847",
    icon: Users,
    change: "+12%",
    changeType: "positive" as const,
  },
  {
    title: "Total Facility Owners",
    value: "1,234",
    icon: Building2,
    change: "+8%",
    changeType: "positive" as const,
  },
  {
    title: "Total Bookings",
    value: "45,678",
    icon: Calendar,
    change: "+23%",
    changeType: "positive" as const,
  },
  {
    title: "Pending Approvals",
    value: "23",
    icon: Activity,
    change: "+5 today",
    changeType: "positive" as const,
  },
]

export default function AdminDashboard() {
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("user")
      const authToken = localStorage.getItem("authToken")

      if (!user || !authToken) {
        router.push("/login")
        return
      }

      const parsedUser = JSON.parse(user)
      if (parsedUser.userType !== "admin") {
        // Redirect non-admin users to their appropriate dashboard
        switch (parsedUser.userType) {
          case "facility-owner":
            router.push("/facility-dashboard")
            return
          case "user":
            router.push("/user-home")
            return
          default:
            router.push("/login")
            return
        }
      }

      setUserData(parsedUser)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {userData.name}! Here&apos;s your platform overview</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => (
          <Card key={stat.title} className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-gray-600 mr-1" />
                <span className="text-xs text-gray-600">{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Facility Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Elite Sports Complex", owner: "John Smith", date: "2024-01-20", status: "Pending" },
                { name: "Community Center", owner: "Sarah Johnson", date: "2024-01-19", status: "Approved" },
                { name: "Tennis Club Pro", owner: "Mike Wilson", date: "2024-01-18", status: "Pending" },
              ].map((facility, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">{facility.name}</h4>
                    <p className="text-sm text-gray-600">Owner: {facility.owner}</p>
                    <p className="text-xs text-gray-500">{facility.date}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      facility.status === "Approved" ? "bg-gray-100 text-gray-700" : "bg-gray-900 text-white"
                    }`}
                  >
                    {facility.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New user registration", user: "Alice Brown", time: "2 hours ago" },
                { action: "Facility approved", user: "System", time: "4 hours ago" },
                { action: "Booking completed", user: "David Lee", time: "6 hours ago" },
                { action: "User reported issue", user: "Emma Davis", time: "8 hours ago" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">{activity.action}</h4>
                    <p className="text-sm text-gray-600">{activity.user}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
