import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import OTP from '@/models/OTP';

const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 3;

interface RateLimitCheck {
  allowed: boolean;
  retryAfter?: Date;
  remainingAttempts?: number;
}

export async function checkRateLimit(email: string): Promise<RateLimitCheck> {
  try {
    // Get recent OTP requests for this email
    const recentOTPs = await OTP.find({
      email,
      createdAt: { $gte: new Date(Date.now() - RATE_LIMIT_WINDOW) }
    }).sort({ createdAt: -1 });

    if (recentOTPs.length === 0) {
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    const latestOTP = recentOTPs[0];
    
    // Check if too many attempts
    if (latestOTP.attempts >= MAX_ATTEMPTS) {
      // Calculate retry time (10 minutes from last attempt)
      const retryAfter = new Date(latestOTP.createdAt.getTime() + RATE_LIMIT_WINDOW);
      if (retryAfter > new Date()) {
        return {
          allowed: false,
          retryAfter,
          remainingAttempts: 0
        };
      }
      // If window has passed, allow new attempts
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    // If within window but under max attempts, allow with remaining count
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS - latestOTP.attempts
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow request but log it
    return { allowed: true, remainingAttempts: 1 };
  }
}

export async function incrementAttempts(email: string): Promise<void> {
  try {
    const latestOTP = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (latestOTP) {
      latestOTP.attempts += 1;
      await latestOTP.save();
    }
  } catch (error) {
    console.error('Error incrementing attempts:', error);
  }
}

export function getRateLimitResponse(retryAfter: Date) {
  return NextResponse.json(
    {
      error: 'Too many attempts. Please try again later.',
      retryAfter: retryAfter.toISOString()
    },
    {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((retryAfter.getTime() - Date.now()) / 1000).toString()
      }
    }
  );
}
