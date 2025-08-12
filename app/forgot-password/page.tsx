"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email'|'otp'|'reset'|'done'>('email')
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // OTP input handlers
  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value.replace(/\D/g, "") // digits only
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
    if (e.key === "ArrowLeft" && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
    if (e.key === "ArrowRight" && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }
    
    setError("")
    setMessage("")
    setIsLoading(true)
    
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
      
      let data = null
      
      // Try to parse JSON response
      try {
        const responseText = await res.text()
        console.log("Raw server response:", responseText)
        console.log("Response status:", res.status)
        console.log("Response headers:", Object.fromEntries(res.headers.entries()))
        
        if (responseText) {
          data = JSON.parse(responseText)
          console.log("Parsed data:", data)
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        setError(`Server response could not be parsed. Status: ${res.status}. Raw response: ${responseText || 'empty'}`)
        return
      }
      
      if (!res.ok) {
        const errorMsg = data?.error || `Server error (${res.status}): ${res.statusText}`
        console.error("Backend error details:", {
          status: res.status,
          statusText: res.statusText,
          data: data,
          headers: Object.fromEntries(res.headers.entries())
        })
        setError(`ERROR ${res.status}: ${errorMsg}`)
        return
      }
      
      setStep('otp')
      setMessage(data?.message || "A verification code has been sent to your email address")
      setOtp(["", "", "", "", "", ""]) // Reset OTP
      
    } catch (err: any) {
      console.error("Send OTP error:", err)
      console.error("Error details:", {
        name: err.name,
        message: err.message,
        stack: err.stack,
        cause: err.cause
      })
      setError(`Network error: ${err.message || 'Could not connect to server'} (${err.name || 'Unknown'})`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join("")
    
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code")
      return
    }
    
    setError("")
    setMessage("")
    setIsLoading(true)
    
    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otpCode })
      })
      
      let data = null
      const contentType = res.headers.get("content-type")
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json()
      } else {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`)
      }
      
      if (!res.ok) {
        throw new Error(data?.error || `Server error: ${res.status}`)
      }
      
      setStep('reset')
      setMessage("Code verified! Now enter your new password")
      
    } catch (err: any) {
      console.error("Verify OTP error:", err)
      setError(err.message || "Invalid verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError("")
    setMessage("")
    setIsLoading(true)
    
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
      
      let data = null
      const contentType = res.headers.get("content-type")
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json()
      } else {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`)
      }
      
      if (!res.ok) {
        throw new Error(data?.error || `Server error: ${res.status}`)
      }
      
      setOtp(["", "", "", "", "", ""])
      setMessage("A new verification code has been sent to your email")
      
    } catch (err: any) {
      console.error("Resend OTP error:", err)
      setError(err.message || "Failed to resend verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPassword.trim()) {
      setError("Please enter a new password")
      return
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      setError("Invalid verification code")
      return
    }
    
    setError("")
    setMessage("")
    setIsLoading(true)
    
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          otp: otpCode, 
          newPassword: newPassword.trim() 
        })
      })
      
      let data = null
      const contentType = res.headers.get("content-type")
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json()
      } else {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`)
      }
      
      if (!res.ok) {
        throw new Error(data?.error || `Server error: ${res.status}`)
      }
      
      setStep('done')
      setMessage("Password reset successful! You can now sign in with your new password")
      
    } catch (err: any) {
      console.error("Reset password error:", err)
      setError(err.message || "Failed to reset password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            {step === 'email' && 'Forgot Password'}
            {step === 'otp' && 'Verify Email'}
            {step === 'reset' && 'Reset Password'}
            {step === 'done' && 'Success'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Step 1: Email Input */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-300"
                  required
                  disabled={isLoading}
                />
              </div>
              
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-sm">{error}</AlertDescription>
                </Alert>
              )}
              
              {message && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-600 text-sm">{message}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
              
              <div className="text-center">
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
          
          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center text-sm text-gray-600 mb-4">
                Enter the 6-digit code sent to {email}
              </div>
              
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border-gray-300"
                    disabled={isLoading}
                  />
                ))}
              </div>
              
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-sm">{error}</AlertDescription>
                </Alert>
              )}
              
              {message && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-600 text-sm">{message}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('email')}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </div>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-gray-600 hover:text-gray-900"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Resend Code"}
                </Button>
              </div>
            </form>
          )}
          
          {/* Step 3: Password Reset */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-700">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-gray-300 pr-10"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-gray-300 pr-10"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </Button>
                </div>
              </div>
              
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-sm">{error}</AlertDescription>
                </Alert>
              )}
              
              {message && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-600 text-sm">{message}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('otp')}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          )}
          
          {/* Step 4: Success */}
          {step === 'done' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {message && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-600 text-sm text-center">{message}</AlertDescription>
                </Alert>
              )}
              
              <Link href="/login">
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                  Go to Login
                </Button>
              </Link>
            </div>
          )}
          
        </CardContent>
      </Card>
    </div>
  )
}
