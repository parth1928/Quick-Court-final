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
// Removed user type selection; role determined at signup

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  // Role no longer selected here; backend determines by account
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

  // Store user data locally (token is already set in HTTP-only cookie by API)
  localStorage.setItem("user", JSON.stringify(data.user))

      // Redirect based on user type
      switch (data.user.role) {
        case "admin":
          router.push("/admin-dashboard")
          break
        case "owner":
          router.push("/facility-dashboard")
          break
        case "user":
          router.push("/user-home")
          break
        default:
          router.push("/")
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false)
    }
  }

  // Removed getUserName since role selection is gone

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left side: Photo */}
        <div className="hidden md:flex md:w-1/2 bg-gray-100 p-2">
          <img
            src="https://img.freepik.com/free-photo/woman-playing-tennis-full-shot_23-2149036416.jpg?t=st=1754908993~exp=1754912593~hmac=50369d3d421502b36127f15897d3a3cbfa5e32ad16b54a46046fb458e0a6b157&w=360%20360w"
            alt="Login illustration"
            className="object-cover w-full h-full rounded-xl"
            style={{ minHeight: '400px', maxHeight: '600px' }}
          />
        </div>
        {/* Right side: Login Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center space-y-8">
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
                    Don't have an account?{" "}
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
    </div>
  )
}
