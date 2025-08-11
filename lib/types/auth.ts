// Authentication related types
export interface LoginRequest {
  email: string;
  password: string;
  step?: 'verify_password' | 'direct_login';
}

export interface LoginResponse {
  message?: string;
  step?: 'verify_otp';
  user?: UserData;
  token?: string;
  rateLimitInfo?: RateLimitInfo;
}

export interface OTPVerificationRequest {
  email: string;
  otp: string;
}

export interface OTPVerificationResponse {
  message: string;
  user: UserData;
  token: string;
  remainingAttempts?: number;
  maxAttemptsExceeded?: boolean;
}

export interface ResendOTPRequest {
  email: string;
}

export interface ResendOTPResponse {
  message: string;
  rateLimitInfo: RateLimitInfo;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'user' | 'owner';
  enable2FA?: boolean;
  step?: 'register';
}

export interface RegisterResponse {
  message?: string;
  step?: 'verify_otp';
  user: UserData;
  token?: string;
}

// User data structure
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'admin';
  phone?: string;
  avatar?: string;
}

// Rate limiting types
export interface RateLimitInfo {
  remainingAttempts: number;
  nextAttemptIn?: number; // seconds
}

export interface RateLimitStatus {
  allowed: boolean;
  remainingAttempts: number;
  nextAttemptIn?: number;
  message: string;
}

// OTP related types
export interface OTPEmailData {
  email: string;
  otp: string;
  userName?: string;
  expiryMinutes?: number;
}

export interface OTPRecord {
  email: string;
  otp: string;
  expiry: Date;
  attempts: number;
  createdAt: Date;
}

// API Error response
export interface ApiError {
  error: string;
  rateLimitInfo?: RateLimitInfo;
  remainingAttempts?: number;
  maxAttemptsExceeded?: boolean;
}

// Email configuration
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

// JWT payload
export interface JWTPayload {
  userId: string;
  role: string;
  email: string;
  iat?: number;
  exp?: number;
}
