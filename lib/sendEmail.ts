const nodemailer = require('nodemailer');

let transporter: any;

export async function initializeEmailTransporter() {
  try {
    // Validate required environment variables
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP_USER and SMTP_PASS environment variables are required');
    }

    // Log email configuration (safely)
    console.log('📧 Initializing email transporter with config:', {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || '587',
      secure: false,
      user: process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 3)}...` : undefined,
      pass: process.env.SMTP_PASS ? '(set)' : undefined
    });

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });

    // Verify connection configuration
    await transporter.verify();
    console.log('✅ SMTP Connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP Connection error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.message.includes('535-5.7.8')) {
      console.error('❌ Authentication failed. Please check your SMTP username and password.');
    }
    return false;
  }
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  try {
    // Initialize transporter if not already initialized
    if (!transporter) {
      const success = await initializeEmailTransporter();
      if (!success) {
        throw new Error('Failed to initialize email transporter');
      }
    }

    const { to, subject, text, html } = options;

    const mailOptions = {
      from: `"QuickCourt" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function sendOTPEmail(email: string, otp: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; text-align: center;">QuickCourt Verification Code</h2>
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; text-align: center;">
        <p style="font-size: 16px; color: #666;">Your verification code is:</p>
        <h1 style="font-size: 32px; color: #000; letter-spacing: 5px; margin: 20px 0;">${otp}</h1>
        <p style="font-size: 14px; color: #999;">This code will expire in 5 minutes</p>
      </div>
      <p style="color: #666; font-size: 14px; text-align: center; margin-top: 20px;">
        If you didn't request this code, please ignore this email.
      </p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'QuickCourt Verification Code',
    html
  });
}

// Initialize transporter on server start
initializeEmailTransporter().catch(console.error);
