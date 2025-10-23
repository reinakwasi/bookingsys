# Hubtel Payment Integration Setup Guide

## Overview
Hotel 734 now uses **Hubtel Online Checkout** for payment processing. This replaces the previous Paystack integration and supports:
- Mobile Money (MTN, Vodafone, AirtelTigo)
- Bank Cards
- Wallet (Hubtel, G-Money, Zeepay)
- GhQR

## Environment Variables

Add these to your `.env.local` file:

```env
# Hubtel Payment Configuration
NEXT_PUBLIC_HUBTEL_API_ID=wpxJW1
HUBTEL_API_KEY=c7e83f5a4cd6451a90515f7e14a61ca8
NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=3740971

# Site URL (for callbacks)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Important Notes:
- `NEXT_PUBLIC_HUBTEL_API_ID`: Your Hubtel API ID (username) - **wpxJW1**
- `HUBTEL_API_KEY`: Your Hubtel API Key (password) - Keep this secret! - **c7e83f5a4cd6451a90515f7e14a61ca8**
- `NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT`: Your POS Sales ID - **3740971**
- `NEXT_PUBLIC_SITE_URL`: Your website URL (used for callbacks and return URLs)

## Implementation Details

### 1. Hubtel Service (`/lib/hubtel.ts`)
Core service that handles:
- Payment initialization
- Transaction status checking
- Payment verification
- Configuration validation

### 2. API Routes

#### Initialize Payment (`/api/payments/initialize/route.ts`)
- **Method**: POST
- **Purpose**: Initialize a new payment transaction
- **Request Body**:
  ```json
  {
    "amount": 100.00,
    "description": "Ticket Purchase",
    "metadata": {
      "clientReference": "HTL734_TKT_123_1234567890_abc123",
      "ticket_id": "ticket-uuid",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "customer_phone": "0241234567"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "checkoutUrl": "https://pay.hubtel.com/...",
    "checkoutDirectUrl": "https://pay.hubtel.com/.../direct",
    "checkoutId": "...",
    "clientReference": "HTL734_TKT_123_1234567890_abc123"
  }
  ```

#### Payment Callback (`/api/payments/hubtel/callback/route.ts`)
- **Method**: POST
- **Purpose**: Receive payment notifications from Hubtel
- **Called By**: Hubtel servers after payment completion
- **Automatic**: No manual intervention required

#### Verify Payment (`/api/payments/verify/route.ts`)
- **Method**: POST or GET
- **Purpose**: Check transaction status
- **Request Body** (POST):
  ```json
  {
    "clientReference": "HTL734_TKT_123_1234567890_abc123"
  }
  ```
- **Query Params** (GET):
  ```
  ?clientReference=HTL734_TKT_123_1234567890_abc123
  ```
- **Response**:
  ```json
  {
    "success": true,
    "isPaid": true,
    "status": "Paid",
    "data": {
      "amount": 100.00,
      "paymentMethod": "mobilemoney",
      "transactionId": "...",
      "clientReference": "HTL734_TKT_123_1234567890_abc123"
    }
  }
  ```

### 3. Frontend Integration (`/app/tickets/page.tsx`)

The tickets page now uses **Onsite Checkout** which:
1. Opens Hubtel payment page in an iframe
2. Polls for payment status every 3 seconds
3. Automatically closes iframe when payment is complete
4. Shows success message and creates ticket purchase

## Payment Flow

```
User clicks "Pay Now"
    ↓
Initialize payment via API
    ↓
Open Hubtel checkout in iframe (onsite)
    ↓
User completes payment (Mobile Money, Card, etc.)
    ↓
Poll for payment status
    ↓
Payment verified → Close iframe
    ↓
Create ticket purchase record
    ↓
Show success message
```

## Testing

### Test the Integration:
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/tickets` page

3. Click "Purchase Ticket" on any ticket

4. Fill in customer details and click "Pay Now"

5. Hubtel checkout should open in an iframe

6. Complete payment using test credentials (if available)

7. Payment should be verified automatically

### Check Configuration:
Open browser console and look for:
```
💳 Checking Hubtel configuration...
✅ Hubtel is properly configured
```

If you see errors, check your environment variables.

## Hubtel Response Codes

| Code | Description | Action |
|------|-------------|--------|
| 0000 | Success | Transaction successful |
| 0005 | HTTP failure | Retry or contact support |
| 2001 | Transaction failed | Check user account/limits |
| 4000 | Validation error | Check request parameters |
| 4070 | Fees not set | Contact Hubtel support |

## Security Notes

1. **API Key Protection**:
   - Never expose `HUBTEL_API_KEY` in client-side code
   - Always use server-side API routes for Hubtel calls
   - The API key is only used in `/lib/hubtel.ts` server-side functions

2. **Client Reference**:
   - Always unique per transaction
   - Format: `HTL734_TKT_{ticket_id}_{timestamp}_{random}`
   - Used for transaction tracking and verification

3. **Callback Security**:
   - Callback endpoint validates all incoming data
   - Parses and verifies Hubtel callback structure
   - Logs all payment attempts for audit trail

## Callback URL Configuration

Make sure your callback URL is whitelisted in Hubtel dashboard:
- **Development**: `http://localhost:3000/api/payments/hubtel/callback`
- **Production**: `https://yourdomain.com/api/payments/hubtel/callback`

## IP Whitelisting (for Status Check API)

For production, you need to whitelist your server IP addresses with Hubtel:
1. Get your server's public IP address
2. Contact your Hubtel Retail Systems Engineer
3. Provide up to 4 IP addresses for whitelisting

## Troubleshooting

### Payment not initializing:
- Check environment variables are set correctly
- Check browser console for errors
- Verify Hubtel API credentials

### Payment not verifying:
- Check callback URL is accessible
- Verify client reference is correct
- Check Hubtel dashboard for transaction status

### Iframe not opening:
- Check popup blockers
- Verify `checkoutDirectUrl` is returned from API
- Check browser console for errors

## Support

For Hubtel-specific issues:
- **Documentation**: https://developers.hubtel.com/
- **Support**: Contact your Hubtel Retail Systems Engineer

For Hotel 734 integration issues:
- Check logs in browser console
- Check server logs for API route errors
- Verify all environment variables are set

## Migration from Paystack

All Paystack references have been removed:
- ✅ Removed `PaystackService` imports
- ✅ Replaced with `HubtelService`
- ✅ Updated payment initialization
- ✅ Updated payment verification
- ✅ Updated success handling
- ✅ Removed Paystack environment variables

Old Paystack environment variables can be safely removed:
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_SECRET_KEY`
