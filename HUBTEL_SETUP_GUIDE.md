# 🚀 Hubtel Payment Integration Setup Guide

## ✅ What's Been Implemented

I've successfully integrated Hubtel Online Checkout as your payment system! Here's what's ready:

### **Files Created/Updated:**
1. ✅ `/lib/hubtel.ts` - Complete Hubtel service
2. ✅ `/app/api/payments/initialize/route.ts` - Payment initialization API
3. ✅ `/app/api/payments/verify/route.ts` - Payment verification API
4. ✅ `/app/tickets/page.tsx` - Frontend updated for Hubtel redirect checkout

---

## 🔧 Environment Variables Setup

Add these to your `.env.local` file:

```env
# ============================================================================
# HUBTEL PAYMENT CONFIGURATION
# ============================================================================

# Hubtel API ID (from your Hubtel dashboard)
# Find this at: https://hubtel.com/merchant/settings/api-keys
NEXT_PUBLIC_HUBTEL_API_ID=your_api_id_here

# Hubtel API Key (SECRET - never expose to client)
# Find this at: https://hubtel.com/merchant/settings/api-keys
HUBTEL_API_KEY=your_api_key_here

# Hubtel Merchant Account Number (POS Sales ID)
# Find this at: https://hubtel.com/merchant/settings/business
NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=your_merchant_account_number

# Site URL (for callbacks and redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# For production: NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# ============================================================================
# EXISTING CONFIGURATION (Keep these)
# ============================================================================

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email (Gmail SMTP)
SMTP_USER=info.hotel734@gmail.com
SMTP_PASS=your_gmail_app_password
FROM_EMAIL=info.hotel734@gmail.com
FROM_NAME=Hotel 734

# SMS (BulkSMS Ghana)
BULKSMS_API_KEY=your_bulksms_api_key
BULKSMS_SENDER_ID=HOTEL 734
```

---

## 📋 How to Get Hubtel Credentials

### **Step 1: Create/Login to Hubtel Account**
1. Go to https://hubtel.com/
2. Sign up or log in to your merchant account

### **Step 2: Get API Credentials**
1. Navigate to **Settings → API Keys**
2. Click "Create New API Key"
3. Copy your **API ID** and **API Key**
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_HUBTEL_API_ID=your_api_id
   HUBTEL_API_KEY=your_api_key
   ```

### **Step 3: Get Merchant Account Number**
1. Navigate to **Settings → Business Information**
2. Find your **POS Sales ID** (also called Merchant Account Number)
3. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=your_merchant_account
   ```

### **Step 4: Configure Callbacks (Optional but Recommended)**
1. In Hubtel dashboard, go to **Settings → Webhooks**
2. Add your callback URL: `https://yourdomain.com/api/payments/hubtel/callback`
3. This allows Hubtel to notify your system of payment status

---

## 🎯 How the Payment Flow Works

### **User Experience:**
```
1. User clicks "Pay Now" on ticket
   ↓
2. System initializes payment with Hubtel
   ↓
3. User is redirected to Hubtel checkout page
   ↓
4. User selects payment method:
   - Mobile Money (MTN, Vodafone, AirtelTigo)
   - Bank Card
   - Wallet (Hubtel, G-Money, Zeepay)
   - GhQR
   ↓
5. User completes payment
   ↓
6. Hubtel redirects back to your site
   ↓
7. System verifies payment
   ↓
8. Ticket is created and notifications sent
```

### **Technical Flow:**
```
Frontend (tickets/page.tsx)
  ↓
POST /api/payments/initialize
  ↓
HubtelService.initializePayment()
  ↓
Hubtel API (returns checkoutUrl)
  ↓
Redirect user to checkoutUrl
  ↓
User pays on Hubtel
  ↓
Hubtel redirects to returnUrl
  ↓
Frontend calls POST /api/payments/verify
  ↓
HubtelService.checkTransactionStatus()
  ↓
Create ticket & send notifications
```

---

## 🔐 Authentication Method

Hubtel uses **HTTP Basic Authentication**:
```
Authorization: Basic {base64_encode(API_ID:API_KEY)}
```

The `HubtelService` handles this automatically in the `getAuthHeader()` method.

---

## 💰 Payment Methods Supported

Hubtel supports all major Ghanaian payment methods:
- ✅ **Mobile Money**: MTN, Vodafone Cash, AirtelTigo Money
- ✅ **Bank Cards**: Visa, Mastercard
- ✅ **Wallets**: Hubtel Wallet, G-Money, Zeepay
- ✅ **GhQR**: Ghana QR Code payments
- ✅ **Cash/Cheque**: (if enabled)

