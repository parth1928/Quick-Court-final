import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { checkOTPRateLimit } from '@/utils/rateLimiting';
import { generateOTP, hashOTP, createOTPExpiry } from '@/utils/generateOtp';

export async function GET() {
  try {
    await dbConnect();
    
    // Test rate limiting
    const testEmail = 'test@example.com';
    const rateLimitResult = await checkOTPRateLimit(testEmail, '127.0.0.1');
    
    // Test OTP generation
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    const expiry = createOTPExpiry();
    
    return NextResponse.json({
      message: 'OTP system test successful',
      rateLimitResult,
      otp: {
        generated: otp,
        hashed: hashedOtp.substring(0, 20) + '...', // Show partial hash for security
        expiry,
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('OTP test error:', error);
    return NextResponse.json({
      error: 'OTP system test failed',
      details: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
