# Email Configuration Setup Guide

## Quick Setup for Gmail

1. **Create a .env.local file** in your project root with:

```env
# Email Configuration for Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Other required variables
MONGODB_URI=mongodb://localhost:27017/quickcourt
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
```

2. **Generate Gmail App Password:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Enable 2-Factor Authentication if not already enabled
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Generate a new app password for "Mail"
   - Use this 16-character password as `SMTP_PASS`

3. **Test Email Configuration:**
   - Visit: http://localhost:3000/api/test-email
   - If successful, try sending a test email by making a POST request:
     ```bash
     curl -X POST http://localhost:3000/api/test-email \
       -H "Content-Type: application/json" \
       -d '{"email":"your-test-email@gmail.com"}'
     ```

## Alternative Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Check your email/password
   - For Gmail: Use app password, not regular password
   - Ensure 2FA is enabled for Gmail

2. **"Connection refused"**
   - Check SMTP_HOST and SMTP_PORT
   - Verify firewall/network settings

3. **"Email rejected"**
   - Check recipient email format
   - Verify sender email is valid

### Testing Steps:

1. Check environment variables: `GET /api/test-email`
2. Send test email: `POST /api/test-email` with `{"email":"test@example.com"}`
3. Check console logs for detailed error messages
4. Verify email settings in your email provider

## Security Notes

- Never commit .env.local to version control
- Use app-specific passwords when available
- Enable 2FA on your email account
- Consider using a dedicated email service for production

## Production Recommendations

- Use services like SendGrid, Mailgun, or AWS SES
- Set up proper SPF, DKIM, and DMARC records
- Monitor email delivery rates and bounces
