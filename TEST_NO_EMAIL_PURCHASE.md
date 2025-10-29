# 🧪 Test: Purchase Ticket Without Email

## Quick Test Instructions

### 1. **Open Browser Developer Tools**
- Press `F12` or right-click → Inspect
- Go to **Console** tab
- Keep it open during the test

### 2. **Navigate to Tickets Page**
- Go to `http://localhost:3000/tickets`
- Click "Purchase Ticket" on any available ticket

### 3. **Fill Form (NO EMAIL)**
```
Name: Test User
Phone: 0244093821
Email: (LEAVE EMPTY)
Quantity: 1
```

### 4. **Click "Pay Now"**
- Should NOT show validation error
- Should open Paystack popup

### 5. **Check Console Logs**
You should see these logs:
```
🎫 Starting purchase process...
📝 Form data: {
  selectedTicket: true,
  name: "Test User", 
  email: "EMPTY",
  phone: "0244093821"
}
✅ Basic validation passed
✅ Phone validation passed for: 0244093821
🚀 Initializing Paystack payment with reference: TKT...
📋 Customer form data: {
  name: "Test User",
  email: "NONE PROVIDED",
  phone: "0244093821", 
  tempEmail: "customer44093821@hotel734.temp"
}
📧 Using email for Paystack popup: customer44093821@hotel734.temp
📱 Customer phone for SMS receipts: 0244093821
🚀 Opening Paystack popup
```

### 6. **Paystack Popup Should Open**
- Should show temporary email: `customer44093821@hotel734.temp`
- Should process payment normally
- Should send SMS receipt to your phone

## ❌ If It Still Fails

### Check These:

1. **Console Errors**
   - Look for red error messages
   - Share the exact error text

2. **Network Tab**
   - Check if `/api/payments/initialize` call fails
   - Look at the response

3. **Phone Format**
   - Try: `+233244093821`
   - Try: `233244093821`
   - Try: `0244093821`

4. **Environment Variables**
   - Ensure `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is set
   - Restart server after adding env vars

## ✅ Expected Success Flow

1. **Form validates** ✅
2. **Payment initializes** ✅  
3. **Paystack popup opens** ✅
4. **Payment processes** ✅
5. **SMS receipt received** ✅

## 📞 SMS Receipt Troubleshooting

If payment works but no SMS receipt:

1. **Check Paystack Dashboard**
   - Login to your Paystack account
   - Go to Settings → Preferences
   - Ensure "SMS Receipts" is enabled

2. **Verify Phone Format**
   - Must be international format for SMS
   - Ghana: +233 or 233 prefix

3. **Check Transaction Logs**
   - In Paystack dashboard
   - Look for customer phone number
   - Verify SMS was attempted

4. **Network Delay**
   - SMS can take 1-5 minutes
   - Check your phone again

## 🔧 Quick Fixes

### If validation still fails:
```javascript
// Check this in browser console:
console.log('Phone regex test:', /^[\+]?[0-9\s\-\(\)]{8,}$/.test('0244093821'));
// Should return: true
```

### If Paystack popup doesn't open:
```javascript
// Check this in browser console:
console.log('Paystack key:', process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY);
// Should show your public key
```

## 📋 Test Results

After testing, report:
- [ ] Form validation passes without email
- [ ] Paystack popup opens
- [ ] Payment processes successfully  
- [ ] SMS receipt received
- [ ] Any error messages seen

## 🆘 Need Help?

If still not working, share:
1. **Console logs** (copy/paste the text)
2. **Error messages** (exact text)
3. **Phone format** you used
4. **Browser** you're using

The system should now work perfectly without email! 🎉
