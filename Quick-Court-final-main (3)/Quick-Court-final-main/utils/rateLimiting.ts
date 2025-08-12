import OTP from '@/models/OTP';

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 5, // Increased from 3 to 5 for better UX
  TIME_WINDOW_MINUTES: 15, // Increased from 10 to 15 minutes
  RESEND_COOLDOWN_SECONDS: 90, // Increased cooldown to prevent spam
  MAX_VERIFICATION_ATTEMPTS: 3, // Max attempts to verify a single OTP
};

/**
 * Enhanced rate limiting with IP tracking and error handling
 * @param email - User's email address
 * @param ipAddress - Optional IP address for additional tracking
 * @returns Promise resolving to rate limit status
 */
export const checkOTPRateLimit = async (email: string, ipAddress?: string): Promise<{
  allowed: boolean;
  remainingAttempts: number;
  nextAttemptIn?: number; // seconds until next attempt allowed
  message: string;
}> => {
  try {
    const normalizedEmail = email.toLowerCase();
    const timeWindow = new Date();
    timeWindow.setMinutes(timeWindow.getMinutes() - RATE_LIMIT_CONFIG.TIME_WINDOW_MINUTES);

    // Build query for both email and IP-based rate limiting
    const emailQuery = {
      email: normalizedEmail,
      createdAt: { $gte: timeWindow },
    };

    // Count recent OTP generation attempts for this email
    let emailAttempts = 0;
    let ipAttempts = 0;

    try {
      emailAttempts = await OTP.countDocuments(emailQuery);
    } catch (dbError) {
      console.warn('Database query error for email attempts:', dbError);
      // Fallback: allow if database is having issues but log the error
      return {
        allowed: true,
        remainingAttempts: RATE_LIMIT_CONFIG.MAX_ATTEMPTS,
        message: 'Rate limit check bypassed due to database error',
      };
    }

    // Also check IP-based rate limiting if IP is provided
    if (ipAddress && ipAddress !== 'unknown') {
      try {
        const ipQuery = {
          ipAddress,
          createdAt: { $gte: timeWindow },
        };
        ipAttempts = await OTP.countDocuments(ipQuery);
      } catch (dbError) {
        console.warn('Database query error for IP attempts:', dbError);
        // Continue with email-based rate limiting only
      }
    }

    const totalAttempts = Math.max(emailAttempts, ipAttempts);

    // Check if user has exceeded rate limit
    if (totalAttempts >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
      try {
        // Find the oldest attempt to calculate when next attempt is allowed
        const oldestAttempt = await OTP.findOne({
          $or: [
            { email: normalizedEmail, createdAt: { $gte: timeWindow } },
            ...(ipAddress && ipAddress !== 'unknown' ? [{ ipAddress, createdAt: { $gte: timeWindow } }] : [])
          ],
        }).sort({ createdAt: 1 });

        if (oldestAttempt) {
          const nextAttemptTime = new Date(oldestAttempt.createdAt);
          nextAttemptTime.setMinutes(nextAttemptTime.getMinutes() + RATE_LIMIT_CONFIG.TIME_WINDOW_MINUTES);
          const nextAttemptIn = Math.ceil((nextAttemptTime.getTime() - Date.now()) / 1000);

          return {
            allowed: false,
            remainingAttempts: 0,
            nextAttemptIn: Math.max(0, nextAttemptIn),
            message: `Too many OTP requests. Please try again in ${Math.ceil(nextAttemptIn / 60)} minutes.`,
          };
        }
      } catch (dbError) {
        console.warn('Database query error for oldest attempt:', dbError);
        // Return a generic rate limit message
        return {
          allowed: false,
          remainingAttempts: 0,
          nextAttemptIn: RATE_LIMIT_CONFIG.TIME_WINDOW_MINUTES * 60,
          message: `Too many OTP requests. Please try again in ${RATE_LIMIT_CONFIG.TIME_WINDOW_MINUTES} minutes.`,
        };
      }
    }

    // Check for recent resend attempts (cooldown period)
    try {
      const lastAttempt = await OTP.findOne({
        email: normalizedEmail,
      }).sort({ createdAt: -1 });

      if (lastAttempt) {
        const timeSinceLastAttempt = (Date.now() - lastAttempt.createdAt.getTime()) / 1000;
        if (timeSinceLastAttempt < RATE_LIMIT_CONFIG.RESEND_COOLDOWN_SECONDS) {
          const cooldownRemaining = RATE_LIMIT_CONFIG.RESEND_COOLDOWN_SECONDS - timeSinceLastAttempt;
          return {
            allowed: false,
            remainingAttempts: RATE_LIMIT_CONFIG.MAX_ATTEMPTS - totalAttempts,
            nextAttemptIn: Math.ceil(cooldownRemaining),
            message: `Please wait ${Math.ceil(cooldownRemaining)} seconds before requesting another OTP.`,
          };
        }
      }
    } catch (dbError) {
      console.warn('Database query error for last attempt:', dbError);
      // Continue without cooldown check
    }

    return {
      allowed: true,
      remainingAttempts: RATE_LIMIT_CONFIG.MAX_ATTEMPTS - totalAttempts,
      message: 'OTP generation allowed',
    };
    
  } catch (error) {
    console.error('Critical error in rate limit check:', error);
    
    // In case of critical errors, be conservative but don't completely block users
    // Allow the request but with a warning
    return {
      allowed: true,
      remainingAttempts: 1,
      message: 'Rate limit verification temporarily unavailable',
    };
  }
};

