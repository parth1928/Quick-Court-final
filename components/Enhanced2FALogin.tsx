'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import OTPVerification from '@/components/ui/otp-verification';

const Enhanced2FALogin: React.FC = () => {
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null);
  
  const router = useRouter();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          step: 'verify_password',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.step === 'verify_otp') {
          // Password verified, move to OTP step
          setStep('otp');
          setRateLimitInfo(data.rateLimitInfo);
        } else {
          // Direct login (shouldn't happen with new flow)
          localStorage.setItem('token', data.token);
          router.push('/user-home');
        }
      } else {
        setError(data.error || 'Login failed');
        if (data.rateLimitInfo) {
          setRateLimitInfo(data.rateLimitInfo);
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSuccess = (userData: any, token: string) => {
    // Store token and user data
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Redirect based on user role
    if (userData.role === 'admin') {
      router.push('/admin-dashboard');
    } else if (userData.role === 'owner') {
      router.push('/facility-dashboard');
    } else {
      router.push('/user-home');
    }
  };

  const handleBackToLogin = () => {
    setStep('login');
    setError('');
    setRateLimitInfo(null);
  };

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <OTPVerification
            email={email}
            onSuccess={handleOTPSuccess}
            onBack={handleBackToLogin}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">QC</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to QuickCourt</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-1"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {rateLimitInfo && rateLimitInfo.remainingAttempts < 3 && (
              <Alert>
                <AlertDescription>
                  {rateLimitInfo.remainingAttempts > 0 
                    ? `${rateLimitInfo.remainingAttempts} OTP attempts remaining in this session.`
                    : 'Rate limit reached. Please wait before requesting another OTP.'
                  }
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In with 2FA'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="text-blue-600 hover:text-blue-500">
                Sign up here
              </a>
            </p>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              🔒 <strong>Enhanced Security:</strong> This login uses Two-Factor Authentication (2FA). 
              You'll receive a verification code via email after entering your password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enhanced2FALogin;
