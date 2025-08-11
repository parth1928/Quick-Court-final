import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { generateOTP, hashOTP, createOTPExpiry } from '@/utils/generateOtp';
import { sendOTPEmail } from '@/utils/sendEmail';
import { checkOTPRateLimit, cleanupExpiredOTPs } from '@/utils/rateLimiting';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const { email } = await req.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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
      message: 'New OTP sent to your email.',
      rateLimitInfo: {
        remainingAttempts: rateLimitStatus.remainingAttempts - 1,
      }
    });
    
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
