import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { generateOTP, hashOTP, createOTPExpiry } from '@/utils/generateOtp';
import { sendOTPEmail } from '@/utils/sendEmail';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Temporary user data storage (in production, use Redis or database)
const pendingUsers = new Map();

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
      otp // Add otp to the destructured variables
    } = requestBody;

    const allowedRoles = ['user','owner'];

    // Step 1: Initial registration request
    if (step === 'register') {
      // Basic validation
      if (!name?.trim() || !email?.trim() || !password) {
        return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      if (!allowedRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }

      const normalizedEmail = email.toLowerCase();

      // Check if user already exists
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }

      // Store pending user data temporarily (NOT in database yet)
      const userKey = `pending_${normalizedEmail}`;
      pendingUsers.set(userKey, {
        name: name.trim(),
        email: normalizedEmail,
        password,
        phone,
        role,
        timestamp: Date.now()
      });

      // Clean up old pending users (older than 10 minutes)
      for (const [key, userData] of pendingUsers.entries()) {
        if (Date.now() - userData.timestamp > 10 * 60 * 1000) {
          pendingUsers.delete(key);
        }
      }

      // Delete any existing OTPs for this email
      await OTP.deleteMany({ email: normalizedEmail });

      // Generate OTP
      const otp = generateOTP();
      const hashedOtp = await hashOTP(otp);
      const expiry = createOTPExpiry();

      console.log(`Generated OTP for ${normalizedEmail}: ${otp}`); // For debugging - remove in production

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
        userName: name.trim(),
        expiryMinutes: 5,
      });

      if (!emailSent) {
        // Clean up if email failed
        await OTP.deleteOne({ _id: otpRecord._id });
        pendingUsers.delete(userKey);
        return NextResponse.json(
          { error: 'Failed to send verification email. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Verification code sent to your email. Please check your inbox.',
        step: 'verify_otp',
        email: normalizedEmail
      }, { status: 200 });
    }

    // Step 2: OTP verification and user creation
    if (step === 'verify_otp') {
      // OTP is already extracted from requestBody above
      if (!email || !otp) {
        return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
      }

      if (!/^\d{6}$/.test(otp)) {
        return NextResponse.json({ error: 'OTP must be exactly 6 digits' }, { status: 400 });
      }

      const normalizedEmail = email.toLowerCase();
      const userKey = `pending_${normalizedEmail}`;

      // Check if pending user data exists
      const pendingUserData = pendingUsers.get(userKey);
      if (!pendingUserData) {
        return NextResponse.json({ 
          error: 'Registration session expired. Please sign up again.' 
        }, { status: 410 });
      }

      // Verify OTP
      const otpRecord = await OTP.findOne({
        email: normalizedEmail,
      }).sort({ createdAt: -1 });

      if (!otpRecord) {
        return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 404 });
      }

      // Check if OTP has expired
      if (new Date() > otpRecord.expiry) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 410 });
      }

      // Check if maximum attempts exceeded
      if (otpRecord.attempts >= 3) {
        await OTP.deleteOne({ _id: otpRecord._id });
        pendingUsers.delete(userKey);
        return NextResponse.json({ 
          error: 'Maximum verification attempts exceeded. Please sign up again.',
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
          pendingUsers.delete(userKey);
          return NextResponse.json({ 
            error: 'Invalid OTP. Maximum attempts exceeded. Please sign up again.',
            maxAttemptsExceeded: true,
          }, { status: 429 });
        }

        return NextResponse.json({ 
          error: 'Invalid OTP. Please try again.',
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
        pendingUsers.delete(userKey);

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

        // Create user data to return
        const userData = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
        };

        const res = NextResponse.json({
          message: 'Account created successfully!',
          user: userData,
          token
        }, { status: 201 });
        
        res.cookies.set('authToken', token, {
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7,
        });
        
        return res;

      } catch (userCreationError: any) {
        console.error('User creation error:', userCreationError);
        // Clean up on user creation failure
        await OTP.deleteOne({ _id: otpRecord._id });
        pendingUsers.delete(userKey);
        
        if (userCreationError.code === 11000) {
          return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }
        
        return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
      }
    }

    return NextResponse.json(
      { error: 'Invalid step parameter' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
