import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { ticketPurchasesAPI } from '@/lib/api'

/**
 * Paystack Webhook Handler
 * Automatically processes successful payments and sends notifications
 * This eliminates the need for manual payment verification
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Paystack webhook received');
    
    // Get the raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')
    
    if (!signature) {
      console.error('❌ Missing Paystack signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) {
      console.error('❌ Paystack secret key not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      console.error('❌ Invalid Paystack signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('✅ Paystack signature verified');

    // Parse the webhook payload
    const event = JSON.parse(body)
    console.log('📋 Webhook event:', {
      event: event.event,
      reference: event.data?.reference,
      status: event.data?.status,
      amount: event.data?.amount
    });

    // Only process successful charge events
    if (event.event === 'charge.success' && event.data?.status === 'success') {
      const paymentData = event.data
      const reference = paymentData.reference
      const customerEmail = paymentData.customer?.email
      const amountPaid = paymentData.amount / 100 // Convert from pesewas to cedis

      console.log('💰 Processing successful payment:', {
        reference,
        email: customerEmail,
        amount: amountPaid
      });

      // Extract ticket information from metadata
      const metadata = paymentData.metadata || {}
      const ticketId = metadata.ticket_id
      const quantity = metadata.quantity || 1
      const customerName = metadata.customer_name || 'Customer'
      const customerPhone = metadata.customer_phone

      if (!ticketId) {
        console.error('❌ Missing ticket_id in payment metadata');
        return NextResponse.json({ error: 'Missing ticket information' }, { status: 400 })
      }

      try {
        // Create the ticket purchase
        console.log('🎫 Creating ticket purchase...');
        const purchaseData = {
          ticket_id: ticketId,
          quantity: quantity,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          payment_reference: reference,
          payment_method: paymentData.channel || 'paystack',
          total_amount: amountPaid,
          payment_status: 'completed'
        }

        const purchase = await ticketPurchasesAPI.create(purchaseData)
        console.log('✅ Ticket purchase created:', purchase.id);

        // Send email notification
        if (customerEmail) {
          console.log('📧 Sending email notification...');
          try {
            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-ticket-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: customerEmail,
                customerName: customerName,
                ticketDetails: {
                  id: purchase.id,
                  reference: reference,
                  quantity: quantity,
                  amount: amountPaid
                }
              })
            })

            if (emailResponse.ok) {
              console.log('✅ Email sent successfully');
            } else {
              console.error('❌ Email sending failed:', await emailResponse.text());
            }
          } catch (emailError) {
            console.error('❌ Email sending error:', emailError);
          }
        }

        // Send SMS notification
        if (customerPhone) {
          console.log('📱 Sending SMS notification...');
          try {
            const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-sms`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                phone: customerPhone,
                message: `🎫 Hotel 734 Ticket Confirmed!\n\nReference: ${reference}\nQuantity: ${quantity}\nAmount: GH₵${amountPaid}\n\nView your tickets: ${process.env.NEXT_PUBLIC_SITE_URL}/my-tickets\n\nThank you!`
              })
            })

            if (smsResponse.ok) {
              console.log('✅ SMS sent successfully');
            } else {
              console.error('❌ SMS sending failed:', await smsResponse.text());
            }
          } catch (smsError) {
            console.error('❌ SMS sending error:', smsError);
          }
        }

        console.log('🎉 Payment processing completed successfully');
        return NextResponse.json({ 
          success: true, 
          message: 'Payment processed successfully',
          purchase_id: purchase.id
        })

      } catch (purchaseError) {
        console.error('❌ Error creating ticket purchase:', purchaseError);
        return NextResponse.json({ 
          error: 'Failed to create ticket purchase',
          details: purchaseError instanceof Error ? purchaseError.message : 'Unknown error'
        }, { status: 500 })
      }
    } else {
      console.log('ℹ️ Ignoring non-success event:', event.event);
      return NextResponse.json({ message: 'Event ignored' })
    }

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle GET requests (for webhook URL verification)
export async function GET() {
  return NextResponse.json({ 
    message: 'Paystack webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}
