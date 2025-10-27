# Paystack Currency Configuration Guide

## ⚠️ IMPORTANT: Currency Not Supported Error

If you're seeing **"Currency not supported by merchant"** error, it means your Paystack account doesn't support the currency you're trying to use.

## 🔍 Check Your Paystack Account Currency

### Step 1: Login to Paystack Dashboard
1. Go to https://dashboard.paystack.com/
2. Login to your account

### Step 2: Check Your Business Country
1. Go to **Settings** → **Business**
2. Look for **"Business Country"** or **"Settlement Currency"**
3. Note which currency your account uses:
   - **Nigeria** → NGN (Nigerian Naira)
   - **Ghana** → GHS (Ghana Cedis)
   - **South Africa** → ZAR (South African Rand)
   - **Kenya** → KES (Kenyan Shilling)

## 🛠️ Configure Your Application

### Current Configuration
The application is currently set to **NGN (Nigerian Naira)**.

### If Your Account is Nigerian (NGN)
✅ **No changes needed!** The code is already configured for NGN.

### If Your Account is Ghanaian (GHS)
You need to change the currency in 2 files:

#### 1. Update `/lib/paystack.ts` (Line 113)
```typescript
currency: 'GHS', // Change from 'NGN' to 'GHS'
```

#### 2. Update `/app/tickets/page.tsx` (Line 256)
```typescript
currency: 'GHS', // Change from 'NGN' to 'GHS'
```

### If Your Account is South African (ZAR)
Change both files to:
```typescript
currency: 'ZAR',
```

### If Your Account is Kenyan (KES)
Change both files to:
```typescript
currency: 'KES',
```

## 💰 Currency Conversion

### Amount Calculation
Paystack uses the **smallest currency unit**:

- **NGN**: 1 Naira = 100 Kobo
- **GHS**: 1 Cedi = 100 Pesewas
- **ZAR**: 1 Rand = 100 Cents
- **KES**: 1 Shilling = 100 Cents

**Example**: 
- To charge ₦50.00 (NGN), send `5000` (50 × 100)
- To charge GH₵50.00 (GHS), send `5000` (50 × 100)

The code already handles this conversion:
```typescript
amount: Math.round(selectedTicket.price * quantity * 100)
```

## 🧪 Test Cards by Currency

### Nigerian Naira (NGN)
```
Card: 4084084084084081
CVV: 408
Expiry: Any future date
PIN: 0000
OTP: 123456
```

### Ghana Cedis (GHS)
```
Card: 4084084084084081
CVV: 408
Expiry: Any future date
PIN: 0000
OTP: 123456
```

### All Currencies (Declined)
```
Card: 5060666666666666666
CVV: 123
Expiry: Any future date
```

## 🔄 After Changing Currency

1. **Save the files**
2. **Restart your dev server**:
   ```bash
   npm run dev
   ```
3. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
4. **Test payment** at http://localhost:3000/tickets

## ❓ How to Check Which Currency to Use

### Method 1: Check Paystack Dashboard
1. Login to https://dashboard.paystack.com/
2. Go to **Settings** → **Business**
3. Look for your business country

### Method 2: Check Your Test Keys
Your test keys indicate your country:
- Nigerian accounts: Keys work with NGN
- Ghanaian accounts: Keys work with GHS

### Method 3: Try a Test Transaction
1. Use the current NGN configuration
2. If you get "Currency not supported", switch to GHS
3. If GHS also fails, check your Paystack dashboard

## 🌍 Multi-Currency Support

If you want to support multiple currencies, you would need to:
1. Create separate Paystack accounts for each country
2. Use different API keys based on customer location
3. Implement currency detection and switching

**Note**: This is advanced and not currently implemented.

## 📋 Quick Fix Checklist

- [ ] Check Paystack dashboard for business country
- [ ] Note your settlement currency (NGN, GHS, ZAR, KES)
- [ ] Update currency in `/lib/paystack.ts`
- [ ] Update currency in `/app/tickets/page.tsx`
- [ ] Restart dev server
- [ ] Clear browser cache
- [ ] Test with appropriate test card

## 🆘 Still Having Issues?

### Error: "Currency not supported by merchant"
- Your Paystack account doesn't support the currency you're using
- Double-check your business country in Paystack dashboard
- Make sure both files use the same currency

### Error: "Invalid key"
- Check your `.env.local` has correct Paystack keys
- Make sure you're using test keys (pk_test_, sk_test_)
- Verify keys are from the same Paystack account

### Popup doesn't open
- Check browser console for errors
- Verify Paystack script is loading
- Check CSP headers in middleware.ts

---

**Current Status**: Application configured for **NGN (Nigerian Naira)**

**To switch to GHS**: Change currency in both files mentioned above and restart server.
