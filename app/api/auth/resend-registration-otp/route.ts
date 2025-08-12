import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import OTP from '@/models/OTP';
import { generateOTP, hashOTP, createOTPExpiry, validateOTPFormat } from '@/utils/generateOtp';
import { sendOTPEmail } from '@/utils/sendEmail';
import { checkOTPRateLimit } from '@/utils/rateLimiting';

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
    
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Enhanced rate limiting with IP tracking
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

    // Delete any existing OTPs for this email and purpose
    await OTP.deleteMany({ 
      email: normalizedEmail, 
      purpose: 'registration' 
    });

    // Generate new OTP
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    const expiry = createOTPExpiry();

    // For development only
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔁 Resent OTP for ${normalizedEmail}: ${otp}`);
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
    const emailSent = await sendOTPEmail({
      email: normalizedEmail,
      otp,
      userName: 'User',
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
      message: 'New verification code sent to your email.',
      rateLimitInfo: {
        remainingAttempts: rateLimitStatus.remainingAttempts - 1,
      }
    });
    
  } catch (error: any) {
    console.error('Resend registration OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
