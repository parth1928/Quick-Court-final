import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
// OTP related imports removed for direct login

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
  const { email, password } = await req.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

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

    // Check if user is banned or suspended (check both status and legacy isBanned fields)
    if (user.status === 'banned' || user.status === 'inactive' || user.isBanned === true) {
      const banInfo = user.bannedAt ? ` on ${new Date(user.bannedAt).toLocaleDateString()}` : '';
      const reason = user.banReason ? ` Reason: ${user.banReason}` : '';
      
      return NextResponse.json(
        { 
          error: 'Account Banned',
          message: `Your account has been banned${banInfo}.${reason} To appeal this decision or request account restoration, please contact our support team at support@quickcourt.com with your account details.`,
          type: 'banned',
          contactEmail: 'support@quickcourt.com'
        },
        { status: 403 }
      );
    }

    if (user.status === 'suspended') {
      const suspensionInfo = user.suspendedAt ? ` on ${new Date(user.suspendedAt).toLocaleDateString()}` : '';
      const reason = user.suspensionReason ? ` Reason: ${user.suspensionReason}` : '';
      
      return NextResponse.json(
        { 
          error: 'Account Suspended',
          message: `Your account has been temporarily suspended${suspensionInfo}.${reason} Please contact support at support@quickcourt.com for more information.`,
          type: 'suspended',
          contactEmail: 'support@quickcourt.com'
        },
        { status: 403 }
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, status: user.status },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    };

    const res = NextResponse.json({ user: userData, token });
    res.cookies.set('authToken', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
    
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