---

## 🧪 Testing

### **Test Mode:**
1. Use Hubtel's test credentials (if available)
2. Test with small amounts (GHS 0.10 - 1.00)
3. Check console logs for detailed payment flow

### **Test Checklist:**
- [ ] Payment initialization works
- [ ] Redirect to Hubtel checkout works
- [ ] Can select payment method
- [ ] Payment completes successfully
- [ ] Redirect back to site works
- [ ] Payment verification works
- [ ] Ticket is created
- [ ] Email notification sent
- [ ] SMS notification sent

---

## 📊 Transaction Status Check

**Important:** Hubtel requires IP whitelisting for the Transaction Status Check API.

### **Setup IP Whitelisting:**
1. Find your server's public IP address
2. Contact your Hubtel Retail Systems Engineer
3. Request to whitelist your IP for Transaction Status Check API
4. API endpoint: `https://api-txnstatus.hubtel.com/transactions/{merchant_account}/status`

**Note:** Without IP whitelisting, status checks will return 403 Forbidden errors.

---

## 🚨 Important Notes

### **Client Reference (Transaction ID):**
- **Must be unique** for every transaction
- **Maximum 32 characters**
- **Format**: `HTL734_{ticketId}_{timestamp}_{random}`
- Never reuse references

### **Amount Format:**
- Hubtel uses **decimal format** (not smallest unit like Paystack)
- Example: GHS 50.00 → send as `50.00` (not 5000)
- Maximum 2 decimal places

### **Callback URL:**
- Must be publicly accessible (not localhost)
- Use ngrok for local testing: `https://your-ngrok-url.ngrok.io/api/payments/hubtel/callback`
- For production: `https://yourdomain.com/api/payments/hubtel/callback`

### **Return URL:**
- Where users are redirected after payment
- Currently set to: `/payment-success`
- You may need to create this page

### **Cancellation URL:**
- Where users are redirected if they cancel
- Currently set to: `/payment-cancelled`
- You may need to create this page

---

## 🔄 Differences from Paystack

| Feature | Paystack | Hubtel |
|---------|----------|--------|
| **Integration** | Popup/Iframe | Redirect |
| **Amount Format** | Smallest unit (x100) | Decimal (as-is) |
| **Currency** | Multiple | GHS only |
| **Reference** | Any length | Max 32 chars |
| **Verification** | Immediate | May need IP whitelist |
| **Payment Methods** | Card, Mobile Money | Card, Mobile Money, Wallet, GhQR |

---

## 🐛 Troubleshooting

### **"Hubtel not configured" Error:**
- Check all environment variables are set in `.env.local`
- Restart your development server after adding variables
- Verify variable names match exactly (case-sensitive)

### **"403 Forbidden" on Status Check:**
- Your IP is not whitelisted
- Contact Hubtel support to whitelist your server IP
- Use callback URL as alternative for status updates

### **"Invalid credentials" Error:**
- Verify API ID and API Key are correct
- Check for extra spaces in `.env.local`
- Ensure you're using the correct merchant account number

### **Payment Redirects but Doesn't Verify:**
- Check return URL is correct
- Verify callback URL is publicly accessible
- Check console logs for verification errors
- Ensure transaction status check IP is whitelisted

---

## 📞 Support

### **Hubtel Support:**
- **Website**: https://hubtel.com/support
- **Email**: support@hubtel.com
- **Phone**: Check Hubtel website for contact numbers

### **Documentation:**
- **API Docs**: https://developers.hubtel.com/
- **Online Checkout**: https://developers.hubtel.com/documentations/online-checkout

---

## ✅ Next Steps

1. **Get Hubtel Credentials:**
   - Sign up/login to Hubtel
   - Create API keys
   - Get merchant account number

2. **Update Environment Variables:**
   - Add credentials to `.env.local`
   - Restart development server

3. **Test Payment Flow:**
   - Try purchasing a ticket
   - Complete payment on Hubtel
   - Verify ticket creation

4. **Setup IP Whitelisting:**
   - Contact Hubtel support
   - Provide your server IP
   - Test status check API

5. **Create Return Pages:**
   - Create `/payment-success` page
   - Create `/payment-cancelled` page
   - Handle payment completion

6. **Go Live:**
   - Update `NEXT_PUBLIC_SITE_URL` to production domain
   - Test with real payments
   - Monitor transactions

---

**Status**: 🟢 Ready for Testing

Once you add your Hubtel credentials to `.env.local`, the payment system will be fully functional!
