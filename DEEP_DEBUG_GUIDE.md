# 🔍 Deep Debug Guide - 400 Error Without Email

## Issue Summary
- 400 Bad Request when trying to purchase tickets without email address
- Error: `POST https://www.hotel734.com/api/payments/initialize 400 (Bad Request)`
- Need to identify the exact root cause

## 🧪 Step-by-Step Debugging

### Step 1: Test Isolated Payment Initialization
Visit: `http://localhost:3000/test-payment`

1. Fill in:
   - Name: `Test User`
   - Phone: `0244093821`
   - Email: (LEAVE EMPTY)
2. Click "Test Payment Initialization"
3. Check browser console for detailed logs
4. Note the exact error message

### Step 2: Check Environment Variables
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

If `isValid: false`, that's your problem!

### Step 3: Check Server Console Logs
When you test without email, look for these logs in your terminal:

```
💳 Payment initialization request received
📋 Request data: { amount: 10, email: "customer93821@hotel734.com", ... }
🔍 Detailed field analysis: { ... }
🔧 Checking Paystack configuration...
📋 Config validation result: { isValid: true, issues: [] }
✅ Paystack configuration valid
🚀 Initializing Paystack payment...
📤 Payment data being sent to Paystack: { ... }
📱 Customer object for SMS receipts: { ... }
📥 Paystack service result: { ... }
```

### Step 4: Identify Where It Fails

#### If you see: `❌ Missing required field: amount`
**Problem**: Amount not being sent correctly
**Check**: Frontend form data

#### If you see: `❌ Invalid email format: ...`
**Problem**: Temporary email generation failed
**Check**: Phone number processing

#### If you see: `❌ Paystack configuration error: ...`
**Problem**: Environment variables missing
**Fix**: Add Paystack keys to `.env.local`

#### If you see: `❌ Paystack initialization failed: ...`
**Problem**: Paystack API rejection
**Check**: Paystack account settings

## 🔧 Common Root Causes & Fixes

### 1. Missing Environment Variables (Most Likely)
**Symptoms**: 
- `Config validation result: { isValid: false, issues: [...] }`
- Error: "Paystack not configured"

**Fix**:
```env
# Create/update .env.local
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
PAYSTACK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Invalid Temporary Email Format
**Symptoms**:
- `❌ Invalid email format: customer@hotel734.com`
- Phone number processing issues

**Fix**: Check phone number contains digits

### 3. Paystack Account Issues
**Symptoms**:
- Configuration valid but Paystack rejects request
- Error from Paystack API

**Fix**: Check Paystack dashboard settings

### 4. Network/CORS Issues
**Symptoms**:
- Request doesn't reach server
- No server logs appear

**Fix**: Check network tab, CORS settings

## 🧪 Test Commands

### Test 1: Environment Check
```bash
curl http://localhost:3000/api/debug/paystack
```

### Test 2: Direct API Test
```bash
curl -X POST http://localhost:3000/api/debug/paystack \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "email": "customer12345678@hotel734.com",
    "customerName": "Test User",
    "customerPhone": "0244093821",
    "metadata": {
      "reference": "TEST_123",
      "has_email": false
    }
  }'
```

### Test 3: Payment Initialization Test
```bash
curl -X POST http://localhost:3000/api/payments/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "email": "customer12345678@hotel734.com",
    "customerName": "Test User",
    "customerPhone": "0244093821",
    "metadata": {
      "reference": "TEST_123",
      "customer_name": "Test User",
      "customer_phone": "0244093821",
      "customer_email": "",
      "has_email": false
    }
  }'
```

## 📋 Debugging Checklist

### Environment Setup
- [ ] `.env.local` file exists in project root
- [ ] `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is set
- [ ] `PAYSTACK_SECRET_KEY` is set
- [ ] `NEXT_PUBLIC_SITE_URL` is set
- [ ] Server restarted after adding env vars

### API Testing
- [ ] `/api/debug/paystack` returns `isValid: true`
- [ ] Test payment page works with email
- [ ] Test payment page fails without email
- [ ] Server console shows detailed logs
- [ ] Browser console shows error details

### Form Data
- [ ] Name field has value
- [ ] Phone field has value (with digits)
- [ ] Email field is empty (for test)
- [ ] Temporary email generates correctly
- [ ] Request body contains all required fields

## 🎯 Expected Success Flow

When working correctly, you should see:

### Browser Console:
```
🎫 Starting purchase process...
📝 Form data: { name: "Test User", email: "EMPTY", phone: "0244093821" }
✅ Basic validation passed
✅ Phone validation passed for: 0244093821
🚀 Initializing Paystack payment with reference: TKT...
📋 Customer form data: { tempEmail: "customer93821@hotel734.com" }
📡 API Response status: 200 OK
✅ Payment initialized successfully
```

### Server Console:
```
💳 Payment initialization request received
📋 Request data: { amount: 10, email: "customer93821@hotel734.com", ... }
🔍 Detailed field analysis: { amount: { valid: true }, email: { valid: true }, ... }
✅ Paystack configuration valid
🚀 Initializing Paystack payment...
📱 Customer object for SMS receipts: { phone: "0244093821", ... }
✅ Paystack payment initialized successfully
```

## 🆘 If Still Failing

1. **Run the test page**: `http://localhost:3000/test-payment`
2. **Copy exact error message** from browser console
3. **Copy server logs** from terminal
4. **Check environment variables** via debug endpoint
5. **Share the specific error details**

The 400 error is definitely fixable - we just need to identify which validation is failing! 🔍
