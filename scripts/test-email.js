/**
 * Simple test for 2FA email configuration
 * Run with: node scripts/test-email.js
 */

const { createTransport } = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmailConfig() {
  console.log('🧪 Testing Email Configuration for 2FA\n');

  // Check if SMTP credentials are configured
  const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.log('❌ Missing environment variables:');
    missing.forEach(varName => console.log(`   - ${varName}`));
    console.log('\n📝 Please configure these in your .env.local file');
    console.log('📖 See .env.example for configuration examples');
    return;
  }

  console.log('✅ SMTP credentials found in environment');
  console.log(`   Host: ${process.env.SMTP_HOST}`);
  console.log(`   User: ${process.env.SMTP_USER}`);
  console.log(`   Port: ${process.env.SMTP_PORT || '587'}\n`);

  // Test SMTP connection
  try {
    console.log('🔌 Testing SMTP connection...');
    
    const transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Optionally send a test email
    console.log('📧 Sending test email...');
    const testEmail = {
      from: {
        name: 'QuickCourt Test',
        address: process.env.SMTP_FROM || process.env.SMTP_USER,
      },
      to: process.env.SMTP_USER, // Send to yourself
      subject: '🧪 QuickCourt 2FA Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937;">🎉 QuickCourt 2FA Test Successful!</h2>
          <p>This is a test email to verify your 2FA configuration is working correctly.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 24px; font-weight: bold; color: #059669; text-align: center; margin: 0;">
              TEST123
            </p>
            <p style="text-align: center; color: #6b7280; margin: 10px 0 0 0;">Sample OTP Format</p>
          </div>
          <p><strong>Configuration Details:</strong></p>
          <ul>
            <li>Host: ${process.env.SMTP_HOST}</li>
            <li>Port: ${process.env.SMTP_PORT || '587'}</li>
            <li>User: ${process.env.SMTP_USER}</li>
          </ul>
          <p>Your 2FA system is ready to use! 🔒</p>
        </div>
      `,
      text: `
        QuickCourt 2FA Test Successful!
        
        This is a test email to verify your 2FA configuration.
        Sample OTP: TEST123
        
        Configuration:
        - Host: ${process.env.SMTP_HOST}
        - Port: ${process.env.SMTP_PORT || '587'}
        - User: ${process.env.SMTP_USER}
        
        Your 2FA system is ready!
      `,
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Check your inbox: ${process.env.SMTP_USER}\n`);

  } catch (error) {
    console.log('❌ SMTP connection failed:');
    console.log(`   Error: ${error.message}\n`);
    
    console.log('🔧 Common fixes:');
    console.log('   - Check your email and password');
    console.log('   - For Gmail: Use App Password instead of regular password');
    console.log('   - Check firewall/network settings');
    console.log('   - Verify SMTP host and port settings');
  }

  console.log('🎯 Next steps:');
  console.log('   1. Configure SMTP credentials in .env.local');
  console.log('   2. Test login with 2FA on your app');
  console.log('   3. Check email inbox for OTP codes');
}

// Run the test
testEmailConfig().catch(console.error);
