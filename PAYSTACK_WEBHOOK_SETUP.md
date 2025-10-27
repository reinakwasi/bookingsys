# Paystack Webhook Setup Guide

## Overview
This guide will help you set up Paystack webhooks to automatically process payments and send SMS/email notifications without requiring manual verification or IP whitelisting.

## 🔧 Webhook Configuration

### 1. **Access Paystack Dashboard**
- Go to [Paystack Dashboard](https://dashboard.paystack.co/)
- Login to your account
- Navigate to **Settings** → **Webhooks**

### 2. **Add Webhook URL**
- Click **"Add Endpoint"**
- Enter your webhook URL: `https://yourdomain.com/api/webhooks/paystack`
- **For development**: `https://your-ngrok-url.ngrok.io/api/webhooks/paystack`

### 3. **Select Events**
- Check **"charge.success"** - This is the main event we need
- Optionally check other events like:
  - `charge.failed`
  - `charge.pending`
  - `transfer.success`

### 4. **Save Webhook**
- Click **"Save"**
- Copy the **webhook secret** (you'll need this)

## 🔐 Environment Variables

Add these to your `.env.local` file:

```env
# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here

# Your site URL (important for webhooks)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Email Configuration (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# SMS Configuration (BulkSMS Ghana)
BULKSMS_API_KEY=your-bulksms-api-key
```

## 🚀 How It Works

### **Payment Flow with Webhooks:**

1. **User initiates payment** → Frontend calls `/api/payments/initialize`
2. **Payment initialized** → User redirected to Paystack payment page
3. **User completes payment** → Paystack processes the payment
4. **Webhook triggered** → Paystack sends `charge.success` event to your webhook
5. **Automatic processing** → Your webhook:
   - Verifies the webhook signature
   - Creates the ticket purchase in database
   - Sends email notification automatically
   - Sends SMS notification automatically
6. **User redirected** → Back to your site with success message

### **Key Benefits:**
- ✅ **No manual verification needed**
- ✅ **No IP whitelisting required**
- ✅ **Automatic email/SMS sending**
- ✅ **Real-time processing**
- ✅ **Secure signature verification**

## 🧪 Testing Webhooks

### **Local Development with ngrok:**

1. **Install ngrok**: `npm install -g ngrok`
2. **Start your dev server**: `npm run dev`
3. **Expose local server**: `ngrok http 3000`
4. **Copy ngrok URL**: `https://abc123.ngrok.io`
5. **Update webhook URL**: `https://abc123.ngrok.io/api/webhooks/paystack`

### **Test Payment Flow:**
1. Make a test payment using Paystack test cards
2. Check your server logs for webhook events
3. Verify email/SMS notifications are sent

## 📧 Email Configuration

### **Gmail SMTP Setup:**
1. Enable 2-factor authentication on Gmail
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password as `GMAIL_APP_PASSWORD`

## 📱 SMS Configuration

### **BulkSMS Ghana Setup:**
1. Sign up at [BulkSMS Ghana](https://www.bulksmsghana.com/)
2. Get your API key from dashboard
3. Add to environment variables

## 🔍 Debugging

### **Check Webhook Logs:**
```bash
# In your server console, you should see:
🔔 Paystack webhook received
✅ Paystack signature verified
💰 Processing successful payment: HTL734_...
🎫 Creating ticket purchase...
✅ Ticket purchase created: 123
📧 Sending email notification...
✅ Email sent successfully
📱 Sending SMS notification...
✅ SMS sent successfully
🎉 Payment processing completed successfully
```

### **Common Issues:**

1. **Webhook not receiving events:**
   - Check webhook URL is correct
   - Ensure server is accessible from internet
   - Verify webhook is enabled in Paystack dashboard

2. **Signature verification fails:**
   - Check `PAYSTACK_SECRET_KEY` is correct
   - Ensure webhook secret matches

3. **Email/SMS not sending:**
   - Check email/SMS API credentials
   - Verify `NEXT_PUBLIC_SITE_URL` is correct
   - Check server logs for specific errors

## 🎯 Production Deployment

### **Before Going Live:**
1. ✅ Update webhook URL to production domain
2. ✅ Switch to live Paystack keys
3. ✅ Test webhook with live payments
4. ✅ Verify email/SMS delivery
5. ✅ Monitor webhook logs

### **Webhook URL Examples:**
- **Development**: `https://abc123.ngrok.io/api/webhooks/paystack`
- **Production**: `https://hotel734.com/api/webhooks/paystack`

## 📋 Webhook Payload Example

```json
{
  "event": "charge.success",
  "data": {
    "id": 123456789,
    "domain": "test",
    "status": "success",
    "reference": "HTL734_1703347200000_abc123",
    "amount": 5000,
    "currency": "GHS",
    "paid_at": "2024-01-01T12:00:00.000Z",
    "channel": "card",
    "customer": {
      "email": "customer@example.com"
    },
    "metadata": {
      "ticket_id": "123",
      "quantity": 1,
      "customer_name": "John Doe",
      "customer_phone": "+233123456789"
    }
  }
}
```

## ✅ Success Indicators

When everything is working correctly:
- ✅ Payments process automatically
- ✅ Customers receive email confirmations
- ✅ Customers receive SMS notifications
- ✅ Tickets appear in "My Tickets" section
- ✅ Admin can see purchases in dashboard
- ✅ No manual verification needed

## 🆘 Support

If you encounter issues:
1. Check server logs for webhook events
2. Verify all environment variables
3. Test webhook URL accessibility
4. Contact Paystack support if needed

The webhook system eliminates the need for IP whitelisting and provides a much more reliable payment processing experience!
