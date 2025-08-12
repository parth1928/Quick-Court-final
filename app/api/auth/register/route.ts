import { NextResponse } from 'next/server';
// Ensure this route runs in the Node.js runtime (not Edge) so nodemailer works
export const runtime = 'nodejs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import OTP from '@/models/OTP';
import PendingRegistration from '@/models/PendingRegistration';
import { generateOTP, hashOTP, createOTPExpiry, validateOTPFormat } from '@/utils/generateOtp';
import { sendOTPEmail } from '@/utils/sendEmail';
import { checkOTPRateLimit } from '@/utils/rateLimiting';

// Assert JWT_SECRET is defined and cast it as string
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Enhanced pending users storage with TTL and better persistence
class PendingUsersManager {
  private static instance: PendingUsersManager;
  private pendingUsers = new Map<string, any>();
  private cleanupInterval: NodeJS.Timeout;

  private constructor() {
    // Cleanup expired entries every 2 minutes (more frequent)
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 2 * 60 * 1000);
  }

  static getInstance(): PendingUsersManager {
    if (!PendingUsersManager.instance) {
      PendingUsersManager.instance = new PendingUsersManager();
    }
    return PendingUsersManager.instance;
  }

  set(key: string, data: any, ttlMinutes: number = 45): void {
    // Increased TTL to 45 minutes for better user experience
    const expiresAt = Date.now() + (ttlMinutes * 60 * 1000);
    const sessionData = {
      ...data,
      expiresAt,
      createdAt: Date.now()
    };
    
    this.pendingUsers.set(key, sessionData);
    console.log(`✅ Stored pending user session for ${data.email} - expires in ${ttlMinutes} minutes`);
    console.log(`📊 Current sessions count: ${this.pendingUsers.size}`);
  }

  get(key: string): any | null {
    const data = this.pendingUsers.get(key);
    if (!data) {
      console.log(`❌ No session found for key: ${key}`);
      console.log(`📊 Available sessions: ${Array.from(this.pendingUsers.keys())}`);
      return null;
    }
    
    const now = Date.now();
    const isExpired = now > data.expiresAt;
    const timeRemaining = Math.floor((data.expiresAt - now) / 1000 / 60);
    
    if (isExpired) {
      console.log(`⏰ Session expired for ${key} - was created ${Math.floor((now - data.createdAt) / 1000 / 60)} minutes ago`);
      this.pendingUsers.delete(key);
      return null;
    }
    
    console.log(`✅ Found valid session for ${key} - ${timeRemaining} minutes remaining`);
    return data;
  }

  delete(key: string): void {
    const existed = this.pendingUsers.delete(key);
    console.log(`🗑️ Deleted session for ${key}: ${existed ? 'success' : 'not found'}`);
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    for (const [key, data] of this.pendingUsers.entries()) {
      if (now > data.expiresAt) {
        this.pendingUsers.delete(key);
        cleanedCount++;
      }
    }
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  // Debug method to list all sessions
  listSessions(): void {
    console.log(`📋 Active sessions (${this.pendingUsers.size}):`);
    for (const [key, data] of this.pendingUsers.entries()) {
      const timeRemaining = Math.floor((data.expiresAt - Date.now()) / 1000 / 60);
      console.log(`  - ${key}: ${timeRemaining}min remaining`);
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

      // Store pending user data in both memory and database for redundancy
      const userKey = `pending_${normalizedEmail}`;
      const pendingData = {
        name: name.trim(),
        email: normalizedEmail,
        password,
        phone,
        role,
        clientIP,
        userAgent
      };

      // Store in memory
      pendingUsersManager.set(userKey, pendingData, 45); // 45 minutes TTL

      // Store in database as backup
      try {
        await PendingRegistration.findOneAndUpdate(
          { email: normalizedEmail },
          {
            ...pendingData,
            expiresAt: new Date(Date.now() + 45 * 60 * 1000) // 45 minutes
          },
          { upsert: true, new: true }
        );
        console.log(`💾 Stored pending registration in database for ${normalizedEmail}`);
      } catch (dbError) {
        console.error('❌ Failed to store pending registration in database:', dbError);
        // Continue with memory storage only
      }

      // Debug: List all sessions
      pendingUsersManager.listSessions();

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

        // Expose full error for debugging (remove in production)
        let errorMessage = 'Failed to send verification email. Please try again.';
        let errorCode = 'EMAIL_FAILED';
        let errorDetail = emailResult.error || null;

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
          code: errorCode,
          detail: errorDetail
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

      console.log(`🔍 Looking for session: ${userKey}`);
      
      // Debug: List all sessions before checking
      pendingUsersManager.listSessions();

      // Check if pending user data exists in memory first
      let pendingUserData = pendingUsersManager.get(userKey);
      
      // If not found in memory, try database fallback
      if (!pendingUserData) {
        console.log(`⚠️ Session not found in memory, checking database...`);
        try {
          const dbPendingUser = await PendingRegistration.findOne({ 
            email: normalizedEmail,
            expiresAt: { $gt: new Date() } // Still valid
          });
          
          if (dbPendingUser) {
            console.log(`✅ Found session in database for ${normalizedEmail}`);
            pendingUserData = {
              name: dbPendingUser.name,
              email: dbPendingUser.email,
              password: dbPendingUser.password,
              phone: dbPendingUser.phone,
              role: dbPendingUser.role,
              clientIP: dbPendingUser.clientIP,
              userAgent: dbPendingUser.userAgent,
              createdAt: dbPendingUser.createdAt.getTime(),
              expiresAt: dbPendingUser.expiresAt.getTime()
            };
            
            // Restore to memory for faster access
            const remainingMinutes = Math.floor((dbPendingUser.expiresAt.getTime() - Date.now()) / 60000);
            pendingUsersManager.set(userKey, pendingUserData, Math.max(remainingMinutes, 5));
            
            console.log(`🔄 Restored session to memory with ${remainingMinutes} minutes remaining`);
          }
        } catch (dbError) {
          console.error('❌ Error checking database for pending registration:', dbError);
        }
      }

      if (!pendingUserData) {
        console.log(`❌ Registration session expired for ${normalizedEmail}. No pending user data found in memory or database.`);
        console.log(`🔍 Searched for key: ${userKey}`);
        
        // Try to find if there's a session with similar email (case sensitivity issue)
        const allKeys = Array.from((pendingUsersManager as any).pendingUsers.keys()) as string[];
        const similarKeys = allKeys.filter((key: string) => key.includes(normalizedEmail.split('@')[0]));
        console.log(`🔍 Similar keys found: ${similarKeys}`);
        
        return NextResponse.json({ 
          error: 'Registration session expired. Please sign up again.',
          code: 'SESSION_EXPIRED',
          action: 'restart_registration',
          debug: {
            searchedKey: userKey,
            availableKeys: allKeys,
            similarKeys,
            checkedDatabase: true
          }
        }, { status: 410 });
      }

      console.log(`✅ Found pending user data for ${normalizedEmail}`);
      console.log(`📋 Session data:`, {
        email: pendingUserData.email,
        name: pendingUserData.name,
        role: pendingUserData.role,
        createdAt: pendingUserData.createdAt ? new Date(pendingUserData.createdAt).toISOString() : 'unknown'
      });

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
        // Clean up database too
        try {
          await PendingRegistration.deleteOne({ email: normalizedEmail });
        } catch (e) { console.error('DB cleanup error:', e); }
        
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
          // Clean up database too
          try {
            await PendingRegistration.deleteOne({ email: normalizedEmail });
          } catch (e) { console.error('DB cleanup error:', e); }
          
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

        // Clean up both memory and database
        await OTP.deleteOne({ _id: otpRecord._id });
        pendingUsersManager.delete(userKey);
        
        // Clean up database pending registration
        try {
          await PendingRegistration.deleteOne({ email: normalizedEmail });
          console.log(`🗑️ Cleaned up database pending registration for ${normalizedEmail}`);
        } catch (dbError) {
          console.error('❌ Error cleaning up database pending registration:', dbError);
        }

        // Generate JWT token with proper structure matching login route
        const tokenPayload = {
          userId: user._id.toString(),
          email: user.email,
          role: user.role
        };
        
        console.log('🔑 Generating JWT token with payload:', { ...tokenPayload, userId: '[REDACTED]' });
        
        const token = jwt.sign(
          tokenPayload,
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
        // Clean up on user creation failure - both memory and database
        await OTP.deleteOne({ _id: otpRecord._id });
        pendingUsersManager.delete(userKey);
        
        try {
          await PendingRegistration.deleteOne({ email: normalizedEmail });
        } catch (e) { console.error('DB cleanup error:', e); }
        
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
