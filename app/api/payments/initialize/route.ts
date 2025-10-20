import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Payment initialization request received');
    const { email, amount, metadata } = await request.json()
    console.log('Request data:', { email, amount, metadata });

    if (!email || !amount) {
      console.error('Missing required fields:', { email: !!email, amount: !!amount });
      return NextResponse.json(
        { error: 'Email and amount are required' },
        { status: 400 }
      )
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    console.log('Paystack secret key configured:', !!paystackSecretKey);
    
    if (!paystackSecretKey) {
      console.error('Paystack secret key not found in environment variables');
      return NextResponse.json(
        { error: 'Paystack secret key not configured' },
        { status: 500 }
      )
    }

    // Initialize payment with Paystack
    const payloadData = {
      email,
      amount: amount * 100, // Convert to kobo (Paystack uses kobo)
      currency: 'GHS', // Ghana Cedis
      metadata: {
        ...metadata,
        custom_fields: [
          {
            display_name: "Hotel 734 Ticket Purchase",
            variable_name: "ticket_purchase",
            value: "true"
          }
        ],
        cancel_action: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hotel734.com'}/tickets`
      },
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hotel734.com'}/tickets?payment=success`,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    };
    
    console.log('Sending to Paystack:', payloadData);
    
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadData),
    })

    console.log('Paystack response status:', response.status);
    const data = await response.json()
    console.log('Paystack response data:', data);

    if (!response.ok) {
      console.error('Paystack initialization error:', data)
      return NextResponse.json(
        { error: data.message || 'Payment initialization failed' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: data.data,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference
    })

  } catch (error) {
    console.error('Payment initialization error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
