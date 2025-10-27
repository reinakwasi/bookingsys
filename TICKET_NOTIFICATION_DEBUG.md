# 🔍 Ticket Notification Debug Guide

## Current Status: DEBUGGING EMAIL/SMS NOT SENDING

The payment flow is working, but emails and SMS are not being sent after successful payment. Let's debug this step by step.

## 🧪 Debug Steps

### **Step 1: Check Environment Variables**

Add this to your browser console on your site:
```javascript
console.log('Environment check:', {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  hasGmailUser: !!process.env.GMAIL_USER,
  hasGmailPass: !!process.env.GMAIL_PASS,
  hasBulkSMS: !!process.env.BULKSMS_API_KEY
});
```

### **Step 2: Check Server Logs**

After making a payment, look for these logs in your terminal:

**✅ Expected Success Logs:**
```
✅ Ticket purchase created: [purchase_id]
📧 Sending email to: customer@email.com via http://localhost:3000/api/send-ticket-email
✅ Email sent successfully to: customer@email.com
📱 SMS API URL: http://localhost:3000/api/send-sms
✅ SMS sent successfully: { messageId: '...', provider: 'BulkSMS Ghana' }
```

**❌ Error Logs to Look For:**
```
❌ Failed to send ticket email: TypeError: Failed to fetch
❌ Email sending failed: [error details]
❌ SMS sending failed: [error details]
```

### **Step 3: Manual API Test**

Test the email API directly:
```bash
curl -X POST http://localhost:3000/api/send-ticket-email \
  -H "Content-Type: application/json" \
  -d '{
    "purchase_id": "test",
    "access_token": "TKT-TEST-123",
    "customer_email": "your-email@gmail.com",
    "customer_name": "Test Customer",
    "ticket_title": "Test Event",
    "quantity": 1,
    "total_amount": 50,
    "payment_reference": "TEST-REF",
    "event_date": "Friday, December 25, 2024",
    "purchase_date": "December 24, 2024, 10:00 AM"
  }'
```

### **Step 4: Check Payment Success Handler**

Look for this log after payment:
```
✅ Starting payment success handling for reference: [reference]
✅ Ticket purchase created: [purchase_id]
📧 Email and SMS notifications sent automatically by ticketPurchasesAPI
```

If you don't see these logs, the `handlePaymentSuccess` function isn't being called.

## 🔧 Common Issues & Fixes

### **Issue 1: NEXT_PUBLIC_SITE_URL Missing**
**Symptoms:** `Failed to fetch` errors
**Fix:** Add to `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### **Issue 2: Gmail Credentials Wrong**
**Symptoms:** Email API returns 500 error
**Fix:** Check Gmail App Password (not regular password):
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Generate App Password for "Mail"
4. Use 16-character password in `.env.local`

### **Issue 3: Payment Completion Not Detected**
**Symptoms:** Payment succeeds but no ticket creation logs
**Fix:** Use the manual completion button or close modal after payment

### **Issue 4: Server-Side Fetch Failing**
**Symptoms:** Relative URL errors in server logs
**Fix:** Already fixed - using absolute URLs now

## 🎯 Quick Test Procedure

1. **Add `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to `.env.local`**
2. **Restart dev server:** `npm run dev`
3. **Make a test payment**
4. **Watch terminal logs carefully**
5. **Check email inbox and phone for notifications**

## 📋 Environment Variables Checklist

Your `.env.local` should have:
```env
# CRITICAL - Just added this fix
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email (Gmail SMTP)
SMTP_USER=info.hotel734@gmail.com
SMTP_PASS=supk fann lezp lcop
FROM_EMAIL=info.hotel734@gmail.com
FROM_NAME=Hotel 734

# SMS (BulkSMS Ghana)
BULKSMS_API_KEY=2887bf87-85f2-4bd9-81a5-49578ad12f02
BULKSMS_SENDER_ID=HOTEL 734

# Hubtel Payment
NEXT_PUBLIC_HUBTEL_API_ID=Y7Z4W6W
HUBTEL_API_KEY=b95ff74e757d46bab24ae0db95067015
NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=2032060

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://crrwaepcyktjmndnapny.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your_key]
```

## 🚨 Most Likely Issue

Based on your environment variables, you're **missing `NEXT_PUBLIC_SITE_URL`** which is causing the server-side fetch calls to fail.

**SOLUTION:** Add this line to your `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then restart your server and test again!

## 📞 If Still Not Working

1. **Check browser console** for any JavaScript errors
2. **Check terminal logs** for server-side errors
3. **Test email API directly** with curl command above
4. **Verify Gmail credentials** are correct App Password
5. **Check spam folder** for emails

The fix should work - the code is correct, just missing the environment variable!
