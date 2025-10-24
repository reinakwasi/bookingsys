# 🚨 PRODUCTION DEPLOYMENT FIX - Callback URL Issue

## 🔍 **ROOT CAUSE IDENTIFIED:**

Your production environment is using `http://localhost:3000` for the callback URL because the environment variable `NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_APP_URL` is **NOT SET** in production!

### **Evidence from your logs:**
```
callbackUrl: 'http://localhost:3000/api/payments/hubtel/callback'
```

This means Hubtel **CANNOT** reach your callback endpoint, so:
- ❌ No callback confirmation stored in database
- ❌ Payment verification fails
- ❌ Tickets never created
- ❌ No email/SMS sent

## ✅ **THE FIX:**

### **Step 1: Set Environment Variable in Production**

Go to your production hosting platform (Vercel/Netlify/etc.) and add this environment variable:

```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**OR**

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

**IMPORTANT:** Replace `https://yourdomain.com` with your actual production domain!

### **Step 2: Redeploy**

After setting the environment variable:

```bash
git add .
git commit -m "Fix callback URL for production"
git push
```

Wait for deployment to complete.

### **Step 3: Verify the Fix**

After redeployment, make a test payment and check the server logs. You should see:

```
🌍 Site URL being used: https://yourdomain.com
🔍 Environment check: {
  NEXT_PUBLIC_APP_URL: 'SET',
  NEXT_PUBLIC_SITE_URL: 'SET',
  VERCEL_URL: 'SET'
}
📤 Sending to Hubtel: {
  callbackUrl: 'https://yourdomain.com/api/payments/hubtel/callback',
  ...
}
```

Then after payment:
```
🔊 🔊 🔊 HUBTEL CALLBACK ENDPOINT HIT! 🔊 🔊 🔊
✅ Callback confirmation stored in database
✅ Payment verified via Hubtel callback confirmation!
✅ Proceeding with secure ticket creation...
🎉 SUCCESS ALERT TRIGGERED!
✅ Email sent successfully
✅ SMS sent successfully
```

## 📋 **Required Environment Variables for Production:**

Make sure ALL these are set in your production environment:

```bash
# Site Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
# OR
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Hubtel Payment Gateway
NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=2032060
NEXT_PUBLIC_HUBTEL_API_ID=your-api-id
NEXT_PUBLIC_HUBTEL_API_KEY=your-api-key

# Email (Gmail SMTP)
GMAIL_USER=your-hotel734-email@gmail.com
GMAIL_PASS=your-app-specific-password

# SMS (BulkSMS Ghana)
BULKSMS_API_KEY=your-bulksms-api-key
BULKSMS_SENDER_ID=HOTEL 734

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🎯 **What Will Happen After Fix:**

### **Before (Current - Broken):**
```
Payment → Hubtel tries to call localhost ❌ → No callback stored ❌ → Verification fails ❌ → No tickets ❌
```

### **After (Fixed):**
```
Payment → Hubtel calls production URL ✅ → Callback stored ✅ → Verification succeeds ✅ → Tickets created ✅ → Email/SMS sent ✅
```

## 🔍 **How to Check Your Current Environment Variables:**

### **Vercel:**
1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Check if `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_SITE_URL` exists
4. If not, add it with your production domain

### **Netlify:**
1. Go to "Site settings" → "Environment variables"
2. Check if `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_SITE_URL` exists
3. If not, add it with your production domain

### **Other Platforms:**
Check your platform's environment variable settings and ensure the site URL is configured.

## 🚀 **Quick Test After Fix:**

1. **Deploy the updated code**
2. **Make a test payment** (small amount)
3. **Check server logs** - you should see the correct production URL
4. **Complete payment** in Hubtel
5. **Within 3 seconds** you should see:
   - Success alert popup ✅
   - Ticket created in database ✅
   - Email received ✅
   - SMS received ✅

## ⚠️ **Common Mistakes:**

1. **❌ Forgetting to redeploy** after setting environment variable
2. **❌ Using `http://` instead of `https://`** in production URL
3. **❌ Including trailing slash** in URL (should be `https://domain.com` not `https://domain.com/`)
4. **❌ Not setting the variable as `NEXT_PUBLIC_`** prefix (Next.js requires this for client-side access)

## ✅ **Success Checklist:**

- [ ] Environment variable `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_SITE_URL` set in production
- [ ] Value is your actual production domain (e.g., `https://hotel734.com`)
- [ ] Code redeployed after setting variable
- [ ] Test payment made
- [ ] Server logs show correct production URL
- [ ] Hubtel callback endpoint receives request
- [ ] Payment verification succeeds
- [ ] Tickets created in database
- [ ] Email and SMS sent successfully

---

**Once you set the environment variable and redeploy, everything will work perfectly!** 🎉
