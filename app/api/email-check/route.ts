import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Simple environment check
    const envStatus = {
      SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
      SMTP_PORT: process.env.SMTP_PORT || 'NOT SET', 
      SMTP_USER: process.env.SMTP_USER || 'NOT SET',
      SMTP_PASS: process.env.SMTP_PASS ? 'SET (****' + process.env.SMTP_PASS.slice(-4) + ')' : 'NOT SET',
      SMTP_FROM: process.env.SMTP_FROM || 'NOT SET',
    };

    const hasAllVars = Object.values(envStatus).every(val => !val.includes('NOT SET'));

    return NextResponse.json({
      status: 'Email Configuration Check',
      timestamp: new Date().toISOString(),
      environment: envStatus,
      configured: hasAllVars,
      message: hasAllVars ? 
        'All email environment variables are set. Try the signup flow now!' : 
        'Some email environment variables are missing.',
      nextStep: hasAllVars ? 
        'Test signup at: http://192.168.102.132:3000/signup' :
        'Fix missing environment variables and restart server'
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to check email configuration',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({
        error: 'Email address required'
      }, { status: 400 });
    }

    // Import email functions dynamically to avoid import issues
    const { sendOTPEmail } = await import('@/utils/sendEmail');
    const { generateOTP } = await import('@/utils/generateOtp');
    
    const testOTP = generateOTP();
    console.log(`🧪 Testing email to: ${email} with OTP: ${testOTP}`);

    const result = await sendOTPEmail({
      email,
      otp: testOTP,
      userName: 'Test User',
      expiryMinutes: 5,
    });

    return NextResponse.json({
      success: result.success,
      message: result.success ? 
        `Test email sent successfully to ${email}` : 
        `Failed to send email: ${result.error}`,
      testOTP: result.success ? testOTP : undefined,
      details: result
    });

  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
