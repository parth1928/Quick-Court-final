import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { generateOTP, hashOTP, createOTPExpiry } from '@/utils/generateOtp';
import { sendOTPEmail } from '@/utils/sendEmail';

export async function POST(req: Request) {
  try {
    console.log('🔍 Forgot password API called');
    
    const body = await req.json();
    console.log('📦 Request body received:', body);
    
    const { email } = body;
    console.log('📧 Email:', email);
    
    if (!email) {
      console.log('❌ No email provided');
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    console.log('🔗 Connecting to database...');
    await dbConnect();
    console.log('✅ Database connected');
    
    const normalizedEmail = email.toLowerCase();
    console.log('🔄 Normalized email:', normalizedEmail);
    
    const user = await User.findOne({ email: normalizedEmail });
    console.log('👤 User found:', !!user);
    
    // Always respond success for privacy (even if user not found)
    if (!user) {
      console.log('⚠️ User not found, but responding with success for privacy');
      return NextResponse.json({ 
        message: 'If this email exists, an OTP has been sent.',
        success: true 
      });
    }
    
    // Generate OTP
    console.log('🎲 Generating OTP...');
    const otpCode = generateOTP();
    console.log('🔢 OTP generated:', otpCode);
    
    const otpHash = await hashOTP(otpCode);
    console.log('🔐 OTP hashed');
    
    const expiry = createOTPExpiry(10); // 10 min
    console.log('⏰ Expiry set:', expiry);
    
    // Remove previous reset OTPs
    console.log('🗑️ Cleaning up old OTPs...');
    const deleteResult = await OTP.deleteMany({ email: normalizedEmail, purpose: 'password_reset' });
    console.log('🗑️ Deleted old OTPs:', deleteResult.deletedCount);
    
    // Save new OTP
    console.log('💾 Saving new OTP...');
    const otpRecord = await OTP.create({ 
      email: normalizedEmail, 
      otp: otpHash, 
      expiry, 
      purpose: 'password_reset', 
      attempts: 0 
    });
    console.log('✅ OTP saved to database with ID:', otpRecord._id);
    
    // Send OTP email
    console.log('📤 Sending OTP email...');
    const emailResult = await sendOTPEmail({ 
      email: normalizedEmail, 
      otp: otpCode, 
      userName: user.name, 
      expiryMinutes: 10 
    });
    console.log('📧 Email result:', emailResult);
    
    if (!emailResult.success) {
      console.error('❌ Failed to send reset OTP email:', emailResult.error);
      return NextResponse.json({ 
        error: 'Failed to send email. Please try again later.',
        success: false 
      }, { status: 500 });
    }
    
    console.log('✅ OTP email sent successfully');
    return NextResponse.json({ 
      message: 'A verification code has been sent to your email address.',
      success: true 
    });
    
  } catch (error: any) {
    console.error('💥 Forgot password error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Server error: ' + error.message,
      success: false
    }, { status: 500 });
  }
}
