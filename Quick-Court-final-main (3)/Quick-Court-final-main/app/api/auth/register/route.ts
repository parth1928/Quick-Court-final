import { NextResponse } from 'next/server';
// Ensure this route runs in the Node.js runtime (not Edge) so nodemailer works
export const runtime = 'nodejs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { generateOTP, hashOTP, createOTPExpiry, validateOTPFormat } from '@/utils/generateOtp';
import { sendOTPEmail } from '@/utils/sendEmail';
import { checkOTPRateLimit } from '@/utils/rateLimiting';

// Assert JWT_SECRET is defined and cast it as string
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Enhanced pending users storage with TTL
class PendingUsersManager {
  private static instance: PendingUsersManager;
  private pendingUsers = new Map<string, any>();
  private cleanupInterval: NodeJS.Timeout;

  private constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  static getInstance(): PendingUsersManager {
    if (!PendingUsersManager.instance) {
      PendingUsersManager.instance = new PendingUsersManager();
    }
    return PendingUsersManager.instance;
  }

  set(key: string, data: any, ttlMinutes: number = 10): void {
    this.pendingUsers.set(key, {
      ...data,
      expiresAt: Date.now() + (ttlMinutes * 60 * 1000)
    });
  }

  get(key: string): any | null {
    const data = this.pendingUsers.get(key);
    if (!data) return null;
    
    if (Date.now() > data.expiresAt) {
      this.pendingUsers.delete(key);
      return null;
    }
    
    return data;
  }

  delete(key: string): void {
    this.pendingUsers.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.pendingUsers.entries()) {
      if (now > data.expiresAt) {
        this.pendingUsers.delete(key);
      }
    }
  }
}

const pendingUsersManager = PendingUsersManager.getInstance();

