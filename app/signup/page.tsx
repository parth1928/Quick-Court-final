"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState("user")
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  })
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setErrorMsg(null)
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: userType,
          phone: formData.phone.trim() || '+1234567890',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }

      // Store user (token already in HTTP-only cookie)
      localStorage.setItem('user', JSON.stringify({
        ...data.user,
        loginTime: new Date().toISOString(),
      }));

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
    } catch (error) {
      console.error('Registration error:', error);
      const msg = error instanceof Error ? error.message : 'Registration failed'
      setErrorMsg(msg)
      alert(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleVerifyOTP = async () => {
    // In a real implementation, we would verify the OTP with the backend
    // For now, we'll just close the modal as the registration is already complete
    setShowOTPModal(false)
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
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">Join QuickCourt and start managing venues</p>
        </div>

        {/* Sign Up Form */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Sign Up</CardTitle>
            <CardDescription className="text-gray-600">Fill in your details to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userType" className="text-gray-700">
                  Account Type
                </Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="owner">Facility Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="border-gray-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-gray-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-gray-700">
                  Profile Picture
                </Label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border border-gray-300">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <Button type="button" variant="outline" size="sm" className="border-gray-300 bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <Label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-gray-900 hover:text-gray-700">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-gray-900 hover:text-gray-700">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {errorMsg && (
                <p className="text-sm text-red-600" role="alert">{errorMsg}</p>
              )}
              <Button disabled={isSubmitting} type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-70">
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-gray-900 hover:text-gray-700 font-medium">
                    Sign in
                  </Link>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* OTP Verification Modal */}
        <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
          <DialogContent className="sm:max-w-md border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Verify Your Email</DialogTitle>
              <DialogDescription className="text-gray-600">
                We've sent a 6-digit verification code to your email address. Please enter it below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    className="w-12 h-12 text-center text-lg font-semibold border-gray-300"
                  />
                ))}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 bg-transparent"
                  onClick={() => setShowOTPModal(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1 bg-gray-900 hover:bg-gray-800" onClick={handleVerifyOTP}>
                  Verify
                </Button>
              </div>
              <div className="text-center">
                <Button variant="link" className="text-sm text-gray-900">
                  Resend Code
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
