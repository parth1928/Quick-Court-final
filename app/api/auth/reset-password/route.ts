import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { validateOTPFormat } from '@/utils/generateOtp';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, otp, newPassword } = await req.json();
    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase();
    if (!validateOTPFormat(otp)) {
      return NextResponse.json({ error: 'OTP must be exactly 6 digits' }, { status: 400 });
    }
    const otpRecord = await OTP.findOne({ email: normalizedEmail, purpose: 'password_reset' }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 404 });
    }
    if (new Date() > otpRecord.expiry) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 410 });
    }
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json({ error: 'Maximum attempts exceeded. Please try again.' }, { status: 429 });
    }
    const { verifyOTP } = await import('@/utils/generateOtp');
    const isOTPValid = await verifyOTP(otp, otpRecord.otp);
    if (!isOTPValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 401 });
    }
    // Update password
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    
    console.log('🔐 Updating password for user:', user.email);
    
    // Set the new password - this will trigger the pre-save middleware to hash it
    user.password = newPassword; // Set plain text, let the model hash it
    await user.save();
    
    console.log('✅ Password updated successfully');
    
    // Clean up the OTP
    await OTP.deleteOne({ _id: otpRecord._id });
    console.log('🗑️ OTP deleted after successful password reset');
    
    return NextResponse.json({ message: 'Password reset successful. You may now sign in.' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Server error. Please try again later.' }, { status: 500 });
  }
}
