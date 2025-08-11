"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SignUpPage() {
  const router = useRouter()

  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Auth state
  const [userType, setUserType] = useState<"user" | "owner" | "admin">("user")
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", phone: "" })

  // OTP flow
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [postSignupRoute, setPostSignupRoute] = useState("/")

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: userType,
          phone: formData.phone.trim() || "+1234567890",
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || data.message || "Registration failed")

      // Store lightweight user info (token assumed HTTP-only cookie)
      localStorage.setItem(
        "user",
        JSON.stringify({ ...data.user, loginTime: new Date().toISOString() })
      )

      // Decide route; skip OTP for facility owners (temporary disable for owners)
      let route = '/user-home'
      if (data.user.role === 'owner') route = '/facility-dashboard'
      if (data.user.role === 'admin') route = '/admin-dashboard'
      if (data.user.role === 'owner') {
        router.push(route)
        return
      }
      setPostSignupRoute(route)
      setShowOTPModal(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed"
      setErrorMsg(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value.replace(/\D/g, "") // digits only
    setOtp(newOtp)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
    if (e.key === "ArrowLeft" && index > 0) document.getElementById(`otp-${index - 1}`)?.focus()
    if (e.key === "ArrowRight" && index < 5) document.getElementById(`otp-${index + 1}`)?.focus()
  }

  const handleVerifyOTP = async () => {
    // TODO: call backend to verify OTP with the 6-digit code
    // const code = otp.join("")
    setShowOTPModal(false)
    router.push(postSignupRoute)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flex w-full max-w-4xl rounded-lg shadow-lg overflow-hidden bg-white">
        {/* Left: Illustration (small & fixed to reduce scroll) */}
        <div className="hidden md:flex md:w-5/12 bg-gray-100 p-2">
          <img
            src="https://img.freepik.com/free-photo/woman-playing-tennis-full-shot_23-2149036416.jpg?t=st=1754908993~exp=1754912593~hmac=50369d3d421502b36127f15897d3a3cbfa5e32ad16b54a46046fb458e0a6b157&w=360%20360w"
            alt="Sign up"
            className="object-cover object-center w-full h-full rounded-xl"
            style={{ minHeight: '400px', maxHeight: '800px' }}
          />
        </div>

        {/* Right: Form (compact spacing) */}
        <div className="w-full md:w-7/12 p-6 flex flex-col justify-center gap-5">
          {/* Brand + Title */}
          <div className="text-center space-y-1">
            <Link href="/welcome" className="mx-auto mb-3 flex items-center justify-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
                <span className="text-sm font-bold text-white">QC</span>
              </div>
              <span className="text-xl font-bold text-gray-900">QuickCourt</span>
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-sm text-gray-600">Join QuickCourt and start managing venues</p>
          </div>

          {/* Card with condensed fields */}
          <Card className="border-gray-200">
            <CardContent className="pt-4">
              <form onSubmit={handleSignUp} className="space-y-3">
                {/* Role */}
                <div className="space-y-1.5">
                  <Label htmlFor="userType" className="text-gray-700 text-sm">
                    Account Type
                  </Label>
                  <Select value={userType} onValueChange={(v) => setUserType(v as any)}>
                    <SelectTrigger id="userType" className="h-10 border-gray-300">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="owner">Facility Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-gray-700 text-sm">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="h-10 border-gray-300"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-gray-700 text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-10 border-gray-300"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-gray-700 text-sm">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-10 border-gray-300"
                    required
                  />
                </div>

                {/* Password + toggle */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-gray-700 text-sm">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-10 border-gray-300 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </Button>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="text-xs text-gray-600">
                    I agree to the{" "}
                    <Link href="/terms" className="font-medium text-gray-900 hover:text-gray-700">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="font-medium text-gray-900 hover:text-gray-700">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                {/* Error */}
                {errorMsg && (
                  <p className="text-sm text-red-600" role="alert">
                    {errorMsg}
                  </p>
                )}

                {/* Submit */}
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-70"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>

                {/* Link */}
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-gray-900 hover:text-gray-700">
                    Sign in
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* OTP Verification Modal (compact) */}
      <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
        <DialogContent className="sm:max-w-md border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Verify Your Email</DialogTitle>
            <DialogDescription className="text-gray-600">
              We sent a 6-digit code to your email. Enter it to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  inputMode="numeric"
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="h-10 w-10 text-center text-lg font-semibold border-gray-300"
                />
              ))}
            </div>

            <div className="flex gap-2">
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
              <Button
                variant="link"
                className="text-sm text-gray-900"
                onClick={() => {
                  // TODO: call resend endpoint
                }}
              >
                Resend Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
