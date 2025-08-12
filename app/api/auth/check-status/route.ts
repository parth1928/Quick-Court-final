import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

// Define user schema for status check
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  status: String,
  isBanned: Boolean,
  phone: String,
  createdAt: Date,
  updatedAt: Date,
  lastActiveAt: Date,
  bannedAt: Date,
  suspendedAt: Date
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');

// GET - Check if current user is banned/suspended
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get user info from auth token
    const authToken = request.cookies.get('authToken')?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: 'No auth token' },
        { status: 401 }
      );
    }

    let user: any = null;
    try {
      user = JSON.parse(Buffer.from(authToken.split('.')[1], 'base64url').toString());
    } catch {
      return NextResponse.json(
        { error: 'Invalid auth token' },
        { status: 401 }
      );
    }

    // Check user status in database
    const dbUser = await User.findOne({
      $or: [
        { email: user.email },
        { _id: user.userId }
      ]
    }).select('status isBanned bannedAt suspendedAt');

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is banned or suspended
    const isBanned = dbUser.status === 'banned' || dbUser.isBanned === true;
    const isSuspended = dbUser.status === 'suspended';

    return NextResponse.json({
      success: true,
      isBanned,
      isSuspended,
      status: dbUser.status,
      shouldLogout: isBanned || isSuspended
    });

  } catch (error: any) {
    console.error('Error checking user status:', error);
    return NextResponse.json(
      { error: 'Failed to check user status' },
      { status: 500 }
    );
  }
}
