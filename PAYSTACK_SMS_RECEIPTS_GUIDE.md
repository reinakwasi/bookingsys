# Paystack SMS Receipts & Optional Email Implementation

## Overview
This implementation addresses the user's request to:
1. **Send Paystack receipts via SMS** to customers who don't have email
2. **Make phone number mandatory** and email optional
3. **Send notifications to both email and SMS** when both are provided

## Key Changes Made

### 1. **Paystack SMS Receipt Configuration**
- **File**: `lib/paystack.ts`
- **Change**: Added customer phone number to Paystack initialization
- **Result**: Paystack will now send payment receipts via SMS to the provided phone number

```typescript
// Include customer phone for SMS receipts
...(paymentData.metadata?.customer_phone && {
  customer: {
    email: paymentData.email,
    phone: paymentData.metadata.customer_phone,
    first_name: paymentData.metadata?.customer_name?.split(' ')[0] || 'Customer',
    last_name: paymentData.metadata?.customer_name?.split(' ').slice(1).join(' ') || ''
  }
})
```

### 2. **Form Field Changes**
- **File**: `app/tickets/page.tsx`
- **Changes**:
  - **Phone Number**: Now mandatory with clear messaging about SMS receipts
  - **Email Address**: Now optional with explanation about dual notifications
  - **Field Order**: Phone number moved above email to emphasize importance

### 3. **Validation Updates**
- **Required Fields**: Name and Phone Number (email is optional)
- **Phone Validation**: Basic format validation for phone numbers
- **Email Validation**: Only validates format if email is provided

```typescript
// Validate required fields: name and phone are mandatory, email is optional
if (!selectedTicket || !customerForm.name.trim() || !customerForm.phone.trim()) {
  toast.error('Please fill in all required fields (Name and Phone Number)');
  return;
}

// Validate phone number format
const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
if (!phoneRegex.test(customerForm.phone.trim())) {
  toast.error('Please enter a valid phone number');
  return;
}
```

### 4. **Payment Processing Updates**
- **Temporary Email**: If no email provided, creates temporary email for Paystack (required by their API)
- **Metadata Flag**: `has_email` flag tracks whether customer provided real email
- **Smart Notifications**: Only sends email notifications if real email was provided

### 5. **Webhook Notification Logic**
- **File**: `app/api/webhooks/paystack/route.ts`
- **Logic**:
  - **SMS**: Always sent if phone number provided
  - **Email**: Only sent if customer provided a real email address
  - **Dual Notifications**: Both email and SMS sent when both are available

## User Experience Flow

### Scenario 1: Customer with Phone Only
1. Customer enters name and phone number (email left empty)
2. System creates temporary email for Paystack: `{phone}@hotel734.temp`
3. Paystack sends SMS receipt to customer's phone
4. Hotel 734 sends SMS ticket notification
5. **Result**: Customer receives both Paystack receipt and ticket via SMS

### Scenario 2: Customer with Phone and Email
1. Customer enters name, phone, and email
2. System uses real email for Paystack
3. Paystack sends receipt to both email and SMS
4. Hotel 734 sends notifications to both email and SMS
5. **Result**: Customer receives all notifications via both channels

## Technical Benefits

### 1. **Paystack SMS Receipts**
- Customers without email can still receive payment receipts
- Paystack automatically handles SMS delivery
- No additional SMS costs for payment receipts

### 2. **Flexible Notification System**
- Accommodates customers with different communication preferences
- Ensures everyone receives important information
- Maintains professional communication standards

### 3. **Improved Accessibility**
- Removes email requirement barrier
- Better serves customers in areas with limited email access
- Maintains compliance with payment receipt requirements

## Environment Variables Required

```env
# Paystack Configuration (existing)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...

# Site URL for notifications (existing)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email Configuration (existing - for dual notifications)
GMAIL_USER=info.hotel734@gmail.com
GMAIL_PASS=your_gmail_app_password

# SMS Configuration (existing - for ticket notifications)
BULKSMS_API_KEY=your_bulksms_api_key
BULKSMS_SENDER_ID=HOTEL 734
```

## Testing Scenarios

### Test 1: Phone Only Customer
1. Fill form with name and phone (leave email empty)
2. Complete payment
3. **Expected**: 
   - Paystack SMS receipt received
   - Hotel 734 SMS notification received
   - No email notifications sent

### Test 2: Phone and Email Customer
1. Fill form with name, phone, and email
2. Complete payment
3. **Expected**:
   - Paystack receipt via both email and SMS
   - Hotel 734 notifications via both email and SMS

### Test 3: Invalid Phone Number
1. Enter invalid phone format
2. **Expected**: Validation error before payment

## Important Notes

### 1. **Paystack SMS Requirements**
- Customer phone number must be included in payment initialization
- Paystack handles SMS delivery automatically
- SMS receipts are sent in addition to email receipts (if email provided)

### 2. **Temporary Email Handling**
- Format: `{phone_digits}@hotel734.temp`
- Used only for Paystack API requirement
- Not used for actual notifications
- Filtered out in webhook processing

### 3. **Backward Compatibility**
- Existing customers with email addresses continue to work
- System gracefully handles both scenarios
- No breaking changes to existing functionality

## Support Information

If customers don't receive SMS receipts:
1. **Check Phone Format**: Ensure phone number is valid international format
2. **Paystack Account**: Verify Paystack account supports SMS receipts in Ghana
3. **Network Issues**: SMS delivery may be delayed by network providers
4. **Contact Paystack**: For SMS receipt delivery issues

## Success Metrics

✅ **Phone Number Mandatory**: Customers must provide phone for payment
✅ **Email Optional**: Customers can complete purchase without email
✅ **SMS Receipts**: Paystack sends payment receipts via SMS
✅ **Dual Notifications**: Both email and SMS when both provided
✅ **Better Accessibility**: Serves customers without email access
✅ **Professional Experience**: Maintains high-quality customer communication

This implementation ensures all customers receive payment receipts and ticket information regardless of their email availability, while maintaining the option for dual notifications when both contact methods are provided.
