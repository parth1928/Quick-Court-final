# 🧪 Frontend Registration Testing Guide

## What We Fixed
✅ **Session Management**: Increased TTL to 45 minutes + database fallback  
✅ **Memory + Database**: Dual storage for session persistence  
✅ **Better Debugging**: Detailed logging to track session state  
✅ **OTP Component**: Fixed Dialog accessibility issues  
✅ **Error Handling**: Better error messages and fallbacks  

## How to Test the Fix

### Step 1: Go to Registration Page
Navigate to: `http://192.168.102.132:3000/signup`

### Step 2: Fill the Form
- **Name**: Test User
- **Email**: Use a unique email like `test-$(timestamp)@example.com`
- **Password**: testpassword123 (at least 8 characters)
- **Role**: User
- **Phone**: Leave default or enter any number

### Step 3: Submit Registration
Click "Create Account" - you should see:
- ✅ Success message: "Verification code sent to your email"
- ✅ OTP modal appears
- ✅ Timer shows 5:00 countdown

### Step 4: Get the OTP
**Check your server terminal/console** for a line like:
```
🔐 Generated OTP for your-email@example.com: 123456
```

### Step 5: Test Session Persistence
**IMPORTANT**: Wait 2-3 minutes before entering the OTP to test that the session doesn't expire immediately.

### Step 6: Enter OTP
- Enter the 6-digit code from the server console
- The form should auto-submit when all 6 digits are entered

### Step 7: Expected Results
✅ **SUCCESS**: You should be redirected to the user dashboard  
✅ **NO ERROR**: No "Registration session expired" message  
✅ **USER CREATED**: New user account should be created  

## If You Still Get "Session Expired"

### Check Server Console
Look for these debug messages:
```
✅ Stored pending user session for [email] - expires in 45 minutes
📊 Current sessions count: 1
🔍 Looking for session: pending_[email]
✅ Found valid session for pending_[email] - XX minutes remaining
```

### Common Issues to Check
1. **Wrong Email Case**: Make sure email case matches exactly
2. **Server Restart**: If server restarted, memory sessions are lost (but database should restore)
3. **Database Connection**: Check if MongoDB is connected properly

## Debug Information
If it still fails, you'll see detailed debug info including:
- ✅ Session keys being searched
- ✅ Available sessions in memory
- ✅ Database fallback attempts
- ✅ Timing information

## Testing Different Scenarios

### Scenario 1: Normal Flow (Should Work)
1. Register → Wait 1 min → Enter correct OTP → Success

### Scenario 2: Long Wait (Should Work with DB Fallback)
1. Register → Wait 10 min → Enter correct OTP → Success

### Scenario 3: Wrong OTP (Should Allow Retry)
1. Register → Enter wrong OTP → See error → Enter correct OTP → Success

### Scenario 4: Max Attempts (Should Reset Session)
1. Register → Enter wrong OTP 3 times → Session expires → Start over

## Success Indicators
- ✅ User gets redirected to `/user-home`
- ✅ JWT token is set in cookies
- ✅ User data is stored in localStorage
- ✅ No console errors
- ✅ Database has new user record

---

## Quick Test Commands (for your reference)
If you need to check the database:
```bash
# Check if user was created
db.users.find({email: "your-test-email@example.com"})

# Check pending registrations
db.pendingregistrations.find()

# Check OTP records
db.otps.find()
```

## What's Different Now
1. **45-minute session** instead of 15 minutes
2. **Database backup** for session data
3. **Automatic session restoration** from database
4. **Better error messages** with debug info
5. **Fixed Dialog accessibility** issues

Go ahead and test! The registration should work smoothly now. 🚀
