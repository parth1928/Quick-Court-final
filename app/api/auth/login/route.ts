import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { generateOTP, hashOTP, createOTPExpiry } from '@/utils/generateOtp';
import { sendOTPEmail } from '@/utils/sendEmail';
import { checkOTPRateLimit, cleanupExpiredOTPs } from '@/utils/rateLimiting';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const { email, password, step = 'verify_password' } = await req.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Step 1: Verify email and password
    if (step === 'verify_password') {
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required' },
          { status: 400 }
        );
      }

      // Find user
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Clean up expired OTPs first
      await cleanupExpiredOTPs();

      // Check rate limiting
      const rateLimitStatus = await checkOTPRateLimit(normalizedEmail);
      if (!rateLimitStatus.allowed) {
        return NextResponse.json(
          { 
            error: rateLimitStatus.message,
            rateLimitInfo: {
              remainingAttempts: rateLimitStatus.remainingAttempts,
              nextAttemptIn: rateLimitStatus.nextAttemptIn,
            }
          },
          { status: 429 }
        );
      }

      // Delete any existing OTPs for this email
      await OTP.deleteMany({ email: normalizedEmail });

      // Generate new OTP
      const otp = generateOTP();
      const hashedOtp = await hashOTP(otp);
      const expiry = createOTPExpiry();

      // Save OTP to database
      const otpRecord = new OTP({
        email: normalizedEmail,
        otp: hashedOtp,
        expiry,
        attempts: 0,
      });
      await otpRecord.save();

      // Send OTP email
      const emailSent = await sendOTPEmail({
        email: normalizedEmail,
        otp,
        userName: user.name,
        expiryMinutes: 5,
      });

      if (!emailSent) {
        // Clean up OTP record if email failed
        await OTP.deleteOne({ _id: otpRecord._id });
        return NextResponse.json(
          { error: 'Failed to send verification email. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Password verified. OTP sent to your email.',
        step: 'verify_otp',
        rateLimitInfo: {
          remainingAttempts: rateLimitStatus.remainingAttempts - 1,
        }
      });
    }

    // This shouldn't be reached in the new flow, but kept for compatibility
    // Legacy direct login without 2FA (remove if not needed)
    if (step === 'direct_login') {
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required' },
          { status: 400 }
        );
      }

      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id,
          role: user.role,
          email: user.email
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Create user data to return (excluding sensitive info)
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      };

      // Build response and set auth cookie
      const res = NextResponse.json({
        user: userData,
        token
      });
      res.cookies.set('authToken', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return res;
    }

    return NextResponse.json(
      { error: 'Invalid step parameter' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
