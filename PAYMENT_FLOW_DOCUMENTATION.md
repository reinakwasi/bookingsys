# 🎫 Complete Payment & Ticket Flow Documentation

## Overview
This document explains the complete payment and ticket purchase flow used in Hotel 734. This flow was implemented with Paystack and will be adapted for Hubtel.

---

## 📋 Payment Flow Architecture

### **1. Frontend (Client-Side) - `/app/tickets/page.tsx`**

#### **Step 1: User Initiates Purchase**
```typescript
// User clicks "Pay Now" button
handlePurchase() {
  // Validate form inputs
  // Generate unique reference: HTL734_{ticketId}_{timestamp}_{random}
  // Prevent duplicate payment attempts (isProcessingPayment check)
}
```

**Key Points:**
- **Unique Reference Generation**: `HTL734_${ticketId}_${Date.now()}_${random}`
- **Duplicate Prevention**: Check `isProcessingPayment` state
- **Form Validation**: Name, email, phone required

---

#### **Step 2: Initialize Payment (Backend Call)**
```typescript
// Call backend API to initialize payment
const response = await fetch('/api/payments/initialize', {
  method: 'POST',
  body: JSON.stringify({
    amount: ticket.price * quantity,
    email: customerForm.email,
    metadata: {
      ticket_id, ticket_title, quantity,
      customer_name, customer_phone, reference
    }
  })
});
```

**What Happens:**
- Frontend calls `/api/payments/initialize`
- Passes: amount, email, metadata
- Backend returns: `authorization_url`, `access_code`, `reference`

---

#### **Step 3: Store Pending Payment**
```typescript
// Store in sessionStorage for later verification
sessionStorage.setItem('pendingPayment', JSON.stringify({
  reference,
  ticketId,
  ticketTitle,
  quantity,
  totalAmount,
  customerName,
  customerEmail,
  customerPhone
}));
```

**Why SessionStorage?**
- Survives page refreshes
- Available after payment gateway redirect
- Cleared after successful purchase

---

#### **Step 4: Open Payment Gateway**
```typescript
// Load Paystack inline script
if (!window.PaystackPop) {
  const script = document.createElement('script');
  script.src = 'https://js.paystack.co/v1/inline.js';
  document.body.appendChild(script);
}

// Initialize payment popup
const handler = window.PaystackPop.setup({
  key: PAYSTACK_PUBLIC_KEY,
  email: customerForm.email,
  amount: Math.round(price * quantity * 100), // Convert to pesewas
  currency: 'GHS',
  ref: reference,
  metadata: { ...ticket details... },
  onClose: () => {
    // User closed popup - cleanup
    sessionStorage.removeItem('pendingPayment');
  },
  callback: (response) => {
    // Payment successful - verify it
    handlePaymentSuccess(response.reference);
  }
});

handler.openIframe();
```

**Key Points:**
- **Amount Conversion**: Multiply by 100 (GHS → pesewas)
- **Currency**: GHS (Ghana Cedis)
- **Callbacks**: `onClose` (cancelled), `callback` (success)
- **Popup**: Opens in iframe overlay

---

### **2. Backend (Server-Side) - Payment Initialization**

#### **API Route: `/api/payments/initialize/route.ts`**

```typescript
export async function POST(request) {
  // 1. Extract data
  const { amount, email, metadata } = await request.json();
  
  // 2. Validate inputs
  if (!amount || !email) {
    return error('Amount and email required');
  }
  
  // 3. Validate Paystack configuration
  const config = PaystackService.validateConfiguration();
  if (!config.isValid) {
    return error('Paystack not configured');
  }
  
  // 4. Generate reference (if not provided)
  const reference = metadata?.reference || PaystackService.generateReference();
  
  // 5. Initialize payment with Paystack
  const result = await PaystackService.initializePayment({
    amount,
    email,
    reference,
    callback_url: `${siteUrl}/api/payments/callback`,
    metadata
  });
  
  // 6. Return authorization URL
  return {
    success: true,
    authorization_url: result.data.authorization_url,
    access_code: result.data.access_code,
    reference: result.data.reference
  };
}
```

---

#### **Paystack Service: `/lib/paystack.ts`**

```typescript
class PaystackService {
  // Initialize payment
  static async initializePayment(data) {
    // Convert amount to pesewas (smallest unit)
    const amountInPesewas = Math.round(data.amount * 100);
    
    // Call Paystack API
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: data.email,
        amount: amountInPesewas,
        currency: 'GHS',
        reference: data.reference,
        callback_url: data.callback_url,
        metadata: data.metadata,
        channels: ['card', 'bank', 'mobile_money', 'ussd', 'qr']
      })
    });
    
    return response.data; // { authorization_url, access_code, reference }
  }
}
```

**Key Points:**
- **Amount Conversion**: Multiply by 100 (GHS → pesewas)
- **Currency**: GHS (Ghana Cedis)
- **Channels**: All payment methods enabled
- **Secret Key**: Used for server-side API calls

