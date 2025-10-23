# 🚨 CRITICAL: Hubtel 401 Unauthorized Error

## The Problem

You're getting **`401 Unauthorized`** from Hubtel API, which means:
- ❌ The API credentials are **incorrect**
- ❌ The credentials are for a **different Hubtel service**
- ❌ The credentials have **expired** or been **revoked**

## 🔍 What We Know

The credentials you provided:
- **API ID**: `wpxJW1`
- **API Key**: `c7e83f5a4cd6451a90515f7e14a61ca8`
- **Merchant Account**: `3740971`

These credentials are being **rejected** by Hubtel's Online Checkout API at:
```
https://payproxyapi.hubtel.com/items/initiate
```

## ⚠️ Possible Causes

### 1. **Wrong Hubtel Service**
Hubtel has multiple APIs:
- **Online Checkout API** (what we're using) - `payproxyapi.hubtel.com`
- **Payment API** - Different endpoint
- **SMS API** - Different credentials
- **USSD API** - Different credentials

**Your credentials might be for a different service!**

### 2. **Credentials Format Issue**
Some Hubtel services use:
- **Client ID** + **Client Secret** (OAuth)
- **API Key** only (single key)
- **Username** + **Password** (Basic Auth)

**We're using Basic Auth with API ID:API Key format**

### 3. **Account Not Activated**
- Your Hubtel account might not have **Online Checkout** enabled
- You might need to activate it in Hubtel dashboard
- Contact Hubtel support to enable it

### 4. **Credentials Expired/Revoked**
- API keys can expire
- They can be regenerated/revoked
- Check Hubtel dashboard for current credentials

## ✅ IMMEDIATE ACTIONS REQUIRED

### Action 1: Verify Your Hubtel Service Type

**Log into your Hubtel Dashboard**:
1. Go to https://unity.hubtel.com/
2. Check which services you have access to
3. Look for **"Online Checkout"** or **"Receive Money"**

### Action 2: Get the Correct Credentials

In your Hubtel Dashboard:
1. Navigate to **Settings** or **API Keys**
2. Look for **"Online Checkout API"** credentials
3. You should see:
   - **Client ID** or **API ID**
   - **Client Secret** or **API Key**
   - **Merchant Account Number** or **POS Sales ID**

### Action 3: Check Credential Format

Hubtel Online Checkout might use **different credential names**:

**Option A: Client ID + Client Secret**
```env
NEXT_PUBLIC_HUBTEL_CLIENT_ID=your_client_id
HUBTEL_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=your_merchant_account
```

**Option B: API ID + API Key** (current)
```env
NEXT_PUBLIC_HUBTEL_API_ID=wpxJW1
HUBTEL_API_KEY=c7e83f5a4cd6451a90515f7e14a61ca8
NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=3740971
```

**Option C: Single API Key**
```env
HUBTEL_API_KEY=your_single_api_key
NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=your_merchant_account
```

## 🧪 Test Your Credentials

### Test 1: Check Hubtel Dashboard

1. Log into https://unity.hubtel.com/
2. Go to **Receive Money** → **Online Checkout**
3. Check if the service is **active**
4. Get the **correct credentials** from there

### Test 2: Contact Hubtel Support

**Email**: support@hubtel.com or your account manager

**Ask them**:
1. "Are these credentials correct for Online Checkout API?"
2. "What is the correct API endpoint for payment initialization?"
3. "Do I need to activate Online Checkout on my account?"
4. "What authentication method should I use?"

### Test 3: Try Alternative Endpoint

Hubtel might have changed their API endpoint. Try:
- `https://payproxyapi.hubtel.com/items/initiate` (current)
- `https://api.hubtel.com/v1/merchantaccount/onlinecheckout/invoice/create`
- `https://api.hubtel.com/v2/checkout/invoice/create`

## 🔧 Alternative Solution: Use Test Credentials

Hubtel provides **test/sandbox credentials** for development:

**Ask Hubtel support for**:
- Sandbox API credentials
- Test merchant account
- Test API endpoint

This will let you develop and test without using live credentials.

## 📞 URGENT: Contact Hubtel

**This is the fastest solution!**

1. **Call Hubtel Support**: Check their website for phone number
2. **Email**: support@hubtel.com
3. **Live Chat**: If available on their website

**Tell them**:
> "I'm getting 401 Unauthorized when calling the Online Checkout API at payproxyapi.hubtel.com/items/initiate. My API ID is wpxJW1. Can you verify if these credentials are correct for Online Checkout and if the service is activated on my account?"

## 🔍 Debug Information

After restarting your server, check the terminal for:

```
🔐 Auth Debug: {
  apiId: 'wpx***',
  apiKeyLength: 32,
  hasApiId: true,
  hasApiKey: true
}
```

**If you see**:
- `apiId: 'MISSING'` → API ID not in .env.local
- `apiKeyLength: 0` → API Key not in .env.local
- `hasApiId: false` → Environment variable not loaded

## 🎯 Next Steps

### Step 1: Verify Credentials with Hubtel
**MOST IMPORTANT**: Contact Hubtel to confirm:
- ✅ Credentials are correct
- ✅ Online Checkout is activated
- ✅ Correct API endpoint
- ✅ Correct authentication method

### Step 2: Update .env.local
Once you have the correct credentials:
```env
# Use whatever format Hubtel confirms
NEXT_PUBLIC_HUBTEL_API_ID=correct_api_id
HUBTEL_API_KEY=correct_api_key
NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=correct_merchant_account
```

### Step 3: Restart Server
```bash
npm run dev
```

### Step 4: Test Again
Try the payment and check terminal logs for:
```
🔐 Auth Debug: { apiId: 'cor***', apiKeyLength: XX, ... }
📡 Hubtel API response status: 200 OK  ← Should be 200, not 401
```

## 📋 Checklist

Before contacting Hubtel, gather this information:

- [ ] Your Hubtel account email/username
- [ ] Your merchant account number: `3740971`
- [ ] The API endpoint you're trying to use
- [ ] The error message: "401 Unauthorized"
- [ ] What you're trying to do: "Initialize Online Checkout payment"
- [ ] Your current API ID: `wpxJW1`

## 🚨 BOTTOM LINE

**The credentials are being rejected by Hubtel's API.**

This is **NOT a code issue** - it's a **credentials/account configuration issue** that only Hubtel can resolve.

**You MUST contact Hubtel support to**:
1. Verify the credentials are correct
2. Confirm Online Checkout is activated
3. Get the correct API endpoint
4. Ensure your account has the right permissions

---

**Once you have the correct credentials from Hubtel, update `.env.local` and restart the server. The code is ready and will work as soon as the credentials are correct.**

---

**Last Updated**: October 23, 2025
