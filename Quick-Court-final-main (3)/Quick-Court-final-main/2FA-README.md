# QuickCourt 2FA Authentication System

A comprehensive Two-Factor Authentication (2FA) system for QuickCourt sports booking platform with secure OTP delivery via email.

## 🚀 Features

- **Secure 6-digit OTP generation** using cryptographically strong random numbers
- **Bcrypt hashing** for OTP storage (never stored in plain text)
- **Rate limiting** - Max 3 OTP requests per 10 minutes
- **Resend cooldown** - 60-second minimum between resend requests
- **Professional email templates** with QuickCourt branding
- **Automatic cleanup** of expired OTPs using MongoDB TTL
- **Comprehensive error handling** with detailed user feedback
- **TypeScript** throughout for type safety

## 📁 File Structure

```
├── models/
│   └── OTP.ts                 # OTP database model with TTL indexes
├── utils/
│   ├── generateOtp.ts         # OTP generation and hashing utilities
│   ├── sendEmail.ts           # Email delivery with professional templates
│   └── rateLimiting.ts        # Rate limiting and security controls
├── app/api/auth/
│   ├── login/route.ts         # Enhanced login with 2FA step
│   ├── verify-otp/route.ts    # OTP verification endpoint
│   ├── resend-otp/route.ts    # OTP resend with rate limiting
│   └── register/route.ts      # Optional 2FA for registration
├── components/ui/
│   └── otp-verification.tsx   # React component for OTP input
├── lib/types/
│   └── auth.ts                # TypeScript interfaces
└── .env.example               # Environment configuration template
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install nodemailer @types/nodemailer
# bcryptjs and jsonwebtoken should already be installed
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/quickcourt

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

### 3. Gmail Setup (Recommended for Development)

1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password":
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASS`

### 4. Database Models

The OTP model is automatically created with:
- **TTL indexes** for automatic cleanup
- **Compound indexes** for efficient queries
- **Validation** ensuring 6-digit OTPs

## 🔄 API Endpoints

### Login with 2FA

```typescript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "userpassword",
  "step": "verify_password"
}

// Response:
{
  "message": "Password verified. OTP sent to your email.",
  "step": "verify_otp",
  "rateLimitInfo": {
    "remainingAttempts": 2
  }
}
```

### Verify OTP

```typescript
POST /api/auth/verify-otp
{
  "email": "user@example.com",
  "otp": "123456"
}

// Success Response:
{
  "message": "Login successful",
  "user": { /* user data */ },
  "token": "jwt-token"
}

// Error Response:
{
  "error": "Invalid OTP. Please try again.",
  "remainingAttempts": 2
}
```

### Resend OTP

```typescript
POST /api/auth/resend-otp
{
  "email": "user@example.com"
}

// Response:
{
  "message": "New OTP sent to your email.",
  "rateLimitInfo": {
    "remainingAttempts": 1
  }
}
```

### Registration with Optional 2FA

```typescript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "user",
  "enable2FA": true  // Optional
}
```

## 🛡️ Security Features

### Rate Limiting
- **3 OTP requests** maximum per 10-minute window
- **60-second cooldown** between resend requests
- **3 verification attempts** per OTP before expiry

### OTP Security
- **Cryptographically secure** random generation
- **Bcrypt hashing** with salt rounds of 12
- **5-minute expiry** with automatic cleanup
- **6-digit format** validation

### Email Security
- **Professional templates** to prevent phishing concerns
- **Clear expiry information** in emails
- **Security notices** about not sharing codes

## 📱 Frontend Integration

### Basic Usage

```typescript
import OTPVerification from '@/components/ui/otp-verification';

const [showOTP, setShowOTP] = useState(false);
const [userEmail, setUserEmail] = useState('');

// After successful password verification
if (loginResponse.step === 'verify_otp') {
  setShowOTP(true);
  setUserEmail(email);
}

// Render OTP component
{showOTP && (
  <OTPVerification
    email={userEmail}
    onSuccess={(userData, token) => {
      // Handle successful login
      localStorage.setItem('token', token);
      router.push('/dashboard');
    }}
    onBack={() => setShowOTP(false)}
  />
)}
```

