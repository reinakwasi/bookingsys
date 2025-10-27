/**
 * Test script for Paystack webhook endpoint
 * Run this to test if your webhook is working correctly
 */

const crypto = require('crypto');

// Test webhook payload (simulates Paystack webhook)
const testPayload = {
  event: 'charge.success',
  data: {
    id: 123456789,
    domain: 'test',
    status: 'success',
    reference: 'HTL734_TEST_' + Date.now(),
    amount: 5000, // 50.00 GHS in pesewas
    currency: 'GHS',
    paid_at: new Date().toISOString(),
    channel: 'card',
    customer: {
      email: 'test@example.com',
      customer_code: 'CUS_test123'
    },
    metadata: {
      ticket_id: '1', // Make sure this ticket exists in your system
      quantity: 1,
      customer_name: 'Test Customer',
      customer_phone: '+233123456789'
    }
  }
};

async function testWebhook() {
  try {
    console.log('🧪 Testing Paystack webhook...');
    
    // Your webhook URL (update this to match your setup)
    const webhookUrl = 'http://localhost:3000/api/webhooks/paystack';
    
    // Convert payload to string
    const payloadString = JSON.stringify(testPayload);
    
    // Create signature (you need your Paystack secret key)
    const secretKey = process.env.PAYSTACK_SECRET_KEY || 'sk_test_your_secret_key_here';
    const signature = crypto
      .createHmac('sha512', secretKey)
      .update(payloadString)
      .digest('hex');
    
    console.log('📋 Test payload:', {
      reference: testPayload.data.reference,
      amount: testPayload.data.amount / 100 + ' GHS',
      email: testPayload.data.customer.email
    });
    
    // Send webhook request
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': signature
      },
      body: payloadString
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Webhook test successful!');
      console.log('📤 Response:', result);
      console.log('');
      console.log('🎉 If this worked, your webhook should:');
      console.log('   - Create a ticket purchase in database');
      console.log('   - Send email to test@example.com');
      console.log('   - Send SMS to +233123456789');
    } else {
      console.error('❌ Webhook test failed!');
      console.error('📤 Response:', result);
      console.error('Status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.log('');
    console.log('💡 Make sure:');
    console.log('   - Your dev server is running (npm run dev)');
    console.log('   - PAYSTACK_SECRET_KEY is set in .env.local');
    console.log('   - Webhook URL is correct');
  }
}

// Run the test
testWebhook();
