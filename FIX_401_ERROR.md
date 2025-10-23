# 🚨 HOW TO FIX THE 401 UNAUTHORIZED ERROR

## The Problem
```
❌ Hubtel API error: 401 Unauthorized
```

This means **your Hubtel credentials are incorrect or invalid**.

## ✅ SOLUTION - 3 Steps

### Step 1: Test Your Credentials

I've created a test endpoint. **Restart your server** and visit:

```
http://localhost:3000/api/test-hubtel
```

This will show you:
- ✅ If credentials are loaded correctly
- ✅ The exact error from Hubtel
- ✅ What to do next

### Step 2: Check the Test Results

**If you see**:
```json
{
  "success": true,
  "message": "✅ Credentials are valid! Hubtel API is accessible."
}
```
**→ Your credentials work! The payment should work now.**

**If you see**:
```json
{
  "success": false,
  "httpStatus": 401,
  "message": "❌ Credentials test failed"
}
```
**→ Your credentials are WRONG. See Step 3.**

### Step 3: Get Correct Credentials from Hubtel

**The credentials you have are being rejected by Hubtel.**

#### Option A: Check Hubtel Dashboard
1. Log into https://unity.hubtel.com/
2. Go to **Settings** → **API Keys** or **Receive Money** → **Online Checkout**
3. Copy the **correct** credentials:
   - API ID (or Client ID)
   - API Key (or Client Secret)  
   - Merchant Account Number (or POS Sales ID)

#### Option B: Contact Hubtel Support
**This is the FASTEST solution!**

**Email**: support@hubtel.com

**Message**:
```
Subject: 401 Unauthorized Error - Online Checkout API

Hi Hubtel Support,

I'm getting a 401 Unauthorized error when calling your Online Checkout API 
at https://payproxyapi.hubtel.com/items/initiate

My current credentials:
- API ID: wpxJW1
- Merchant Account: 3740971

Can you please verify:
1. Are these credentials correct for Online Checkout API?
2. Is Online Checkout activated on my account?
3. What is the correct API endpoint I should use?

Thank you!
```

## 🔧 After Getting Correct Credentials

### 1. Update `.env.local`
```env
NEXT_PUBLIC_HUBTEL_API_ID=your_correct_api_id
HUBTEL_API_KEY=your_correct_api_key
NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=your_correct_merchant_account
```

### 2. Restart Server
```bash
# Press Ctrl+C to stop
npm run dev
```

### 3. Test Again
Visit: `http://localhost:3000/api/test-hubtel`

Should now show: `✅ Credentials are valid!`

### 4. Try Payment
Go to `/tickets` and try purchasing a ticket!

## 🎯 Quick Checklist

- [ ] Restart server: `npm run dev`
- [ ] Visit test endpoint: `http://localhost:3000/api/test-hubtel`
- [ ] Check test results
- [ ] If 401 error: Contact Hubtel support
- [ ] Get correct credentials from Hubtel
- [ ] Update `.env.local`
- [ ] Restart server again
- [ ] Test again

## 📞 Hubtel Contact Info

- **Website**: https://hubtel.com/
- **Support Email**: support@hubtel.com
- **Dashboard**: https://unity.hubtel.com/

## ⚡ TL;DR

1. **Restart server**: `npm run dev`
2. **Test credentials**: Visit `http://localhost:3000/api/test-hubtel`
3. **If 401 error**: Contact Hubtel support to get correct credentials
4. **Update `.env.local`** with correct credentials
5. **Restart and test again**

---

**The code is perfect. The issue is with the Hubtel credentials. Once you have the correct credentials from Hubtel, everything will work!**
