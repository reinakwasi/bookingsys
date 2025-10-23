# 🔧 Environment Setup for Hotel 734 Notifications

## 📧 Email Configuration (Gmail SMTP)

Add these to your `.env.local` file:

```bash
# Gmail SMTP Configuration
GMAIL_USER=your-hotel734-email@gmail.com
GMAIL_PASS=your-app-specific-password

# Alternative SMTP names (for compatibility)
SMTP_USER=your-hotel734-email@gmail.com
SMTP_PASS=your-app-specific-password
```

### How to get Gmail App Password:
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security → App passwords
4. Generate app password for "Mail"
5. Use that password (not your regular Gmail password)

## 📱 SMS Configuration (BulkSMS Ghana)

Add these to your `.env.local` file:

```bash
# BulkSMS Ghana Configuration
BULKSMS_API_KEY=your-bulksms-api-key
BULKSMS_SENDER_ID=HOTEL 734
BULKSMS_URL=https://clientlogin.bulksmsgh.com/smsapi
```

### How to get BulkSMS API Key:
1. Visit https://www.bulksmsgh.com/
2. Create account and verify
3. Go to API section
4. Copy your API key
5. Set sender ID to "HOTEL 734"

## 🌐 Base URL Configuration

```bash
# Base URL for ticket links
NEXT_PUBLIC_APP_URL=https://your-domain.com
# OR for Vercel deployment
VERCEL_URL=your-vercel-app.vercel.app
```

## 🔍 Testing Configuration

To test if your environment is set up correctly:

1. Check email: Visit `/api/send-ticket-email` endpoint
2. Check SMS: Visit `/api/send-sms` endpoint
3. Check logs in browser console and server logs

## ⚠️ Important Notes

- **Without email config**: Email notifications will fail with error message
- **Without SMS config**: SMS will use fallback simulation (appears successful but doesn't send)
- **Without base URL**: Ticket links may not work properly

## 🚨 Current Status Check

Run this in browser console after payment to check:

```javascript
// Check if notifications were sent
console.log('Check server logs for:');
console.log('✅ Email sent successfully');
console.log('✅ SMS sent successfully');
```

## 📋 Complete .env.local Template

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Gmail SMTP Configuration
GMAIL_USER=your-hotel734-email@gmail.com
GMAIL_PASS=your-app-specific-password

# BulkSMS Ghana Configuration
BULKSMS_API_KEY=your-bulksms-api-key
BULKSMS_SENDER_ID=HOTEL 734

# Base URL Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Hubtel Payment Configuration
HUBTEL_CLIENT_ID=your-hubtel-client-id
HUBTEL_CLIENT_SECRET=your-hubtel-client-secret
HUBTEL_MERCHANT_ID=your-hubtel-merchant-id
```
