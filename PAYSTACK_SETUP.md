# Paystack Payment Integration Setup Guide

This guide explains how to configure Paystack payment integration for Hotel 734 ticket purchasing system.

## Required Environment Variables

Add these variables to your `.env.local` file:

```env
# Paystack Payment Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here

# Site URL (for callbacks)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Getting Your Paystack Keys

1. **Sign up for Paystack**:
   - Go to https://paystack.com/
   - Create an account or log in

2. **Get your API keys**:
   - Navigate to Settings → API Keys & Webhooks
   - Copy your **Public Key** (starts with `pk_test_` for test mode)
   - Copy your **Secret Key** (starts with `sk_test_` for test mode)

3. **Test vs Live Keys**:
   - **Test keys** (pk_test_/sk_test_): Use for development and testing
   - **Live keys** (pk_live_/sk_live_): Use for production only

## Environment Variable Explanation

### `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- **Type**: Public (client-side accessible)
- **Purpose**: Used in the browser to initialize Paystack popup
- **Format**: `pk_test_xxxxxxxxxxxx` or `pk_live_xxxxxxxxxxxx`
- **Security**: Safe to expose in client code

### `PAYSTACK_SECRET_KEY`
- **Type**: Private (server-side only)
- **Purpose**: Used in API routes to verify payments
- **Format**: `sk_test_xxxxxxxxxxxx` or `sk_live_xxxxxxxxxxxx`
- **Security**: ⚠️ **NEVER expose in client code or commit to git**

### `NEXT_PUBLIC_SITE_URL`
- **Type**: Public
- **Purpose**: Base URL for payment callbacks
- **Development**: `http://localhost:3000`
- **Production**: `https://yourdomain.com`

## Setup Steps

### 1. Create `.env.local` File

In your project root, create a `.env.local` file:

```bash
# Create the file
touch .env.local
```

Add your Paystack credentials:

```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_key
PAYSTACK_SECRET_KEY=sk_test_your_actual_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Restart Development Server

After adding environment variables, restart your server:

```bash
npm run dev
```

### 3. Test the Integration

1. Navigate to `/tickets` page
2. Select a ticket and click "Purchase Ticket"
3. Fill in customer details
4. Click "Pay Now"
5. Paystack popup should appear
6. Use Paystack test cards to complete payment

## Paystack Test Cards

Use these test cards for development:

### Successful Payment
```
Card Number: 4084084084084081
CVV: 408
Expiry: Any future date
PIN: 0000
OTP: 123456
```

### Declined Payment
```
Card Number: 5060666666666666666
CVV: 123
Expiry: Any future date
```

### Insufficient Funds
```
Card Number: 5078585078585078585
CVV: 123
Expiry: Any future date
PIN: 1234
```

## Payment Flow

1. **Customer initiates payment**:
   - Fills ticket purchase form
   - Clicks "Pay Now"

2. **Backend initializes payment**:
   - `/api/payments/initialize` creates Paystack transaction
   - Returns authorization URL and reference

3. **Paystack popup opens**:
   - Customer enters card details
   - Completes payment on Paystack

4. **Payment verification**:
   - `/api/payments/verify` confirms payment with Paystack
   - Creates ticket purchase record
   - Sends confirmation email

5. **Success**:
   - Customer sees success message
   - Receives email with QR codes

## Production Deployment

### 1. Switch to Live Keys

In your production environment variables:

```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key
PAYSTACK_SECRET_KEY=sk_live_your_live_key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. Configure Paystack Webhook (Optional)

For real-time payment notifications:

1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Save webhook secret to environment variables

### 3. Verify SSL Certificate

Paystack requires HTTPS in production. Ensure your domain has a valid SSL certificate.

## Troubleshooting

### "Paystack not configured" Error

**Cause**: Missing or incorrect environment variables

**Solution**:
1. Check `.env.local` file exists
2. Verify variable names are correct (including `NEXT_PUBLIC_` prefix)
3. Restart development server
4. Clear browser cache

### Payment Popup Doesn't Open

**Cause**: Public key not loaded or incorrect

**Solution**:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is set
3. Ensure key starts with `pk_test_` or `pk_live_`
4. Check network tab for blocked scripts

### Payment Verification Fails

**Cause**: Secret key issue or network problem

**Solution**:
1. Check server logs for detailed error
2. Verify `PAYSTACK_SECRET_KEY` is correct
3. Ensure key starts with `sk_test_` or `sk_live_`
4. Test Paystack API directly: https://api.paystack.co/transaction/verify/{reference}

### "Duplicate Transaction Reference" Error

**Cause**: Reusing the same payment reference

**Solution**: The system automatically generates unique references. If you see this error:
1. Clear browser cache and sessionStorage
2. Try a fresh payment
3. Check for multiple simultaneous payment attempts

## Security Best Practices

1. **Never commit `.env.local`**:
   - Already in `.gitignore`
   - Never push to version control

2. **Keep secret key private**:
   - Only use in server-side code
   - Never expose in client JavaScript
   - Don't log in production

3. **Use test keys in development**:
   - Always use `pk_test_` and `sk_test_` locally
   - Only use live keys in production

4. **Verify all payments**:
   - Always verify payment status server-side
   - Don't trust client-side success callbacks alone
   - Check payment status before creating tickets

## Support

- **Paystack Documentation**: https://paystack.com/docs
- **Paystack Support**: support@paystack.com
- **Test Environment**: https://dashboard.paystack.com/test

## Files Modified

- `/lib/paystack.ts` - Paystack service library
- `/app/api/payments/initialize/route.ts` - Payment initialization
- `/app/api/payments/verify/route.ts` - Payment verification
- `/app/api/payments/callback/route.ts` - Payment callback handler
- `/app/tickets/page.tsx` - Ticket purchase page with Paystack integration
- `/types/paystack.d.ts` - TypeScript definitions

## Next Steps

1. Add your Paystack keys to `.env.local`
2. Restart your development server
3. Test the payment flow with test cards
4. When ready for production, switch to live keys
5. Configure webhooks for real-time notifications (optional)
