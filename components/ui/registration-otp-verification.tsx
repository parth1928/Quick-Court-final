'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Shield, RefreshCw } from 'lucide-react';

interface RegistrationOTPVerificationProps {
  email: string;
  onSuccess: (userData: any, token: string) => void;
  onBack: () => void;
  className?: string;
  showCard?: boolean; // New prop to control Card wrapper
}

const RegistrationOTPVerification: React.FC<RegistrationOTPVerificationProps> = ({
  email,
  onSuccess,
  onBack,
  className = '',
  showCard = true, // Default to true for backward compatibility
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

    console.log('🔐 Starting OTP verification for:', email);
    console.log('🕐 Current time:', new Date().toISOString());

    try {
      // Use the registration endpoint with verify_otp step
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpValue,
          step: 'verify_otp',
        }),
      });

      const data = await response.json();
      
      console.log('📡 OTP verification response:', {
        status: response.status,
        code: data.code,
        error: data.error,
        debug: data.debug
      });

      if (response.ok) {
        console.log('✅ Registration successful!');
        setSuccess('Registration successful! Redirecting...');
        onSuccess(data.user, data.token);
      } else {
        console.log('❌ OTP verification failed:', data.error);
        setError(data.error || 'Verification failed');
        
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
          console.log(`⚠️ Remaining attempts: ${data.remainingAttempts}`);
        }

        if (data.maxAttemptsExceeded || data.code === 'SESSION_EXPIRED') {
          setRemainingAttempts(0);
          // Clear OTP fields
          setOtp(['', '', '', '', '', '']);
          
          // For session expired, show specific message and redirect back
          if (data.code === 'SESSION_EXPIRED') {
            console.log('💥 Session expired - showing debug info:', data.debug);
            setError('Registration session expired. Redirecting back to sign up...');
            setTimeout(() => {
              onBack();
            }, 3000);
          }
        } else {
          // Clear OTP fields for retry
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }
    } catch (error) {
      console.error('🌐 Network error during OTP verification:', error);
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
      const response = await fetch('/api/auth/resend-registration-otp', {
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

  const content = (
    <>
      {/* Header - only show if using Card wrapper */}
      {showCard && (
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
      )}

      {/* Icon and title for non-card mode */}
      {!showCard && (
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-sm text-gray-600">
            We've sent a 6-digit verification code to <strong>{email}</strong>
          </p>
        </div>
      )}

      <CardContent className={showCard ? "space-y-6" : "space-y-6 p-0"}>
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
            <AlertDescription className="text-green-700">{success}</AlertDescription>
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

          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={onBack}
              disabled={isVerifying || isResending}
              className="text-sm"
            >
              ← Back to Registration
            </Button>

            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={isResending || resendCooldown > 0}
              className="text-sm"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend (${resendCooldown}s)`
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Code
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500">
          <p>Didn't receive the code? Check your spam folder.</p>
          <p>Code expires after 5 minutes.</p>
        </div>
      </CardContent>
    </>
  );

  return showCard ? (
    <Card className={className}>
      {content}
    </Card>
  ) : (
    <div className={className}>
      {content}
    </div>
  );
};

export default RegistrationOTPVerification;
