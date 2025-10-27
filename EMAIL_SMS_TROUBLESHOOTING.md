# 🔧 Email & SMS Notification Troubleshooting Guide

## ✅ Issue Fixed!

I found and fixed the root cause of why emails and SMS weren't being sent after successful payments:

### **The Problem:**
The `database.ts` file was using **relative URLs** (`/api/send-ticket-email` and `/api/send-sms`) for server-side fetch calls. Server-side fetch requires **absolute URLs** to work properly.

### **The Fix:**
Updated both API calls to use absolute URLs:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
await fetch(`${apiUrl}/api/send-ticket-email`, { ... });
await fetch(`${apiUrl}/api/send-sms`, { ... });
```

---

## 📋 Required Environment Variables

To ensure emails and SMS work properly, you need these environment variables in your `.env.local` file:

### **1. Site URL (CRITICAL - Just Fixed)**
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# For production: NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```
**This is now required for email/SMS to work!**

### **2. Email Configuration (Gmail SMTP)**
```env
GMAIL_USER=info.hotel734@gmail.com
GMAIL_PASS=your_gmail_app_password

# Alternative names (also supported):
SMTP_USER=info.hotel734@gmail.com
SMTP_PASS=your_gmail_app_password
```

**How to get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Copy the 16-character password
6. Add to `.env.local` as `GMAIL_PASS`

### **3. SMS Configuration (BulkSMS Ghana)**
```env
BULKSMS_API_KEY=your_bulksms_api_key
BULKSMS_SENDER_ID=HOTEL 734
BULKSMS_URL=https://clientlogin.bulksmsgh.com/smsapi
```

**How to get BulkSMS API Key:**
1. Sign up at https://www.bulksmsgh.com/
2. Go to API Settings
3. Copy your API Key
4. Add to `.env.local` as `BULKSMS_API_KEY`

---

## 🧪 Testing After Fix

### **Test Email:**
1. Make sure `NEXT_PUBLIC_SITE_URL` is set in `.env.local`
2. Make sure `GMAIL_USER` and `GMAIL_PASS` are set
3. Restart your dev server: `npm run dev`
4. Complete a ticket purchase
5. Check console logs for:
   ```
   📧 Sending email to: customer@email.com via http://localhost:3000/api/send-ticket-email
   ✅ Email sent successfully to: customer@email.com
   ```

### **Test SMS:**
1. Make sure `NEXT_PUBLIC_SITE_URL` is set in `.env.local`
2. Make sure `BULKSMS_API_KEY` is set (or it will use fallback)
3. Complete a ticket purchase with phone number
4. Check console logs for:
   ```
   📱 SMS API URL: http://localhost:3000/api/send-sms
   ✅ SMS sent successfully: { messageId: '...', provider: 'BulkSMS Ghana' }
   ```

---

## 🔍 Debugging Steps

### **1. Check Console Logs**
After a successful payment, look for these log messages:

**Email Logs:**
```
✅ Ticket purchase created: [purchase_id]
📧 Sending email to: customer@email.com via http://localhost:3000/api/send-ticket-email
📧 Email request data: { purchase_id, customer_email, ... }
✅ Email sent successfully to: customer@email.com
```

**SMS Logs:**
```
📱 Sending SMS notification to: 024409***
📱 SMS API URL: http://localhost:3000/api/send-sms
📱 SMS request received: { to: '024409***', provider: 'BulkSMS Ghana' }
✅ SMS sent successfully: { messageId: '...', provider: 'BulkSMS Ghana' }
```

### **2. Check for Errors**

**If you see:**
```
❌ Failed to send ticket email: TypeError: Failed to fetch
```
**Solution:** Make sure `NEXT_PUBLIC_SITE_URL` is set in `.env.local`

**If you see:**
```
❌ Email credentials missing. Please set GMAIL_USER and GMAIL_PASS
```
**Solution:** Add Gmail credentials to `.env.local`

**If you see:**
```
❌ BulkSMS API key not configured
```
**Solution:** Add `BULKSMS_API_KEY` to `.env.local` (or SMS will use fallback simulation)