### Enhanced Login Flow

```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, step: 'verify_password' })
    });

    const data = await response.json();
    
    if (data.step === 'verify_otp') {
      setCurrentStep('otp');
      setUserEmail(email);
    }
  } catch (error) {
    setError('Network error');
  }
};
```

## 🔍 Monitoring & Debugging

### Rate Limit Status Check

```typescript
import { getRateLimitStatus } from '@/utils/rateLimiting';

const status = await getRateLimitStatus(email);
console.log('Rate limit status:', status);
```

### Email Configuration Test

```typescript
import { verifyEmailConfig } from '@/utils/sendEmail';

const isConfigured = await verifyEmailConfig();
console.log('Email configured:', isConfigured);
```

### Cleanup Expired OTPs

```typescript
import { cleanupExpiredOTPs } from '@/utils/rateLimiting';

const deletedCount = await cleanupExpiredOTPs();
console.log(`Cleaned up ${deletedCount} expired OTPs`);
```

## 🚀 Production Deployment

### Email Provider Recommendations

1. **SendGrid** - Reliable with good delivery rates
2. **Mailgun** - Great for transactional emails
3. **AWS SES** - Cost-effective for high volume
4. **Postmark** - Excellent delivery speed

### Environment Variables for Production

```env
NODE_ENV=production
SMTP_SECURE=true
SMTP_PORT=465

# Use proper SMTP provider credentials
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Database Indexes

The system automatically creates necessary indexes, but verify in production:

```javascript
// MongoDB indexes created automatically
{
  "email": 1,
  "expiry": 1
}
{
  "expiry": 1,
  "expireAfterSeconds": 0  // TTL index
}
{
  "createdAt": 1,
  "expires": 600  // 10 minutes for rate limiting
}
```

## 🔧 Customization Options

### OTP Length
Change in `utils/generateOtp.ts`:
```typescript
const otp = crypto.randomInt(100000, 1000000); // 6 digits
// For 4 digits: crypto.randomInt(1000, 10000)
```

### Expiry Time
Modify in `utils/generateOtp.ts`:
```typescript
export const createOTPExpiry = (): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10); // 10 minutes instead of 5
  return expiry;
};
```

### Rate Limiting
Adjust in `utils/rateLimiting.ts`:
```typescript
const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 5,           // Allow 5 attempts
  TIME_WINDOW_MINUTES: 15,   // In 15 minutes
  RESEND_COOLDOWN_SECONDS: 30, // 30-second cooldown
};
```

### Email Template
Customize the HTML template in `utils/sendEmail.ts` in the `generateOTPEmailTemplate` function.

## 🐛 Troubleshooting

### Common Issues

1. **Email not sending**
   - Check SMTP credentials
   - Verify firewall/port access
   - Test with `verifyEmailConfig()`

2. **OTP verification failing**
   - Check system time synchronization
   - Verify OTP expiry settings
   - Check database connectivity

3. **Rate limiting too aggressive**
   - Adjust `RATE_LIMIT_CONFIG` values
   - Check for duplicate requests
   - Verify cleanup is running

### Debug Logging

Enable detailed logging by setting environment variable:
```env
DEBUG=quickcourt:auth
```

## 📝 Usage Examples

### Basic 2FA Flow
1. User enters email/password
2. System validates credentials
3. OTP generated and emailed
4. User enters OTP
5. System verifies and issues JWT

### Error Handling
```typescript
try {
  const result = await verifyOTP(email, otp);
  if (result.success) {
    // Proceed with login
  }
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    // Show rate limit message
  } else if (error.code === 'EXPIRED') {
    // Show expired message
  }
}
```

This 2FA system provides enterprise-grade security while maintaining excellent user experience. The modular design allows for easy customization and extension for future requirements like SMS delivery or backup codes.
