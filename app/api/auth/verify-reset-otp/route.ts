import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import OTP from '@/models/OTP';
import { validateOTPFormat } from '@/utils/generateOtp';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
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
    return NextResponse.json({ message: 'OTP verified. You may now reset your password.' });
  } catch (error: any) {
    console.error('Verify reset OTP error:', error);
    return NextResponse.json({ error: 'Server error. Please try again later.' }, { status: 500 });
  }
}
