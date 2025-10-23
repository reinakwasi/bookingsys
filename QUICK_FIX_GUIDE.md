# 🚨 Quick Fix Guide - "Unexpected end of JSON input" Error

## The Error You're Seeing

```
Error: Unexpected end of JSON input
at handlePurchase (app\tickets\page.tsx:150:15)
```

## What This Means

The payment API is not returning valid JSON. This usually means the API route crashed or returned an error before it could send a proper response.

## ✅ Quick Fix Steps

### Step 1: Check Your `.env.local` File

Make sure it has ALL three Hubtel variables:

```env
NEXT_PUBLIC_HUBTEL_API_ID=wpxJW1
HUBTEL_API_KEY=c7e83f5a4cd6451a90515f7e14a61ca8
NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=3740971
```

**Important**: 
- File must be named `.env.local` (with the dot at the start)
- Must be in the root folder (same level as `package.json`)
- No spaces around the `=` sign
- No quotes around the values

### Step 2: Restart Your Development Server

**This is critical!** Environment variables are only loaded when the server starts.

```bash
# Press Ctrl+C to stop the server
# Then start it again:
npm run dev
```

### Step 3: Try Payment Again

1. Go to `/tickets` page
2. Click "Purchase Ticket"
3. Fill in the form
4. Click "Pay Now"

### Step 4: Check the Logs

Now you'll see better error messages!

**In Browser Console (F12)**:
Look for:
```
📡 API Response status: 500 Internal Server Error
❌ API Error Response: { ... }
```

**In Terminal (where npm run dev is running)**:
Look for:
```
💳 Payment initialization request received
❌ Hubtel configuration error: [...]
```

---

## Most Common Causes & Solutions

### Cause 1: Missing Environment Variables ⚠️

**Symptoms**:
- Server logs show: `❌ Hubtel configuration error: ["HUBTEL_API_KEY is not configured"]`

**Solution**:
1. Add `HUBTEL_API_KEY=c7e83f5a4cd6451a90515f7e14a61ca8` to `.env.local`
2. Restart server with `npm run dev`

---

### Cause 2: Server Not Restarted After Adding Variables ⚠️

**Symptoms**:
- You added variables but still getting errors
- Server logs still show configuration errors

**Solution**:
```bash
# Stop server (Ctrl+C)
npm run dev  # Start again
```

---

### Cause 3: Wrong File Name or Location ⚠️

**Symptoms**:
- Variables are set but not being read
- No error messages about configuration

**Solution**:
1. File must be named `.env.local` (not `env.local` or `.env`)
2. Must be in project root (same folder as `package.json`)
3. Check with:
   ```bash
   # Windows
   dir .env.local
   
   # Mac/Linux
   ls -la .env.local
   ```

---

### Cause 4: Hubtel API Error ⚠️

**Symptoms**:
- Configuration is correct
- Server logs show: `❌ Hubtel initialization failed: [error message]`

**Solution**:
Check the Hubtel error code and message. Common ones:
- **4000**: Validation error - check amount and description
- **4070**: Fees not set - contact Hubtel support
- **2001**: Transaction failed - check account limits

---

## What You Should See When It Works

### Browser Console:
```
💳 Checking Hubtel configuration...
✅ Hubtel client configuration is properly set
🚀 Initializing Hubtel payment with reference: HTL734_TKT_...
📡 API Response status: 200 OK
📋 Parsed API response: { success: true, checkoutDirectUrl: "..." }
✅ Payment initialized successfully
📱 Opening Hubtel checkout: https://pay.hubtel.com/.../direct
```

### Server Logs:
```
💳 Payment initialization request received
📋 Request data: { amount: 100, description: '...', ... }
🚀 Initializing Hubtel payment...
✅ Hubtel payment initialized successfully
📤 Sending response: { success: true, ... }
```

---

## Still Not Working?

### Double-Check Your `.env.local` File:

Open it and verify it looks EXACTLY like this:

```env
NEXT_PUBLIC_HUBTEL_API_ID=wpxJW1
HUBTEL_API_KEY=c7e83f5a4cd6451a90515f7e14a61ca8
NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=3740971
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Common mistakes**:
- ❌ Extra spaces: `HUBTEL_API_KEY = c7e83f...` (wrong)
- ✅ No spaces: `HUBTEL_API_KEY=c7e83f...` (correct)
- ❌ Quotes: `HUBTEL_API_KEY="c7e83f..."` (wrong)
- ✅ No quotes: `HUBTEL_API_KEY=c7e83f...` (correct)

### Test the API Directly:

Open a new terminal and run:

**Windows (PowerShell)**:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/payments/initialize" -Method POST -ContentType "application/json" -Body '{"amount":10,"description":"Test"}'
```

**Mac/Linux**:
```bash
curl -X POST http://localhost:3000/api/payments/initialize \
  -H "Content-Type: application/json" \
  -d '{"amount":10,"description":"Test"}'
```

**Expected response**:
```json
{
  "success": true,
  "checkoutUrl": "https://pay.hubtel.com/...",
  "checkoutDirectUrl": "https://pay.hubtel.com/.../direct"
}
```

**If you get an error**:
The response will tell you what's wrong:
```json
{
  "success": false,
  "error": "Hubtel not configured: HUBTEL_API_KEY is not configured"
}
```

---

## Need More Help?

Check these files for detailed information:
- `ENV_SETUP_GUIDE.md` - Complete environment setup guide
- `TROUBLESHOOTING.md` - Comprehensive troubleshooting guide
- `HUBTEL_SETUP.md` - Full Hubtel integration documentation

---

**TL;DR**: 
1. ✅ Add all 3 Hubtel variables to `.env.local`
2. ✅ Restart server with `npm run dev`
3. ✅ Try payment again
4. ✅ Check browser console AND server logs for specific errors
