/**
 * Test Email Configuration Script
 * Run this to verify your SMTP settings are working
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testEmailConfig() {
  console.log('🧪 Testing Email Configuration...\n');

  // Check if environment variables are set
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.log('\nPlease update your .env.local file with:');
    missing.forEach(varName => {
      console.log(`${varName}=your-value-here`);
    });
    return;
  }

  // Show configuration (without showing password)
  console.log('📧 Email Configuration:');
  console.log(`   Host: ${process.env.SMTP_HOST}`);
  console.log(`   Port: ${process.env.SMTP_PORT}`);
  console.log(`   User: ${process.env.SMTP_USER}`);
  console.log(`   Password: ${'*'.repeat(process.env.SMTP_PASS?.length || 0)}\n`);

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('🔍 Verifying SMTP connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('📤 Sending test email...');
    const testEmail = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: 'QuickCourt - Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🎾 QuickCourt Email Test</h2>
          <p>Congratulations! Your email configuration is working correctly.</p>
          <p>This test email confirms that:</p>
          <ul>
            <li>✅ SMTP connection is established</li>
            <li>✅ Authentication is successful</li>
            <li>✅ Email delivery is functional</li>
          </ul>
          <p>Your 2FA OTP emails will now be delivered successfully!</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated test email from QuickCourt.<br>
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Check your inbox: ${process.env.SMTP_USER}\n`);

    console.log('🎉 Email configuration is working perfectly!');
    console.log('   Your 2FA registration will now work correctly.\n');

  } catch (error: any) {
    console.error('❌ Email configuration failed:');
    console.error(`   Error: ${error.message}\n`);

    if (error.code === 'EAUTH') {
      console.log('🔧 Authentication Error - Try these solutions:');
      console.log('   1. Make sure you\'re using an App Password, not your regular Gmail password');
      console.log('   2. Enable 2-Step Verification on your Google account');
      console.log('   3. Generate a new App Password at: https://myaccount.google.com/apppasswords');
      console.log('   4. Use the 16-character app password (without spaces)');
    } else if (error.code === 'ECONNECTION') {
      console.log('🔧 Connection Error - Check these settings:');
      console.log('   1. SMTP_HOST should be: smtp.gmail.com');
      console.log('   2. SMTP_PORT should be: 587');
      console.log('   3. SMTP_SECURE should be: false');
    }
  }
}

// Run the test
testEmailConfig().catch(console.error);