### **3. Verify Environment Variables**
Run this in your browser console on your site:
```javascript
console.log('Site URL:', process.env.NEXT_PUBLIC_SITE_URL);
```

Or check in your code:
```typescript
console.log('Environment check:', {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  hasGmailUser: !!process.env.GMAIL_USER,
  hasGmailPass: !!process.env.GMAIL_PASS,
  hasBulkSMS: !!process.env.BULKSMS_API_KEY
});
```

---

## 📧 Email Template

Your customers will receive this email:

**Subject:** 🎉 Hotel 734 - Ticket Purchase Confirmation

**Content:**
- Hotel 734 branding with gold gradient header
- Event details (name, date, quantity, amount)
- Payment reference
- "View My Tickets" button with direct link
- Instructions for using QR code at venue
- Contact information

---

## 📱 SMS Template

Your customers will receive this SMS:

```
HOTEL 734 - TICKET CONFIRMED

Hello [Customer Name]!

EVENT: [EVENT NAME]
DATE: [Event Date]
TICKET: [Quantity]
REFERENCE: [Access Token]

VIEW TICKET: [URL]

IMPORTANT: Present this SMS or scan QR code at venue entrance.

Thank you for choosing Hotel 734!

Support: 0244093821
Email: info@hotel734.com

- Hotel 734 Management
```

---

## ✅ Complete .env.local Example

Here's what your `.env.local` should look like:

```env
# ============================================================================
# SITE CONFIGURATION (REQUIRED FOR EMAIL/SMS)
# ============================================================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ============================================================================
# HUBTEL PAYMENT CONFIGURATION
# ============================================================================
NEXT_PUBLIC_HUBTEL_API_ID=your_hubtel_api_id
HUBTEL_API_KEY=your_hubtel_api_key
NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=your_merchant_account

# ============================================================================
# EMAIL CONFIGURATION (Gmail SMTP)
# ============================================================================
GMAIL_USER=info.hotel734@gmail.com
GMAIL_PASS=your_16_character_app_password

# Alternative names (also supported):
SMTP_USER=info.hotel734@gmail.com
SMTP_PASS=your_16_character_app_password

# ============================================================================
# SMS CONFIGURATION (BulkSMS Ghana)
# ============================================================================
BULKSMS_API_KEY=your_bulksms_api_key
BULKSMS_SENDER_ID=HOTEL 734
BULKSMS_URL=https://clientlogin.bulksmsgh.com/smsapi

# ============================================================================
# SUPABASE CONFIGURATION
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🚀 After Fixing

1. **Add `NEXT_PUBLIC_SITE_URL` to `.env.local`** (most important!)
2. **Verify Gmail credentials are correct**
3. **Restart your development server**
4. **Test a ticket purchase**
5. **Check console logs for success messages**
6. **Check your email inbox**
7. **Check your phone for SMS**

---

## 🎯 Expected Behavior

After a successful payment:

1. ✅ Payment verified with Hubtel
2. ✅ Ticket purchase record created in database
3. ✅ Email sent to customer with ticket details
4. ✅ SMS sent to customer with ticket link
5. ✅ Success message shown to user
6. ✅ Ticket appears in "My Tickets" page

---

## 📞 Still Having Issues?

Check these common problems:

### **Email Not Received:**
- Check spam/junk folder
- Verify Gmail App Password is correct (not regular password)
- Check Gmail account has 2FA enabled
- Look for error logs in console

### **SMS Not Received:**
- Verify phone number format (should start with 0 or 233)
- Check BulkSMS account has credits
- Verify API key is correct
- SMS may use fallback simulation if BulkSMS fails (check logs)

### **Both Not Working:**
- **Most likely:** `NEXT_PUBLIC_SITE_URL` is missing or incorrect
- Check console for "Failed to fetch" errors
- Restart development server after adding env vars
- Verify `.env.local` file is in project root

---

**Status:** 🟢 **FIXED AND READY TO TEST**

The code has been updated to use absolute URLs. Just add `NEXT_PUBLIC_SITE_URL` to your `.env.local` and restart!
