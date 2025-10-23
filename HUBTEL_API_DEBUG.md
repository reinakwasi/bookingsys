# 🔍 Hubtel API Debugging Guide

## Current Error Analysis

You're getting:
```
❌ API Error Response: {"success":false,"error":"Unexpected end of JSON input"}
Payment initialization failed: 400 Bad Request
```

This means the **Hubtel API is not returning valid JSON**. This usually happens when:
1. ❌ **API credentials are incorrect**
2. ❌ **API endpoint is unreachable**
3. ❌ **Request format is invalid**
4. ❌ **Hubtel API is having issues**

## ✅ What I've Fixed

I've added comprehensive error handling that will now show you:
- The exact HTTP status code from Hubtel
- The raw response text (before JSON parsing)
- Detailed error messages

## 🧪 Next Steps - Restart and Test

### Step 1: Restart Your Server
```bash
# Press Ctrl+C to stop
npm run dev
```

### Step 2: Try Payment Again

When you click "Pay Now", check your **terminal** (where npm run dev is running) for these messages:

**What you should see**:
```
💳 Payment initialization request received
📋 Request data: { amount: 100, description: '...', ... }
🚀 Initializing Hubtel payment...
📤 Sending to Hubtel: { totalAmount: 100, description: '...', ... }
📡 Hubtel API response status: 200 OK
📥 Raw Hubtel response: {"responseCode":"0000","status":"Success",...}
📥 Parsed Hubtel response: { responseCode: '0000', ... }
✅ Hubtel payment initialized successfully
```

**If there's an error, you'll see**:
```
📡 Hubtel API response status: 401 Unauthorized
❌ Hubtel API error response: {"error":"Invalid credentials"}
❌ Response status: 401 Unauthorized
```

OR

```
📡 Hubtel API response status: 200 OK
📥 Raw Hubtel response: (empty or invalid JSON)
❌ Failed to parse Hubtel response as JSON: SyntaxError: Unexpected end of JSON input
```

## 🔍 Possible Issues & Solutions

### Issue 1: Invalid Credentials (401 Unauthorized)

**Error Message**:
```
Hubtel API error: 401 Unauthorized
```

**Cause**: API ID or API Key is incorrect

**Solution**:
1. Double-check your `.env.local`:
   ```env
   NEXT_PUBLIC_HUBTEL_API_ID=wpxJW1
   HUBTEL_API_KEY=c7e83f5a4cd6451a90515f7e14a61ca8
   ```
2. Make sure there are no extra spaces or quotes
3. Restart server

---

### Issue 2: Invalid Merchant Account (400 Bad Request)

**Error Message**:
```
Hubtel API error: 400 Bad Request
Details: Invalid merchant account number
```

**Cause**: Merchant Account Number is incorrect

**Solution**:
1. Verify in `.env.local`:
   ```env
   NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=3740971
   ```
2. Make sure it's the correct POS Sales ID
3. Restart server

---

### Issue 3: Network/Connection Error

**Error Message**:
```
Failed to parse Hubtel response as JSON
```

**Cause**: Can't reach Hubtel API or network issues

**Solution**:
1. Check your internet connection
2. Try accessing https://payproxyapi.hubtel.com in your browser
3. Check if there's a firewall blocking the request

---

### Issue 4: Empty Response

**Error Message**:
```
Hubtel returned an empty response
```

**Cause**: Hubtel API returned nothing

**Solution**:
1. This might be a temporary Hubtel API issue
2. Wait a few minutes and try again
3. Check Hubtel status page or contact support

---

## 🧪 Test Hubtel API Directly

You can test if your credentials work by making a direct API call:

### Using PowerShell (Windows):
```powershell
$apiId = "wpxJW1"
$apiKey = "c7e83f5a4cd6451a90515f7e14a61ca8"
$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${apiId}:${apiKey}"))

$headers = @{
    "Authorization" = "Basic $credentials"
    "Content-Type" = "application/json"
}

$body = @{
    totalAmount = 10
    description = "Test Payment"
    callbackUrl = "http://localhost:3000/api/payments/hubtel/callback"
    returnUrl = "http://localhost:3000/tickets"
    merchantAccountNumber = "3740971"
    cancellationUrl = "http://localhost:3000/tickets"
    clientReference = "TEST_" + (Get-Date -Format "yyyyMMddHHmmss")
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://payproxyapi.hubtel.com/items/initiate" -Method POST -Headers $headers -Body $body
```

### Using curl (Mac/Linux):
```bash
curl -X POST https://payproxyapi.hubtel.com/items/initiate \
  -H "Authorization: Basic $(echo -n 'wpxJW1:c7e83f5a4cd6451a90515f7e14a61ca8' | base64)" \
  -H "Content-Type: application/json" \
  -d '{
    "totalAmount": 10,
    "description": "Test Payment",
    "callbackUrl": "http://localhost:3000/api/payments/hubtel/callback",
    "returnUrl": "http://localhost:3000/tickets",
    "merchantAccountNumber": "3740971",
    "cancellationUrl": "http://localhost:3000/tickets",
    "clientReference": "TEST_123"
  }'
```

**Expected Success Response**:
```json
{
  "responseCode": "0000",
  "status": "Success",
  "data": {
    "checkoutUrl": "https://pay.hubtel.com/...",
    "checkoutId": "...",
    "clientReference": "TEST_123",
    "checkoutDirectUrl": "https://pay.hubtel.com/.../direct"
  }
}
```

**If you get an error**, the response will tell you what's wrong:
```json
{
  "responseCode": "4000",
  "status": "Failed",
  "message": "Invalid credentials"
}
```

---

## 📊 What the Logs Mean

### Server Logs (Terminal):

| Log Message | Meaning |
|------------|---------|
| `🚀 Initializing Hubtel payment` | Starting payment process |
| `📤 Sending to Hubtel` | Request being sent to Hubtel |
| `📡 Hubtel API response status: 200 OK` | Hubtel received request successfully |
| `📥 Raw Hubtel response` | Actual text from Hubtel (before parsing) |
| `📥 Parsed Hubtel response` | Successfully parsed JSON |
| `✅ Hubtel payment initialized successfully` | Everything worked! |
| `❌ Hubtel API error response` | Hubtel returned an error |
| `❌ Failed to parse Hubtel response` | Response is not valid JSON |

---

## 🆘 Still Having Issues?

After restarting the server and trying again, **copy the entire terminal output** and share it. Look for:

1. **The request being sent**:
   ```
   📤 Sending to Hubtel: { ... }
   ```

2. **The response status**:
   ```
   📡 Hubtel API response status: XXX
   ```

3. **The raw response**:
   ```
   📥 Raw Hubtel response: ...
   ```

4. **Any error messages**:
   ```
   ❌ Hubtel API error response: ...
   ```

This will tell us exactly what Hubtel is saying!

---

## 🔐 Verify Your Credentials

Your credentials should be:
- **API ID**: `wpxJW1`
- **API Key**: `c7e83f5a4cd6451a90515f7e14a61ca8`
- **Merchant Account**: `3740971`

If any of these are different, update them in `.env.local` and restart the server.

---

**Last Updated**: October 23, 2025
