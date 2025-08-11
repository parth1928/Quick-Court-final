"use client"

import type React from "react"
import { useState } from "react"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Laptop } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
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
          password,
          step: 'verify_password' // Use direct login to bypass 2FA for existing UI
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Login failed:', data);
        // Handle specific error cases
        if (response.status === 429) {
          alert('Too many login attempts. Please try again later.');
        } else {
          alert(data.error || 'Login failed. Please check your credentials.');
        }
        return;
      }

      // Check if this is a 2FA flow response
      if (data.step === 'verify_otp') {
        alert('2FA is required but not implemented in this UI. Please use the enhanced login page.');
        return;
      }

      // Store user data locally (token is already set in HTTP-only cookie by API)
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));

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
      } else {
        alert('Login response invalid. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false)
    }
  }

  // Removed getUserName since role selection is gone

  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left side: Photo */}
        <div className="hidden md:flex md:w-1/2 bg-gray-100 p-2">
          <img
            src="/woman.jpg"
            alt="Login illustration"
            className="object-cover object-center w-full h-full rounded-xl min-h-[400px] max-h-[600px]"
          />
        </div>
        {/* Right side: Login Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center space-y-8">
          {/* Header with Theme Toggle */}
          <div className="flex flex-col items-center">
            <div className="flex w-full justify-between items-center mb-8">
              <Link href="/welcome" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">QC</span>
                </div>
                <span className="text-xl font-bold text-gray-900">QuickCourt</span>
              </Link>
              {/* Theme Toggle Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Toggle theme">
                    {theme === "dark" ? <Moon className="h-5 w-5" /> : theme === "light" ? <Sun className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                    <DropdownMenuRadioItem value="light">
                      <Sun className="mr-2 h-4 w-4" /> Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <Moon className="mr-2 h-4 w-4" /> Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                      <Laptop className="mr-2 h-4 w-4" /> System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
                      aria-label="Remember me for future logins"
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
