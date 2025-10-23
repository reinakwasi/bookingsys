# Troubleshooting Guide - Hubtel Payment Integration

## Common Errors and Solutions

### 1. "Unexpected end of JSON input"

**Error Location**: `app\tickets\page.tsx:150`

**Cause**: The API route is not returning valid JSON, usually because:
- The API route crashed before sending a response
- The Hubtel API call failed
- Environment variables are not set correctly

**Solution**:

1. **Check your terminal/server logs** for detailed error messages
2. **Verify environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_HUBTEL_API_ID=wpxJW1
   HUBTEL_API_KEY=c7e83f5a4cd6451a90515f7e14a61ca8
   NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=3740971
   ```
3. **Restart your development server** after adding/changing environment variables
4. **Check browser console** for the actual API error:
   - Look for "📡 API Response status"
   - Look for "❌ API Error Response"

**Debug Steps**:
```bash
# 1. Stop your server (Ctrl+C)
# 2. Verify .env.local exists and has correct values
# 3. Restart server
npm run dev
# 4. Try payment again and check BOTH browser console AND terminal logs
```

---

### 2. "HUBTEL_API_KEY is not configured" (in browser console)

**Status**: ✅ **This is NORMAL and EXPECTED**

**Explanation**: The API key is server-side only and won't be accessible from the browser. This is a security feature.

**What you should see**:
```
💳 Checking Hubtel configuration...
✅ Hubtel client configuration is properly set
```

**If you see an error about missing public variables**:
```
❌ Hubtel configuration issues: ["NEXT_PUBLIC_HUBTEL_API_ID is not configured"]
```

Then check your `.env.local` file and restart the server.

---

### 3. Payment initialization fails

**Symptoms**:
- Error when clicking "Pay Now"
- "Payment initialization failed" message
- API returns error response

**Check These**:

#### A. Server Logs (Terminal)
Look for these messages in your terminal:
```
💳 Payment initialization request received
📋 Request data: { amount: 100, description: '...', metadata: {...} }
🚀 Initializing Hubtel payment...
```

If you see:
```
❌ Hubtel configuration error: ["HUBTEL_API_KEY is not configured"]
```

**Solution**: Add `HUBTEL_API_KEY` to `.env.local` and restart server.

#### B. Browser Console
Look for these messages:
```
🚀 Initializing Hubtel payment with reference: HTL734_TKT_...
📡 API Response status: 200 OK
📋 Parsed API response: { success: true, ... }
```

If you see:
```
📡 API Response status: 500 Internal Server Error
❌ API Error Response: {...}
```

Check the error details and server logs for more information.

---

### 4. Hubtel API returns error

**Common Hubtel Error Codes**:

| Code | Description | Solution |
|------|-------------|----------|
| 0005 | HTTP failure/exception | Retry or check network connection |
| 2001 | Transaction failed | Check account limits, balance, or permissions |
| 4000 | Validation error | Check request parameters (amount, description, etc.) |
| 4070 | Fees not set | Contact Hubtel support to set up fees |

**Debug Steps**:
1. Check server logs for Hubtel API response
2. Look for "❌ Hubtel initialization failed" message
3. Check the error code and message
4. Verify your Hubtel credentials are correct

---

### 5. Iframe not opening

**Symptoms**:
- Payment initializes successfully
- But Hubtel checkout doesn't appear

**Possible Causes**:
1. **Popup blocker**: Browser is blocking the iframe
2. **checkoutDirectUrl missing**: API didn't return the URL
3. **JavaScript error**: Check browser console for errors

**Solutions**:
1. **Check browser console** for errors
2. **Disable popup blockers** for localhost
3. **Verify API response** includes `checkoutDirectUrl`:
   ```javascript
   {
     success: true,
     checkoutDirectUrl: "https://pay.hubtel.com/.../direct"
   }
   ```

---

### 6. Payment not verifying

**Symptoms**:
- Payment completes in Hubtel
- But success message doesn't appear
- Iframe doesn't close

**Debug Steps**:

1. **Check polling logs** in browser console:
   ```
   🔍 Checking transaction status for: HTL734_TKT_...
   ```

2. **Check verification response**:
   ```
   📋 Payment verification response: { success: true, isPaid: true, ... }
   ```

3. **Verify client reference** is correct:
   - Should match the one used for initialization
   - Format: `HTL734_TKT_{ticket_id}_{timestamp}_{random}`

**Common Issues**:
- **Wrong client reference**: Make sure you're using the same reference
- **Payment not completed**: User cancelled or payment failed
- **API key issues**: Check server logs for authentication errors

---

## Debugging Checklist

When payment fails, check these in order:

### 1. Environment Variables ✅
```bash
# Check .env.local exists
ls -la .env.local  # Mac/Linux
dir .env.local     # Windows

# Verify contents (don't share these publicly!)
cat .env.local     # Mac/Linux
type .env.local    # Windows
```

Should contain:
- ✅ `NEXT_PUBLIC_HUBTEL_API_ID=wpxJW1`
- ✅ `HUBTEL_API_KEY=c7e83f5a4cd6451a90515f7e14a61ca8`
- ✅ `NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=3740971`

### 2. Server Running ✅
```bash
# Make sure dev server is running
npm run dev
```

### 3. Browser Console ✅
Open browser DevTools (F12) and check:
- ✅ No JavaScript errors
- ✅ "Hubtel client configuration is properly set" message
- ✅ API responses are successful

### 4. Server Logs ✅
Check terminal for:
- ✅ "Payment initialization request received"
- ✅ "Hubtel payment initialized successfully"
- ✅ No error messages

### 5. Network Tab ✅
In browser DevTools → Network tab:
- ✅ `/api/payments/initialize` returns 200 OK
- ✅ Response has `checkoutDirectUrl`
- ✅ No 500 or 400 errors

---

## Getting More Help

### Check Logs

**Browser Console**:
```
F12 → Console tab
Look for messages with these emojis: 💳 🚀 📡 ✅ ❌
```

**Server Logs**:
```
Check your terminal where npm run dev is running
Look for colored messages and error stacks
```

### Enable Verbose Logging

The code already has comprehensive logging. Just check:
1. **Browser console** (F12)
2. **Terminal/server logs**

### Test API Directly

You can test the API route directly:

```bash
# Using curl (Mac/Linux)
curl -X POST http://localhost:3000/api/payments/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "description": "Test Payment",
    "metadata": {
      "customer_name": "Test User",
      "customer_email": "test@example.com",
      "customer_phone": "0241234567"
    }
  }'

# Using PowerShell (Windows)
Invoke-RestMethod -Uri "http://localhost:3000/api/payments/initialize" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"amount":10,"description":"Test Payment","metadata":{"customer_name":"Test User"}}'
```

Expected response:
```json
{
  "success": true,
  "checkoutUrl": "https://pay.hubtel.com/...",
  "checkoutDirectUrl": "https://pay.hubtel.com/.../direct",
  "checkoutId": "...",
  "clientReference": "HTL734_..."
}
```

---

## Still Having Issues?

1. **Double-check environment variables** - Most common issue!
2. **Restart development server** - Required after env changes
3. **Check both browser AND server logs** - Errors might be in either place
4. **Verify Hubtel credentials** - Make sure API ID, Key, and Merchant Account are correct
5. **Test with small amount** - Try GH₵ 1.00 first
6. **Check Hubtel dashboard** - See if transactions are appearing there

---

**Last Updated**: October 23, 2025
