"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState("admin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate authentication
    setTimeout(() => {
      const userData = {
        email,
        userType,
        name: getUserName(userType),
        loginTime: new Date().toISOString(),
      }

      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("authToken", "mock-auth-token")

      setIsLoading(false)

      // Redirect based on user type
      switch (userType) {
        case "admin":
          router.push("/")
          break
        case "facility-owner":
          router.push("/facility-dashboard")
          break
        case "user":
          router.push("/user-home")
          break
        default:
          router.push("/")
      }
    }, 1000)
  }

  const getUserName = (type: string) => {
    switch (type) {
      case "admin":
        return "Admin User"
      case "facility-owner":
        return "Facility Owner"
      case "user":
        return "Regular User"
      default:
        return "User"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/welcome" className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">QC</span>
            </div>
            <span className="text-xl font-bold text-gray-900">QuickCourt</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Sign In</CardTitle>
            <CardDescription className="text-gray-600">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userType" className="text-gray-700">
                  Sign in as
                </Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="facility-owner">Facility Owner</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-300"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
                    Remember me
                  </Label>
                </div>
                <Link href="/forgot-password" className="text-sm text-gray-900 hover:text-gray-700">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-gray-900 hover:text-gray-700 font-medium">
                    Sign up
                  </Link>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
