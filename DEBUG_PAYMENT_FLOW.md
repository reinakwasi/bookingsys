# 🔧 Payment Flow Debug Guide

## Issues You Reported:
1. **Ticket purchase fails without email address** - Should work with phone only
2. **No Paystack SMS receipts received** - Should get SMS receipt from Paystack

## 🔍 Debug Steps

### Step 1: Check Browser Console
Open browser developer tools (F12) and look for these logs when purchasing without email:

```
✅ Phone validation passed for: [your_phone]
📋 Customer form data: {
  name: "Your Name",
  email: "NONE PROVIDED", 
  phone: "your_phone",
  tempEmail: "customer12345678@hotel734.temp"
}
🚀 Initializing Paystack payment with reference: TKT...
📧 Using email for Paystack popup: customer12345678@hotel734.temp
📱 Customer phone for SMS receipts: your_phone
```

### Step 2: Check Network Tab
1. Open Network tab in browser dev tools
2. Try purchasing without email
3. Look for `/api/payments/initialize` request
4. Check if it returns success or error

### Step 3: Check Paystack Configuration
Verify these environment variables exist:
```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
```

### Step 4: Test Phone Validation
Try these phone formats to see which works:
- `0244093821` (Ghana format)
- `+233244093821` (International)
- `233244093821` (Without +)

## 🛠️ Fixes Applied

### 1. **Form Validation Fixed**
- **Before**: Required both name AND email
- **After**: Requires only name AND phone
- **Email**: Now optional with proper validation

### 2. **Paystack Integration Fixed**
- **Before**: Used `customerForm.email` directly (failed if empty)
- **After**: Uses temporary email if none provided
- **Customer Object**: Added for SMS receipts

### 3. **Temporary Email Generation**
- **Format**: `customer{last8digits}@hotel734.temp`
- **Example**: `customer93821@hotel734.temp`
- **Purpose**: Satisfies Paystack email requirement

### 4. **SMS Receipt Configuration**
Added customer object to both:
- **Server-side** payment initialization
- **Client-side** Paystack popup

## 🧪 Test Scenarios

### Test 1: Phone Only (Should Work)
1. Fill form:
   - Name: "John Doe"
   - Phone: "0244093821"
   - Email: (leave empty)
2. Click "Pay Now"
3. **Expected**: Paystack popup opens with temp email
4. **Expected**: SMS receipt sent to phone

### Test 2: Phone + Email (Should Work)
1. Fill form:
   - Name: "John Doe"  
   - Phone: "0244093821"
   - Email: "john@example.com"
2. Click "Pay Now"
3. **Expected**: Paystack popup opens with real email
4. **Expected**: Both email and SMS receipts

## 🚨 Common Issues & Solutions

### Issue: "Please fill in all required fields"
**Cause**: Phone validation failing
**Solution**: 
- Use format: `0244093821` or `+233244093821`
- Must be at least 8 digits
- Can include spaces, dashes, parentheses

### Issue: "Please enter a valid phone number"
**Cause**: Phone doesn't match regex pattern
**Solution**: 
- Remove special characters except +, -, (), spaces
- Ensure at least 8 digits total

### Issue: Payment popup doesn't open
**Cause**: Paystack configuration missing
**Solution**:
1. Check environment variables
2. Check browser console for errors
3. Verify Paystack public key

### Issue: No SMS receipt from Paystack
**Possible Causes**:
1. **Paystack Account**: SMS receipts not enabled
2. **Phone Format**: Wrong international format
3. **Customer Object**: Not properly configured
4. **Network**: SMS delivery delayed

## 🔧 Advanced Debugging

### Check Paystack Request Body
Look for this in browser Network tab:
```json
{
  "email": "customer93821@hotel734.temp",
  "amount": 5000,
  "currency": "GHS",
  "customer": {
    "email": "customer93821@hotel734.temp",
    "phone": "0244093821",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Check Server Logs
Look for these in terminal:
```
📱 Customer object for SMS receipts: {
  phone: "0244093821",
  email: "customer93821@hotel734.temp", 
  name: "John Doe"
}
```

## 📞 Paystack SMS Receipt Requirements

### Account Settings
1. **Login to Paystack Dashboard**
2. **Go to Settings > Preferences**
3. **Check "SMS Receipts" is enabled**
4. **Verify supported countries include Ghana**

### Customer Object Requirements
- **phone**: Must be international format
- **email**: Required (we use temp email)
- **first_name**: Required
- **last_name**: Optional but recommended

## 🎯 Expected Results

### Without Email:
- ✅ Form validation passes
- ✅ Paystack popup opens
- ✅ Payment processes successfully
- ✅ SMS receipt from Paystack
- ✅ SMS notification from Hotel 734

### With Email:
- ✅ Form validation passes
- ✅ Paystack popup opens
- ✅ Payment processes successfully
- ✅ Email receipt from Paystack
- ✅ SMS receipt from Paystack
- ✅ Email notification from Hotel 734
- ✅ SMS notification from Hotel 734

## 🆘 If Still Not Working

### 1. Check Paystack Account
- Login to dashboard
- Verify SMS receipts are enabled
- Check transaction logs

### 2. Test with Different Phone
- Try different phone number
- Try different format (+233 vs 0)

### 3. Contact Paystack Support
- Ask about SMS receipt configuration
- Verify account supports Ghana SMS

### 4. Check Browser Console
- Look for JavaScript errors
- Check network requests
- Verify all API calls succeed

## 📋 Checklist

Before testing, ensure:
- [ ] Environment variables set
- [ ] Server restarted after changes
- [ ] Browser cache cleared
- [ ] Developer tools open
- [ ] Phone number in correct format
- [ ] Paystack account configured for SMS

## 🔄 Next Steps

1. **Test without email** - should work now
2. **Check browser console** for detailed logs
3. **Verify Paystack SMS settings** in dashboard
4. **Contact Paystack** if SMS still not working
5. **Report specific error messages** if any issues persist

The system is now properly configured to work without email and send SMS receipts. If you're still experiencing issues, please share the exact error messages from the browser console.
