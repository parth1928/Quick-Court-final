import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { verifyOTP, isOTPExpired } from '@/utils/generateOtp';
import { incrementFailedAttempts, cleanupExpiredOTPs } from '@/utils/rateLimiting';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const { email, otp } = await req.json();

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Validate OTP format (should be exactly 6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be exactly 6 digits' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Clean up expired OTPs first
    await cleanupExpiredOTPs();

    // Find the user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the most recent OTP for this email
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'No OTP found. Please request a new one.' },
        { status: 404 }
      );
    }

    // Check if OTP has expired
    if (isOTPExpired(otpRecord.expiry)) {
      // Delete expired OTP
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    // Check if maximum attempts exceeded
    if (otpRecord.attempts >= 3) {
      // Delete OTP after max attempts
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { 
          error: 'Maximum verification attempts exceeded. Please request a new OTP.',
          maxAttemptsExceeded: true,
        },
        { status: 429 }
      );
    }

    // Verify OTP
    const isOTPValid = await verifyOTP(otp, otpRecord.otp);
    
    if (!isOTPValid) {
      // Increment failed attempts
      const attempts = await incrementFailedAttempts(normalizedEmail);
      const remainingAttempts = Math.max(0, 3 - attempts);

      if (remainingAttempts === 0) {
        // Delete OTP after max attempts
        await OTP.deleteOne({ _id: otpRecord._id });
        return NextResponse.json(
          { 
            error: 'Invalid OTP. Maximum attempts exceeded. Please request a new OTP.',
            maxAttemptsExceeded: true,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Invalid OTP. Please try again.',
          remainingAttempts,
        },
        { status: 401 }
      );
    }

    // OTP is valid - delete it to prevent reuse
    await OTP.deleteOne({ _id: otpRecord._id });

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
      message: 'Login successful',
      user: userData,
      token,
    });

    res.cookies.set('authToken', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
    
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
