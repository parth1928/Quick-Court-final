'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Shield, RefreshCw } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  onSuccess: (userData: any, token: string) => void;
  onBack: () => void;
  className?: string;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onSuccess,
  onBack,
  className = '',
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for OTP expiry
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      
      // Auto-submit
      handleVerifyOTP(pastedData);
    }
  };

  const handleVerifyOTP = async (otpValue: string = otp.join('')) => {
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpValue,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Login successful! Redirecting...');
        onSuccess(data.user, data.token);
      } else {
        setError(data.error || 'Verification failed');
        
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }

        if (data.maxAttemptsExceeded) {
          setRemainingAttempts(0);
          // Clear OTP fields
          setOtp(['', '', '', '', '', '']);
        } else {
          // Clear OTP fields for retry
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('New OTP sent to your email');
        setTimeLeft(300); // Reset timer
        setResendCooldown(60); // 1 minute cooldown
        setOtp(['', '', '', '', '', '']); // Clear current OTP
        setRemainingAttempts(null);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || 'Failed to resend OTP');
        if (data.rateLimitInfo?.nextAttemptIn) {
          setResendCooldown(data.rateLimitInfo.nextAttemptIn);
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Enter Verification Code</CardTitle>
        <CardDescription>
          We've sent a 6-digit code to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* OTP Input */}
        <div className="space-y-2">
          <Label>Verification Code</Label>
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-lg font-semibold"
                disabled={isVerifying}
              />
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Code expires in: <span className="font-mono font-semibold text-red-600">
              {formatTime(timeLeft)}
            </span>
          </p>
        </div>

        {/* Remaining Attempts */}
        {remainingAttempts !== null && (
          <div className="text-center">
            <p className="text-sm text-orange-600">
              {remainingAttempts > 0 
                ? `${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining`
                : 'Maximum attempts exceeded'
              }
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => handleVerifyOTP()}
            disabled={isVerifying || otp.some(digit => !digit)}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={isResending || resendCooldown > 0}
              className="flex-1"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend ({resendCooldown}s)
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Code
                </>
              )}
            </Button>

            <Button variant="ghost" onClick={onBack} className="flex-1">
              Back to Login
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500">
          <p>Didn't receive the code? Check your spam folder or try resending.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OTPVerification;
