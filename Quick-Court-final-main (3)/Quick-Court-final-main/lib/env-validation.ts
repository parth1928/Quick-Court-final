import { config } from 'dotenv';

// Load environment variables from .env.local
try {
  config({ path: '.env.local' });
} catch (error) {
  console.warn('Could not load .env.local file:', error);
}

// Function to validate environment variables with better error handling
export function validateEnvVars() {
  const requiredVars = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    const warningMessage = `Warning: Missing environment variables: ${missingVars.join(', ')}`;
    console.warn(warningMessage);
    
    // Don't throw error, just warn - this allows the app to run with partial config
    if (process.env.NODE_ENV === 'development') {
      console.warn('Running in development mode with incomplete environment configuration');
    }
    
    return {
      valid: false,
      missingVars,
      message: warningMessage
    };
  }

  return {
    valid: true,
    missingVars: [],
    message: 'All required environment variables are present'
  };
}