---

### **3. Payment Gateway (Paystack)**

**User Experience:**
1. Popup/iframe opens with Paystack checkout
2. User selects payment method:
   - Card (Visa, Mastercard)
   - Mobile Money (MTN, Vodafone, AirtelTigo)
   - Bank Transfer
   - USSD
3. User completes payment
4. Paystack processes transaction
5. Popup closes with success/failure

**Paystack Handles:**
- Payment processing
- Security (PCI compliance)
- 3D Secure authentication
- Transaction status

---

### **4. Payment Verification (After Success)**

#### **Frontend: `handlePaymentSuccess(reference)`**

```typescript
async function handlePaymentSuccess(reference) {
  // 1. Get pending payment from sessionStorage
  const pendingPayment = JSON.parse(sessionStorage.getItem('pendingPayment'));
  
  // 2. Verify payment with backend
  const verifyResponse = await fetch('/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify({ reference })
  });
  
  const result = await verifyResponse.json();
  
  // 3. Check if payment is verified and paid
  if (!result.success || !result.isPaid) {
    toast.error('Payment verification failed');
    return;
  }
  
  // 4. Create ticket purchase record
  const purchaseData = {
    ticket_id: pendingPayment.ticketId,
    customer_name: pendingPayment.customerName,
    customer_email: pendingPayment.customerEmail,
    customer_phone: pendingPayment.customerPhone,
    quantity: pendingPayment.quantity,
    total_amount: pendingPayment.totalAmount,
    payment_status: 'completed',
    payment_reference: reference,
    payment_method: 'paystack'
  };
  
  // 5. Show success message
  setShowSuccessAlert(true);
  toast.success('Payment successful! Tickets purchased.');
  
  // 6. Clear session storage
  sessionStorage.removeItem('pendingPayment');
  
  // 7. Create ticket in database (background)
  ticketPurchasesAPI.create(purchaseData);
  // This automatically sends email & SMS notifications
}
```

---

#### **Backend: `/api/payments/verify/route.ts`**

```typescript
export async function POST(request) {
  // 1. Get reference
  const { reference } = await request.json();
  
  // 2. Verify with Paystack
  const result = await PaystackService.verifyPayment(reference);
  
  // 3. Return verification result
  return {
    success: true,
    data: result.data,
    status: result.data.status, // 'success' or 'failed'
    isPaid: result.data.status === 'success'
  };
}
```

---

#### **Paystack Service: Verification**

```typescript
static async verifyPayment(reference) {
  // Call Paystack verification API
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    }
  );
  
  return response.data; // { status, amount, currency, paid_at, channel, customer }
}
```

**Verification Response:**
```json
{
  "status": "success",
  "reference": "HTL734_123_1234567890_abc123",
  "amount": 100, // in pesewas
  "currency": "GHS",
  "paid_at": "2024-01-01T12:00:00Z",
  "channel": "mobile_money",
  "customer": {
    "email": "customer@example.com"
  }
}
```

---

### **5. Ticket Creation & Notifications**

#### **Database: `/lib/database.ts` - `ticketPurchasesAPI.create()`**

```typescript
async create(purchase) {
  // 1. Generate access token
  const accessToken = `TKT-${Date.now()}-${random}`;
  
  // 2. Get ticket details
  const ticket = await supabase
    .from('tickets')
    .select('*')
    .eq('id', purchase.ticket_id)
    .single();
  
  // 3. Insert ticket purchase
  const { data } = await supabase
    .from('ticket_purchases')
    .insert({
      ...purchase,
      purchase_date: new Date().toISOString(),
      access_token: accessToken,
      qr_code: `QR-${accessToken.toUpperCase()}`
    })
    .select()
    .single();
  
  // 4. Send email notification
  await fetch('/api/send-ticket-email', {
    method: 'POST',
    body: JSON.stringify({
      customer_email: data.customer_email,
      customer_name: data.customer_name,
      ticket_title: ticket.title,
      quantity: purchase.quantity,
      total_amount: purchase.total_amount,
      payment_reference: purchase.payment_reference,
      event_date: formatDate(ticket.event_date),
      purchase_date: formatDate(new Date())
    })
  });
  
  // 5. Send SMS notification
  if (purchase.customer_phone) {
    await fetch('/api/send-sms', {
      method: 'POST',
      body: JSON.stringify({
        to: purchase.customer_phone,
        message: `Hotel 734 Ticket Confirmed!
Event: ${ticket.title}
Date: ${eventDate}
Qty: ${quantity}
Amount: GHS ${total_amount}
Ref: ${access_token}
View: hotel734.com/my-tickets`
      })
    });
  }
  
  return data;
}
```

---

### **6. Email Notification**

#### **API: `/api/send-ticket-email/route.ts`**

