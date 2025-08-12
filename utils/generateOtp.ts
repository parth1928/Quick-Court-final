import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generates a secure 6-digit OTP
 * @returns A string containing exactly 6 digits
 */
export const generateOTP = (): string => {
  // Generate a random number between 100000 and 999999 (6 digits)
  const otp = crypto.randomInt(100000, 1000000).toString();
  
  // Ensure it's exactly 6 digits (should always be true, but safety check)
  if (otp.length !== 6) {
    throw new Error('Generated OTP is not 6 digits');
  }
  
  return otp;
};

/**
 * Hashes an OTP using bcrypt
 * @param otp - The plain text OTP to hash
 * @returns Promise resolving to the hashed OTP
 */
export const hashOTP = async (otp: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(otp, saltRounds);
};

/**
 * Verifies an OTP against its hash
 * @param plainOTP - The plain text OTP to verify
 * @param hashedOTP - The hashed OTP to compare against
 * @returns Promise resolving to boolean indicating if OTP matches
 */
export const verifyOTP = async (plainOTP: string, hashedOTP: string): Promise<boolean> => {
  return await bcrypt.compare(plainOTP, hashedOTP);
};

/**
 * Creates an expiry date for OTP
 * @param minutes - Number of minutes from now (default: 5)
 * @returns Date object in the future
 */
export const createOTPExpiry = (minutes: number = 5): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
};

/**
 * Checks if an OTP has expired
 * @param expiry - The expiry date to check
 * @returns Boolean indicating if the OTP has expired
 */
export const isOTPExpired = (expiry: Date): boolean => {
  return new Date() > expiry;
};

/**
 * Validates OTP format
 * @param otp - The OTP to validate
 * @returns Boolean indicating if OTP format is valid
 */
export const validateOTPFormat = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

/**
 * Secure OTP generation with enhanced entropy
 * @returns A cryptographically secure 6-digit OTP
 */
export const generateSecureOTP = (): string => {
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += crypto.randomInt(0, 10).toString();
  }
  return otp;
};
