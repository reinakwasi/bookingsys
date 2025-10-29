# 🚨 Troubleshooting 400 Bad Request Error

## Quick Diagnosis Steps

### 1. **Check Server Console Logs**
Look at your terminal/server console for these logs:
```
💳 Payment initialization request received
📋 Request data: { amount: 50, email: "customer...", ... }
🔍 Validation check: { hasAmount: true, hasEmail: true, ... }
🔧 Checking Paystack configuration...
📋 Config validation result: { isValid: false, issues: [...] }
```

### 2. **Test Debug Endpoint**
Visit: `http://localhost:3000/api/debug/paystack`

This will show you:
- Environment variables status
- Paystack configuration validation
- What's missing

### 3. **Check Environment Variables**
Create/check your `.env.local` file:
```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. **Restart Server**
After adding environment variables:
```bash
# Stop server (Ctrl+C)
# Then restart
npm run dev
```

## Common Causes of 400 Error

### 1. **Missing Paystack Keys** (Most Likely)
**Error**: "Paystack not configured: PAYSTACK_SECRET_KEY is not configured"
**Solution**: Add both keys to `.env.local`

### 2. **Missing Site URL**
**Error**: Various callback URL issues
**Solution**: Add `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

### 3. **Invalid Request Data**
**Error**: "Amount is required"
**Solution**: Check form data is being sent correctly

## Step-by-Step Fix

### Step 1: Create `.env.local`
In your project root (`d:\Projects\734\bookingsys\`):
```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
PAYSTACK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 2: Get Paystack Keys
1. Login to [Paystack Dashboard](https://dashboard.paystack.com)
2. Go to Settings → API Keys & Webhooks
3. Copy your Test keys (pk_test_... and sk_test_...)

### Step 3: Restart Server
```bash
npm run dev
```

### Step 4: Test Debug Endpoint
Visit: `http://localhost:3000/api/debug/paystack`

Should show:
```json
{
  "success": true,
  "environment": {
    "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY": true,
    "PAYSTACK_SECRET_KEY": true,
    "NEXT_PUBLIC_SITE_URL": true
  },
  "validation": {
    "isValid": true,
    "issues": []
  }
}
```

### Step 5: Test Payment
Try purchasing a ticket again.

## Expected Server Logs (Success)

```
💳 Payment initialization request received
📋 Request data: { amount: 50, email: "customer12345678@hotel734.temp", customerName: "Test User", customerPhone: "0244093821" }
🔍 Validation check: { hasAmount: true, hasEmail: true, hasCustomerName: true, hasCustomerPhone: true }
🔧 Checking Paystack configuration...
📋 Config validation result: { isValid: true, issues: [] }
✅ Paystack configuration valid
🚀 Initializing Paystack payment...
📤 Payment data being sent to Paystack: { amount: 50, email: "customer12345678@hotel734.temp", ... }
📱 Customer object for SMS receipts: { phone: "0244093821", email: "customer12345678@hotel734.temp", name: "Test User" }
📥 Paystack service result: { success: true, data: { authorization_url: "...", access_code: "...", reference: "..." } }
✅ Paystack payment initialized successfully
```

## If Still Getting 400 Error

### Check These:

1. **Environment File Location**
   - Must be in project root: `d:\Projects\734\bookingsys\.env.local`
   - Not in subdirectory

2. **Environment File Format**
   - No spaces around `=`
   - No quotes around values
   - Each variable on new line

3. **Server Restart**
   - Must restart after adding env vars
   - Stop with Ctrl+C, then `npm run dev`

4. **Paystack Account**
   - Using test keys (pk_test_... and sk_test_...)
   - Account is active and verified

## Quick Test Commands

```bash
# Check if env file exists
ls -la .env.local

# Check server logs
# Look at terminal where you ran npm run dev

# Test debug endpoint
curl http://localhost:3000/api/debug/paystack
```

## Get Help

If still not working, share:
1. **Debug endpoint response**: Visit `/api/debug/paystack` and copy the JSON
2. **Server console logs**: Copy the logs from terminal
3. **Environment file**: Confirm you have `.env.local` with the keys

The 400 error is almost certainly due to missing Paystack environment variables! 🔑