```typescript
export async function POST(request) {
  const {
    customer_email,
    customer_name,
    ticket_title,
    quantity,
    total_amount,
    payment_reference,
    event_date,
    purchase_date
  } = await request.json();
  
  // Create professional HTML email
  const emailContent = `
    <div style="...Hotel 734 branding...">
      <h1>Ticket Purchase Confirmation</h1>
      <p>Dear ${customer_name},</p>
      <p>Thank you for purchasing tickets for ${ticket_title}!</p>
      
      <div>Ticket Details:
        - Event: ${ticket_title}
        - Date: ${event_date}
        - Quantity: ${quantity}
        - Amount: GHS ${total_amount}
        - Reference: ${payment_reference}
        - Purchase Date: ${purchase_date}
      </div>
      
      <a href="hotel734.com/my-tickets">View My Tickets</a>
    </div>
  `;
  
  // Send via Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
  
  await transporter.sendMail({
    from: '"Hotel 734" <info.hotel734@gmail.com>',
    to: customer_email,
    subject: '🎉 Hotel 734 - Ticket Purchase Confirmation',
    html: emailContent
  });
}
```

---

## 🔄 Complete Flow Summary

```
1. USER CLICKS "PAY NOW"
   ↓
2. FRONTEND: Generate unique reference
   ↓
3. FRONTEND: Call /api/payments/initialize
   ↓
4. BACKEND: Call Paystack API to initialize payment
   ↓
5. BACKEND: Return authorization_url
   ↓
6. FRONTEND: Store pending payment in sessionStorage
   ↓
7. FRONTEND: Open Paystack popup with authorization_url
   ↓
8. USER: Complete payment in Paystack
   ↓
9. PAYSTACK: Process payment & close popup
   ↓
10. FRONTEND: Paystack callback with reference
    ↓
11. FRONTEND: Call /api/payments/verify
    ↓
12. BACKEND: Call Paystack verify API
    ↓
13. BACKEND: Return verification result (isPaid: true/false)
    ↓
14. FRONTEND: If verified, create ticket purchase
    ↓
15. DATABASE: Insert ticket_purchases record
    ↓
16. DATABASE: Send email notification
    ↓
17. DATABASE: Send SMS notification
    ↓
18. FRONTEND: Show success message
    ↓
19. FRONTEND: Clear sessionStorage
    ↓
20. FRONTEND: Refresh tickets list
```

---

## 🔑 Key Concepts for Hubtel Integration

### **1. Payment Gateway Integration Pattern**
- **Initialize**: Backend calls gateway API to create payment session
- **Redirect/Popup**: User completes payment in gateway interface
- **Callback**: Gateway notifies app of payment status
- **Verify**: Backend verifies payment with gateway API
- **Complete**: Create ticket and send notifications

### **2. Reference/Transaction ID**
- **Must be unique** for each transaction
- **Format**: `HTL734_{ticketId}_{timestamp}_{random}`
- **Used for**: Tracking, verification, and preventing duplicates

### **3. Amount Handling**
- **Frontend**: Display in GHS (e.g., 50.00)
- **Backend**: Convert to smallest unit (pesewas: 50.00 → 5000)
- **Gateway**: Send in smallest unit
- **Verification**: Convert back to GHS for display

### **4. Session Management**
- **sessionStorage**: Store pending payment during transaction
- **Clear after**: Successful purchase or cancellation
- **Contains**: All data needed to create ticket after payment

### **5. Verification is Critical**
- **Never trust** client-side payment success
- **Always verify** with gateway API on backend
- **Check status**: Ensure payment is actually completed
- **Then create**: Only create ticket after verification

### **6. Notifications**
- **Email**: Professional HTML template with all details
- **SMS**: Short summary with reference and link
- **Timing**: Sent automatically after ticket creation
- **Graceful**: Don't fail purchase if notification fails

---

## 📝 Files to Modify for Hubtel

### **Frontend:**
- `/app/tickets/page.tsx` - Payment initialization and handling

### **Backend:**
- `/lib/paystack.ts` → `/lib/hubtel.ts` - Payment service
- `/app/api/payments/initialize/route.ts` - Initialize payment
- `/app/api/payments/verify/route.ts` - Verify payment

### **Keep As-Is:**
- `/lib/database.ts` - Ticket creation (works with any gateway)
- `/app/api/send-ticket-email/route.ts` - Email notifications
- `/app/api/send-sms/route.ts` - SMS notifications

---

## 🎯 Hubtel Adaptation Checklist

- [ ] Replace Paystack API calls with Hubtel API
- [ ] Update amount conversion (if different from pesewas)
- [ ] Update currency code (GHS remains same)
- [ ] Update payment channels (Hubtel's available methods)
- [ ] Update popup/redirect mechanism (Hubtel's approach)
- [ ] Update verification endpoint
- [ ] Update environment variables
- [ ] Test complete flow end-to-end
- [ ] Update error messages and logging

---

**Status**: ✅ Flow documented and ready for Hubtel integration
