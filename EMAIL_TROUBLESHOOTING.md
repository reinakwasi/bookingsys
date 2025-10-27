# Email Sending Troubleshooting Guide

## Current Issue: Email Timeout (30 seconds)

Your email is timing out when trying to connect to Gmail SMTP. This is usually due to one of these issues:

## 🔴 MOST COMMON CAUSES

### 1. Using Regular Gmail Password Instead of App Password ⚠️

**CRITICAL:** You MUST use a Gmail App Password, NOT your regular Gmail password!

#### How to Generate Gmail App Password:

1. **Enable 2-Factor Authentication** (required first):
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow steps to enable it

2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - OR: Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" as the app
   - Select "Other" as the device, name it "Hotel 734"
   - Click "Generate"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Add to .env.local**:
   ```env
   SMTP_USER=info.hotel734@gmail.com
   SMTP_PASS=abcdefghijklmnop    # Remove spaces from app password
   FROM_EMAIL=info.hotel734@gmail.com
   FROM_NAME=Hotel 734
   ```

4. **Restart your dev server** after updating .env.local

### 2. Network/Firewall Blocking SMTP

Some networks block SMTP ports (587, 465):
- **Corporate networks** often block SMTP
- **Public WiFi** may block email ports
- **Antivirus software** might block connections
- **VPN** might interfere with SMTP

**Solutions:**
- Try from a different network (home WiFi, mobile hotspot)
- Temporarily disable antivirus/firewall to test
- Disable VPN if you're using one
- Check with your ISP if they block SMTP

### 3. Gmail Account Security Settings

Gmail might be blocking the connection if:
- 2-Factor Authentication is NOT enabled
- Account is flagged for suspicious activity
- Too many failed login attempts

**Solutions:**
- Enable 2-Factor Authentication (required for App Passwords)
- Check Gmail for security alerts
- Wait 24 hours if account was flagged
- Try from a different IP address

## 🔧 UPDATED EMAIL API

I've updated the email API to:
- ✅ Try **Port 465 (SSL)** first
- ✅ Fallback to **Port 587 (TLS)** if 465 fails
- ✅ Reduced timeout to 20 seconds per attempt
- ✅ Better error messages with specific troubleshooting

## 🧪 TESTING YOUR GMAIL CREDENTIALS

### Quick Test Script

Create a test file `test-email.js`:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'info.hotel734@gmail.com',
    pass: 'YOUR_APP_PASSWORD_HERE'  // Replace with your app password
  }
});

transporter.sendMail({
  from: '"Hotel 734" <info.hotel734@gmail.com>',
  to: 'your-test-email@gmail.com',
  subject: 'Test Email',
  text: 'If you receive this, your Gmail SMTP is working!'
}, (error, info) => {
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Email sent:', info.messageId);
  }
});
```

Run: `node test-email.js`

## 📋 CHECKLIST

Before testing again, verify:

- [ ] 2-Factor Authentication is ENABLED on Gmail
- [ ] Generated a NEW Gmail App Password (not regular password)
- [ ] Copied app password to `.env.local` as `SMTP_PASS` (no spaces)
- [ ] `SMTP_USER` matches your Gmail address
- [ ] `FROM_EMAIL` matches your Gmail address
- [ ] Restarted development server after changing `.env.local`
- [ ] Not on a network that blocks SMTP (try mobile hotspot)
- [ ] No VPN is interfering
- [ ] Antivirus/firewall is not blocking connections

## 🔍 DEBUGGING STEPS

1. **Check .env.local exists and has values**:
   ```bash
   # In terminal
   echo $SMTP_USER    # Should show your email
   echo $SMTP_PASS    # Should show your app password
   ```

2. **Verify Gmail credentials manually**:
   - Try logging into Gmail with your regular password
   - Check for any security alerts
   - Verify 2FA is enabled

3. **Test network connectivity**:
   ```bash
   # Test if you can reach Gmail SMTP
   telnet smtp.gmail.com 587
   # OR
   telnet smtp.gmail.com 465
   ```

4. **Check console logs** when sending email:
   - Look for "📧 Attempting to send email via Port 465 (SSL)..."
   - Look for "❌ Failed to send via..." error messages
   - Check the troubleshooting tips provided

## 🆘 ALTERNATIVE SOLUTIONS

If Gmail continues to fail, consider these alternatives:

### Option 1: Use SendGrid (Free tier: 100 emails/day)
```env
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Option 2: Use Resend (Free tier: 100 emails/day)
```env
RESEND_API_KEY=your_resend_api_key
```

### Option 3: Use Mailgun
```env
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
```

## 📞 NEXT STEPS

1. **Generate a fresh Gmail App Password** following the steps above
2. **Update .env.local** with the new app password
3. **Restart your development server**
4. **Try purchasing a ticket** and check console logs
5. **If still failing**, try from a different network (mobile hotspot)

## 🔑 COMMON MISTAKES

❌ Using regular Gmail password instead of App Password
❌ Not enabling 2-Factor Authentication first
❌ Copying app password with spaces (remove them)
❌ Not restarting server after changing .env.local
❌ Wrong email in SMTP_USER or FROM_EMAIL
❌ Testing on network that blocks SMTP

## ✅ SUCCESS INDICATORS

When email works, you'll see:
```
📧 Attempting to send email via Port 465 (SSL)...
✅ Email sent successfully via Port 465 (SSL): { messageId: '...' }
✅ Ticket confirmation email sent to: customer@email.com
```

## 📧 CURRENT .ENV.LOCAL FORMAT

Your `.env.local` should have:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx

# Gmail SMTP (CRITICAL - Use App Password!)
SMTP_USER=info.hotel734@gmail.com
SMTP_PASS=abcdefghijklmnop    # 16-char Gmail App Password (no spaces)
FROM_EMAIL=info.hotel734@gmail.com
FROM_NAME=Hotel 734

# Twilio SMS (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

---

**Need Help?** Check the console logs for specific error messages and troubleshooting tips!
