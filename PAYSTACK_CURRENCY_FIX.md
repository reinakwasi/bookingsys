# Paystack Currency Fix ✅

## Issue
Paystack popup was showing error: **"Currency not supported by merchant"**

## Root Cause
The payment initialization was missing the `currency` parameter. Paystack requires explicit currency specification for all transactions.

## Solution Applied
Added `currency: 'GHS'` (Ghana Cedis) to both:
1. **Server-side initialization** (`/lib/paystack.ts`)
2. **Client-side popup** (`/app/tickets/page.tsx`)

## Files Modified

### 1. `/lib/paystack.ts`
Added currency to payment initialization:
```typescript
const requestBody = {
  email: paymentData.email,
  amount: amountInKobo,
  currency: 'GHS', // Ghana Cedis - required for Paystack Ghana
  reference: reference,
  callback_url: paymentData.callback_url,
  metadata: paymentData.metadata,
  channels: [...]
};
```

### 2. `/app/tickets/page.tsx`
Added currency to Paystack popup:
```typescript
const handler = window.PaystackPop.setup({
  key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  email: customerForm.email,
  amount: Math.round(selectedTicket.price * quantity * 100),
  currency: 'GHS', // Ghana Cedis
  ref: reference,
  // ... rest of config
});
```

### 3. `/types/paystack.d.ts`
Updated TypeScript definition to make currency required:
```typescript
interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency: string; // Required: 'GHS', 'NGN', 'USD', 'ZAR', etc.
  ref: string;
  // ... rest of interface
}
```

## Supported Currencies

Paystack supports these currencies:
- **GHS** - Ghana Cedis (Ghana)
- **NGN** - Nigerian Naira (Nigeria)
- **USD** - US Dollars (International)
- **ZAR** - South African Rand (South Africa)
- **KES** - Kenyan Shilling (Kenya)

## Testing
After this fix:
1. Restart your dev server
2. Go to `/tickets` page
3. Try purchasing a ticket
4. Paystack popup should now open successfully
5. Use test card: `4084084084084081`

## Important Notes
- Currency must match your Paystack account's country
- For Ghana merchants, use `GHS`
- Amount is in pesewas (100 pesewas = 1 GHS)
- Currency is required for all Paystack transactions

---

**Status**: ✅ Fixed
**Date**: October 24, 2025
