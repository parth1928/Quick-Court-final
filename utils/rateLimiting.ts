import OTP from '@/models/OTP';

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 3,
  TIME_WINDOW_MINUTES: 10,
  RESEND_COOLDOWN_SECONDS: 60, // Minimum time between resend requests
};

/**
 * Checks if user has exceeded OTP generation rate limit
 * @param email - User's email address
 * @returns Promise resolving to rate limit status
 */
export const checkOTPRateLimit = async (email: string): Promise<{
  allowed: boolean;
  remainingAttempts: number;
  nextAttemptIn?: number; // seconds until next attempt allowed
  message: string;
}> => {
  try {
    const normalizedEmail = email.toLowerCase();
    const timeWindow = new Date();
    timeWindow.setMinutes(timeWindow.getMinutes() - RATE_LIMIT_CONFIG.TIME_WINDOW_MINUTES);

    // Count recent OTP generation attempts
    const recentAttempts = await OTP.countDocuments({
      email: normalizedEmail,
      createdAt: { $gte: timeWindow },
    });

    // Check if user has exceeded rate limit
    if (recentAttempts >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
      // Find the oldest attempt to calculate when next attempt is allowed
      const oldestAttempt = await OTP.findOne({
        email: normalizedEmail,
        createdAt: { $gte: timeWindow },
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
    }

    // Check for recent resend attempts (cooldown period)
    const lastAttempt = await OTP.findOne({
      email: normalizedEmail,
    }).sort({ createdAt: -1 });

    if (lastAttempt) {
      const timeSinceLastAttempt = (Date.now() - lastAttempt.createdAt.getTime()) / 1000;
      if (timeSinceLastAttempt < RATE_LIMIT_CONFIG.RESEND_COOLDOWN_SECONDS) {
        const cooldownRemaining = RATE_LIMIT_CONFIG.RESEND_COOLDOWN_SECONDS - timeSinceLastAttempt;
        return {
          allowed: false,
          remainingAttempts: RATE_LIMIT_CONFIG.MAX_ATTEMPTS - recentAttempts,
          nextAttemptIn: Math.ceil(cooldownRemaining),
          message: `Please wait ${Math.ceil(cooldownRemaining)} seconds before requesting another OTP.`,
        };
      }
    }

    return {
      allowed: true,
      remainingAttempts: RATE_LIMIT_CONFIG.MAX_ATTEMPTS - recentAttempts,
      message: 'OTP generation allowed',
    };
  } catch (error) {
    console.error('Error checking OTP rate limit:', error);
    return {
      allowed: false,
      remainingAttempts: 0,
      message: 'Unable to verify rate limit. Please try again later.',
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
