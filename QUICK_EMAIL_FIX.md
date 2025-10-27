# 🚨 QUICK FIX: Email Timeout Issue

## The Problem
Email sending is timing out after 30 seconds when trying to connect to Gmail SMTP.

## 🔴 MOST LIKELY CAUSE
You're using your **regular Gmail password** instead of a **Gmail App Password**.

## ✅ SOLUTION (5 Minutes)

### Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the steps to enable it (if not already enabled)

### Step 2: Generate Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **"Mail"** as the app
3. Select **"Other"** as device, name it "Hotel 734"
4. Click **"Generate"**
5. Copy the 16-character password (looks like: `abcd efgh ijkl mnop`)

### Step 3: Update .env.local
Open your `.env.local` file and update:

```env
SMTP_USER=info.hotel734@gmail.com
SMTP_PASS=abcdefghijklmnop    # Paste app password here (remove spaces)
FROM_EMAIL=info.hotel734@gmail.com
FROM_NAME=Hotel 734
```

### Step 4: Restart Development Server
```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

### Step 5: Test
Purchase a ticket and check the console for:
```
✅ Email sent successfully via Port 465 (SSL)
✅ Ticket confirmation email sent to: customer@email.com
```

## 🔧 What I Fixed in the Code

I updated `/app/api/send-email-working/route.ts` to:
- ✅ Try **Port 465 (SSL)** first (more reliable)
- ✅ Automatically fallback to **Port 587 (TLS)** if 465 fails
- ✅ Reduced timeout from 30s to 20s per attempt
- ✅ Better error messages with specific troubleshooting steps

## 🧪 Quick Test

After updating .env.local, purchase a test ticket. You should see in console:

**Success:**
```
📧 Attempting to send email via Port 465 (SSL)...
✅ Email sent successfully via Port 465 (SSL)
✅ Ticket confirmation email sent to: customer@email.com
```

**Still Failing?**
Check the error message in console - it will tell you exactly what's wrong.

## 🆘 Still Not Working?

Common issues:
1. **App password has spaces** - Remove all spaces from the 16-character password
2. **Server not restarted** - Must restart after changing .env.local
3. **Network blocks SMTP** - Try from mobile hotspot or different network
4. **Wrong email** - SMTP_USER must match FROM_EMAIL

See `EMAIL_TROUBLESHOOTING.md` for detailed debugging steps.
