import nodemailer from 'nodemailer';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

// OTP email data interface
interface OTPEmailData {
  email: string;
  otp: string;
  userName?: string;
  expiryMinutes?: number;
}

/**
 * Creates a nodemailer transporter with SMTP configuration
 */
const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  };

  if (!config.user || !config.pass) {
    throw new Error('SMTP credentials not configured in environment variables');
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
};

/**
 * Generates a professional HTML email template for OTP
 */
const generateOTPEmailTemplate = (data: OTPEmailData): string => {
  const { otp, userName = 'User', expiryMinutes = 5 } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>QuickCourt - Verification Code</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 10px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          display: inline-block;
          background: #1f2937;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 18px;
          text-decoration: none;
          margin-bottom: 20px;
        }
        .title {
          color: #1f2937;
          font-size: 24px;
          margin: 0 0 10px 0;
        }
        .subtitle {
          color: #6b7280;
          margin: 0 0 30px 0;
        }
        .otp-container {
          background: #f3f4f6;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          color: #059669;
          letter-spacing: 8px;
          margin: 10px 0;
          font-family: 'Courier New', monospace;
        }
        .otp-label {
          color: #6b7280;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }
        .expiry-info {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .expiry-text {
          color: #92400e;
          margin: 0;
          font-size: 14px;
        }
        .security-notice {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .security-text {
          color: #991b1b;
          margin: 0;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
        }
        .button {
          display: inline-block;
          background: #059669;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">QC</div>
          <h1 class="title">QuickCourt</h1>
          <p class="subtitle">Verification Code</p>
        </div>
        
        <div>
          <p>Hello ${userName},</p>
          <p>You've requested to sign in to your QuickCourt account. Please use the verification code below to complete your login:</p>
          
          <div class="otp-container">
            <div class="otp-label">Verification Code</div>
            <div class="otp-code">${otp}</div>
          </div>
          
          <div class="expiry-info">
            <p class="expiry-text">
              <strong>⏰ This code expires in ${expiryMinutes} minutes</strong><br>
              Please enter it promptly to complete your verification.
            </p>
          </div>
          
          <div class="security-notice">
            <p class="security-text">
              <strong>🔒 Security Notice:</strong><br>
              • Never share this code with anyone<br>
              • QuickCourt will never ask for this code via phone or email<br>
              • If you didn't request this code, please ignore this email
            </p>
          </div>
          
          <p>If you're having trouble with verification, please contact our support team.</p>
          
          <p>Best regards,<br>The QuickCourt Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent to ${data.email}</p>
          <p>© ${new Date().getFullYear()} QuickCourt. All rights reserved.</p>
          <p>Local Sports Booking Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Sends OTP email to user
 * @param data - Email data including recipient email, OTP, and user name
 * @returns Promise resolving to success boolean
 */
export const sendOTPEmail = async (data: OTPEmailData): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'QuickCourt',
        address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@quickcourt.com',
      },
      to: data.email,
      subject: `🔐 Your QuickCourt Verification Code: ${data.otp}`,
      html: generateOTPEmailTemplate(data),
      text: `
        QuickCourt - Verification Code
        
        Hello ${data.userName || 'User'},
        
        Your verification code is: ${data.otp}
        
        This code expires in ${data.expiryMinutes || 5} minutes.
        
        Please enter this code to complete your login.
        
        If you didn't request this code, please ignore this email.
        
        Best regards,
        The QuickCourt Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
};

/**
 * Verifies email configuration
 * @returns Promise resolving to boolean indicating if email is configured correctly
 */
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    return false;
  }
};