// Helper function to get client IP
function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    // Read the request body only ONCE
    const requestBody = await req.json();
    const { 
      name, 
      email, 
      password, 
      phone = '+1234567890', 
      role = 'user',
      step = 'register',
      otp
    } = requestBody;

    const allowedRoles = ['user','owner'];
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Step 1: Initial registration request
    if (step === 'register') {
      // Enhanced validation
      if (!name?.trim() || !email?.trim() || !password) {
        return NextResponse.json({ 
          error: 'Name, email, and password are required',
          code: 'MISSING_FIELDS'
        }, { status: 400 });
      }
      
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return NextResponse.json({ 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL'
        }, { status: 400 });
      }
      
      if (password.length < 8) {
        return NextResponse.json({ 
          error: 'Password must be at least 8 characters',
          code: 'WEAK_PASSWORD'
        }, { status: 400 });
      }
      
      if (!allowedRoles.includes(role)) {
        return NextResponse.json({ 
          error: 'Invalid role',
          code: 'INVALID_ROLE'
        }, { status: 400 });
      }

      const normalizedEmail = email.toLowerCase();

      // Check if user already exists
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return NextResponse.json({
          error: 'Email already registered',
          code: 'EMAIL_EXISTS'
        }, { status: 400 });
      }

      // Check rate limiting with IP tracking
      const rateLimitStatus = await checkOTPRateLimit(normalizedEmail, clientIP);
      if (!rateLimitStatus.allowed) {
        return NextResponse.json({
          error: rateLimitStatus.message,
          code: 'RATE_LIMITED',
          rateLimitInfo: {
            remainingAttempts: rateLimitStatus.remainingAttempts,
            nextAttemptIn: rateLimitStatus.nextAttemptIn,
          }
        }, { status: 429 });
      }

      // Store pending user data with TTL
      const userKey = `pending_${normalizedEmail}`;
      pendingUsersManager.set(userKey, {
        name: name.trim(),
        email: normalizedEmail,
        password,
        phone,
        role,
        clientIP,
        userAgent
      }, 15); // 15 minutes TTL

      // Delete any existing OTPs for this email and purpose
      await OTP.deleteMany({ 
        email: normalizedEmail, 
        purpose: 'registration' 
      });

      // Generate OTP with enhanced security
      const otpCode = generateOTP();
      const hashedOtp = await hashOTP(otpCode);
      const expiry = createOTPExpiry();

      // For development only - remove in production
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔐 Generated OTP for ${normalizedEmail}: ${otpCode}`);
      }

      // Save OTP to database with enhanced tracking
      const otpRecord = new OTP({
        email: normalizedEmail,
        otp: hashedOtp,
        expiry,
        attempts: 0,
        purpose: 'registration',
        ipAddress: clientIP,
        userAgent,
      });
      
      await otpRecord.save();

      // Send OTP email
      console.log(`� Sending OTP email to ${normalizedEmail}`);
      const emailResult = await sendOTPEmail({
        email: normalizedEmail,
        otp: otpCode,
        userName: name.trim(),
        expiryMinutes: 5,
      });

      if (!emailResult.success) {
        // Clean up if email failed
        console.error(`❌ Failed to send OTP email to ${normalizedEmail}:`, emailResult.error);
        await OTP.deleteOne({ _id: otpRecord._id });
        pendingUsersManager.delete(userKey);
        
        let errorMessage = 'Failed to send verification email. Please try again.';
        let errorCode = 'EMAIL_FAILED';
        
        if (emailResult.error) {
          if (emailResult.error.includes('535-5.7.8')) {
            errorMessage = 'Email service configuration error. Please contact support.';
            errorCode = 'EMAIL_CONFIG_ERROR';
          } else if (emailResult.error.includes('ECONNREFUSED')) {
            errorMessage = 'Could not connect to email service. Please try again later.';
            errorCode = 'EMAIL_CONNECTION_ERROR';
          }
        }
        
        return NextResponse.json({
          error: errorMessage,
          code: errorCode
        }, { status: 500 });
      }
      
      console.log(`✅ Successfully sent OTP email to ${normalizedEmail}`);

      return NextResponse.json({
        message: 'Verification code sent to your email. Please check your inbox.',
        step: 'verify_otp',
        email: normalizedEmail,
        expiresIn: 300, // 5 minutes in seconds
      }, { status: 200 });
    }

    // Step 2: OTP verification and user creation
    if (step === 'verify_otp') {
      if (!email || !otp) {
        return NextResponse.json({ 
          error: 'Email and OTP are required',
          code: 'MISSING_FIELDS'
        }, { status: 400 });
      }

      if (!validateOTPFormat(otp)) {
        return NextResponse.json({ 
          error: 'OTP must be exactly 6 digits',
          code: 'INVALID_OTP_FORMAT'
        }, { status: 400 });
      }

      const normalizedEmail = email.toLowerCase();
      const userKey = `pending_${normalizedEmail}`;

      // Check if pending user data exists
      const pendingUserData = pendingUsersManager.get(userKey);
      if (!pendingUserData) {
        return NextResponse.json({ 
          error: 'Registration session expired. Please sign up again.',
          code: 'SESSION_EXPIRED'
        }, { status: 410 });
      }

      // Find the most recent OTP for this email and purpose
      const otpRecord = await OTP.findOne({
        email: normalizedEmail,
        purpose: 'registration',
      }).sort({ createdAt: -1 });

      if (!otpRecord) {
        return NextResponse.json({ 
          error: 'No OTP found. Please request a new one.',
          code: 'OTP_NOT_FOUND'
        }, { status: 404 });
      }

      // Check if OTP has expired
      if (new Date() > otpRecord.expiry) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return NextResponse.json({ 
          error: 'OTP has expired. Please request a new one.',
          code: 'OTP_EXPIRED'
        }, { status: 410 });
      }

      // Check if maximum attempts exceeded
      if (otpRecord.attempts >= 3) {
        await OTP.deleteOne({ _id: otpRecord._id });
        pendingUsersManager.delete(userKey);
        return NextResponse.json({ 
          error: 'Maximum verification attempts exceeded. Please sign up again.',
          code: 'MAX_ATTEMPTS_EXCEEDED',
          maxAttemptsExceeded: true,
        }, { status: 429 });
      }

      // Verify OTP
      const { verifyOTP } = await import('@/utils/generateOtp');
      const isOTPValid = await verifyOTP(otp, otpRecord.otp);
      
      if (!isOTPValid) {
        // Increment failed attempts
        otpRecord.attempts += 1;
        await otpRecord.save();
        
        const remainingAttempts = Math.max(0, 3 - otpRecord.attempts);
        
        if (remainingAttempts === 0) {
          await OTP.deleteOne({ _id: otpRecord._id });
          pendingUsersManager.delete(userKey);
          return NextResponse.json({ 
            error: 'Invalid OTP. Maximum attempts exceeded. Please sign up again.',
            code: 'INVALID_OTP_MAX_EXCEEDED',
            maxAttemptsExceeded: true,
          }, { status: 429 });
        }

        return NextResponse.json({ 
          error: 'Invalid OTP. Please try again.',
          code: 'INVALID_OTP',
          remainingAttempts,
        }, { status: 401 });
      }

      // OTP is valid - create the user account now
      try {
        const user = await User.create({
          name: pendingUserData.name,
          email: pendingUserData.email,
          password: pendingUserData.password,
          phone: pendingUserData.phone,
          role: pendingUserData.role,
        });

        // Clean up
        await OTP.deleteOne({ _id: otpRecord._id });
        pendingUsersManager.delete(userKey);

        // Generate JWT token with proper structure matching login route
        const token = jwt.sign(
          {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        // Create user data to return (exclude sensitive info)
        const userData = {
          _id: user._id,
          name: user.name,
          email: user.email
        };

        const res = NextResponse.json({
          user: userData,
          token
        }, { status: 201 });
        
        // Set secure cookie
        res.cookies.set('authToken', token, {
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
        
        console.log(`✅ Successfully created account for ${normalizedEmail}`);
        return res;

      } catch (userCreationError: any) {
        console.error('User creation error:', userCreationError);
        // Clean up on user creation failure
        await OTP.deleteOne({ _id: otpRecord._id });
        pendingUsersManager.delete(userKey);
        
        if (userCreationError.code === 11000) {
          return NextResponse.json({ 
            error: 'Email already registered',
            code: 'EMAIL_EXISTS'
          }, { status: 400 });
        }
        
        return NextResponse.json({ 
          error: 'Failed to create account. Please try again.',
          code: 'USER_CREATION_FAILED'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      error: 'Invalid step parameter',
      code: 'INVALID_STEP'
    }, { status: 400 });
    
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