/**
 * Increments failed verification attempts for an email
 * @param email - User's email address
 * @returns Promise resolving to updated attempt count
 */
export const incrementFailedAttempts = async (email: string): Promise<number> => {
  try {
    const normalizedEmail = email.toLowerCase();
    
    // Find the most recent active OTP for this email
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      expiry: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (otpRecord) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return otpRecord.attempts;
    }

    return 0;
  } catch (error) {
    console.error('Error incrementing failed attempts:', error);
    return 0;
  }
};

/**
 * Cleans up expired OTPs and rate limiting records
 * @returns Promise resolving to number of deleted records
 */
export const cleanupExpiredOTPs = async (): Promise<number> => {
  try {
    const result = await OTP.deleteMany({
      expiry: { $lt: new Date() },
    });

    console.log(`Cleaned up ${result.deletedCount} expired OTP records`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
    return 0;
  }
};

/**
 * Gets rate limit status for display purposes
 * @param email - User's email address
 * @returns Promise resolving to rate limit information
 */
export const getRateLimitStatus = async (email: string): Promise<{
  attemptsUsed: number;
  maxAttempts: number;
  timeWindowMinutes: number;
  nextResetTime?: Date;
}> => {
  try {
    const normalizedEmail = email.toLowerCase();
    const timeWindow = new Date();
    timeWindow.setMinutes(timeWindow.getMinutes() - RATE_LIMIT_CONFIG.TIME_WINDOW_MINUTES);

    const recentAttempts = await OTP.countDocuments({
      email: normalizedEmail,
      createdAt: { $gte: timeWindow },
    });

    // Find when the rate limit window resets
    const oldestAttempt = await OTP.findOne({
      email: normalizedEmail,
      createdAt: { $gte: timeWindow },
    }).sort({ createdAt: 1 });

    let nextResetTime: Date | undefined;
    if (oldestAttempt) {
      nextResetTime = new Date(oldestAttempt.createdAt);
      nextResetTime.setMinutes(nextResetTime.getMinutes() + RATE_LIMIT_CONFIG.TIME_WINDOW_MINUTES);
    }

    return {
      attemptsUsed: recentAttempts,
      maxAttempts: RATE_LIMIT_CONFIG.MAX_ATTEMPTS,
      timeWindowMinutes: RATE_LIMIT_CONFIG.TIME_WINDOW_MINUTES,
      nextResetTime,
    };
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return {
      attemptsUsed: 0,
      maxAttempts: RATE_LIMIT_CONFIG.MAX_ATTEMPTS,
      timeWindowMinutes: RATE_LIMIT_CONFIG.TIME_WINDOW_MINUTES,
    };
  }
};
