import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { sendOTPEmail, verifyEmailConfig } from '@/utils/sendEmail';
import { generateOTP } from '@/utils/generateOtp';
import { printEnvConfig } from '@/lib/env-validation';

export async function GET() {
  try {
    console.log('🔍 Starting detailed email diagnostic...');
    
    // Check environment variables with more detail
    const envVars = {
      SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
      SMTP_PORT: process.env.SMTP_PORT || 'NOT SET',
      SMTP_USER: process.env.SMTP_USER || 'NOT SET',
      SMTP_PASS: process.env.SMTP_PASS ? '****' + process.env.SMTP_PASS.slice(-4) : 'NOT SET',
      SMTP_SECURE: process.env.SMTP_SECURE || 'NOT SET',
      SMTP_FROM: process.env.SMTP_FROM || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    };

    console.log('📋 Environment variables:', envVars);

    // Check if nodemailer is available
    let nodemailerAvailable = false;
    let nodemailerError = null;
    try {
      const nodemailer = require('nodemailer');
      nodemailerAvailable = true;
      console.log('✅ Nodemailer module is available');
    } catch (error: any) {
      nodemailerError = error.message;
      console.log('❌ Nodemailer module not available:', error.message);
    }

    // Determine configuration status
    const missingVars = Object.entries(envVars)
      .filter(([key, value]) => value === 'NOT SET' && key !== 'SMTP_FROM')
      .map(([key]) => key);

    const configurationStatus = {
      hasRequiredVars: missingVars.length === 0,
      missingVars,
      nodemailerAvailable,
      nodemailerError,
    };

    // If basic config exists, try to verify email connection
    let connectionTest = null;
    if (configurationStatus.hasRequiredVars && nodemailerAvailable) {
      try {
        console.log('🔧 Testing email connection...');
        const connectionValid = await verifyEmailConfig();
        connectionTest = {
          success: connectionValid,
          message: connectionValid ? 'Connection successful' : 'Connection failed'
        };
      } catch (error: any) {
        connectionTest = {
          success: false,
          error: error.message
        };
      }
    }

    return NextResponse.json({
      status: 'Email Diagnostic Report',
      timestamp: new Date().toISOString(),
      environmentVariables: envVars,
      configuration: configurationStatus,
      connectionTest,
      recommendations: generateRecommendations(missingVars, nodemailerAvailable, connectionTest),
      nextSteps: [
        'Fix any missing environment variables',
        'Restart your development server',
        'Test email sending with POST request to this endpoint'
      ]
    });

  } catch (error: any) {
    console.error('❌ Email diagnostic failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Diagnostic failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

function generateRecommendations(missingVars: string[], nodemailerAvailable: boolean, connectionTest: any) {
  const recommendations = [];
  
  if (!nodemailerAvailable) {
    recommendations.push('Install nodemailer: npm install nodemailer @types/nodemailer');
  }
  
  if (missingVars.length > 0) {
    recommendations.push(`Set missing environment variables: ${missingVars.join(', ')}`);
    recommendations.push('Create .env.local file in project root');
    recommendations.push('Restart development server after adding environment variables');
  }
  
  if (missingVars.includes('SMTP_USER') || missingVars.includes('SMTP_PASS')) {
    recommendations.push('For Gmail: Enable 2FA and generate app password');
    recommendations.push('For Gmail: Use app password, not regular password');
  }
  
  if (connectionTest && !connectionTest.success) {
    recommendations.push('Check SMTP credentials are correct');
    recommendations.push('Verify SMTP host and port settings');
    recommendations.push('Check firewall/network connectivity');
  }
  
  return recommendations;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email address is required'
      }, { status: 400 });
    }

    console.log(`🧪 Testing email send to: ${email}`);
    
    // Generate test OTP
    const testOTP = generateOTP();
    console.log(`🔐 Generated test OTP: ${testOTP}`);

    // Send test email
    const result = await sendOTPEmail({
      email,
      otp: testOTP,
      userName: 'Test User',
      expiryMinutes: 5,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test OTP email sent successfully to ${email}`,
        messageId: result.messageId,
        testOTP, // Include OTP for testing purposes
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `Failed to send test email: ${result.error}`,
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Test email send failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
