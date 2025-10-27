# Payment Verification Troubleshooting Guide

## Current Issue: Empty Object {} Error

You're seeing this error:
```
❌ Payment verification failed: {}
```

This indicates the verification API is returning an empty object instead of a proper response.

## Debugging Steps

### Step 1: Check Server Logs
1. Open your development server console
2. Look for these log messages when the error occurs:
   - `🔍 Payment verification request received`
   - `🔍 Verifying transaction: [reference]`
   - `📋 Hubtel service returned: [result]`

### Step 2: Test Debug Endpoint
1. Open browser and go to: `http://localhost:3000/api/debug/verify?reference=TEST_123`
2. This will show you exactly what's happening in the verification process
3. Look for configuration errors or Hubtel API issues

### Step 3: Run Test Script
1. Open terminal in project directory
2. Run: `node test-verification.js`
3. This will test all verification endpoints and show detailed results

### Step 4: Check Environment Variables
Make sure these are set in your `.env.local`:
```env
NEXT_PUBLIC_HUBTEL_API_ID=your_api_id
HUBTEL_API_KEY=your_api_key
NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=your_merchant_account
```

## Common Causes & Solutions

### 1. Missing Environment Variables
**Symptoms**: Configuration error in logs
**Solution**: Add missing variables to `.env.local` and restart server

### 2. IP Not Whitelisted (Most Likely)
**Symptoms**: 
- HTML response instead of JSON
- `IP_NOT_WHITELISTED` response code
- 403 Forbidden errors

**Solution**: Contact Hubtel support to whitelist your server IP

### 3. Invalid Hubtel Credentials
**Symptoms**: 401 Unauthorized errors
**Solution**: Verify your API ID and API Key are correct

### 4. Network/Firewall Issues
**Symptoms**: Connection timeouts or network errors
**Solution**: Check firewall settings and internet connection

### 5. Malformed API Response
**Symptoms**: JSON parsing errors
**Solution**: Check Hubtel API status and response format

## Expected Verification Flow

### Successful Verification:
```json
{
  "success": true,
  "data": {
    "status": "Paid",
    "amount": 50.00,
    "paymentMethod": "mobile_money",
    "transactionId": "...",
    "clientReference": "..."
  },
  "status": "Paid",
  "isPaid": true
}
```

### IP Not Whitelisted:
```json
{
  "success": false,
  "error": "Payment verification failed: Server IP not whitelisted with Hubtel",
  "responseCode": "IP_NOT_WHITELISTED",
  "isPaid": false,
  "note": "Contact Hubtel support to whitelist your server IP address for payment verification."
}
```

### Configuration Error:
```json
{
  "success": false,
  "error": "Hubtel not configured: HUBTEL_API_KEY is not configured",
  "isPaid": false,
  "responseCode": "CONFIG_ERROR"
}
```

## Debugging Commands

### Check Environment Variables:
```bash
# In your terminal
echo $NEXT_PUBLIC_HUBTEL_API_ID
echo $NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT
# Note: Don't echo HUBTEL_API_KEY for security
```

### Test API Endpoints:
```bash
# Test debug endpoint
curl "http://localhost:3000/api/debug/verify?reference=TEST_123"

# Test real verification
curl -X POST "http://localhost:3000/api/payments/verify" \
  -H "Content-Type: application/json" \
  -d '{"reference":"TEST_123"}'
```

### Check Server Logs:
Look for these patterns in your console:
- ✅ Success: `✅ Payment verified:`
- ❌ Config Error: `❌ Hubtel configuration error:`
- ❌ IP Issue: `❌ IP not whitelisted`
- ❌ API Error: `❌ Payment verification failed:`

## Next Steps

1. **Run the debug endpoint** to see what's actually happening
2. **Check your environment variables** are properly set
3. **Contact Hubtel support** if IP whitelisting is needed
4. **Review server logs** for specific error messages

## Contact Hubtel Support

If you need IP whitelisting:
- **Email**: Hubtel support email
- **Request**: "Please whitelist IP address [YOUR_IP] for Transaction Status Check API"
- **Provide**: Your merchant account number and API credentials

## Files to Check

- `.env.local` - Environment variables
- `app/api/payments/verify/route.ts` - Main verification endpoint
- `lib/hubtel.ts` - Hubtel service implementation
- Server console logs - Error messages and debugging info

The empty object `{}` error usually indicates either a configuration issue or IP whitelisting problem. Use the debug tools above to identify the exact cause.
