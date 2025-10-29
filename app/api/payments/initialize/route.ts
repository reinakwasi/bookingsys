import { NextRequest, NextResponse } from 'next/server'
import { PaystackService } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  try {
    console.log('💳 Payment initialization request received');
    const { amount, email, metadata, customerName, customerPhone } = await request.json()
    console.log('📋 Request data:', { amount, email, customerName, customerPhone, metadata });

    if (!amount || !customerPhone) {
      console.error('❌ Missing required fields:', { amount: !!amount, customerPhone: !!customerPhone });
      return NextResponse.json(
        { success: false, error: 'Amount and customer phone are required' },
        { status: 400 }
      )
    }

    // Validate Paystack configuration
    const configValidation = PaystackService.validateConfiguration();
    if (!configValidation.isValid) {
      console.error('❌ Paystack configuration error:', configValidation.issues);
      return NextResponse.json(
        { success: false, error: `Paystack not configured: ${configValidation.issues.join(', ')}` },
        { status: 500 }
      )
    }

    // Generate unique reference for Paystack
    const reference = metadata?.reference || PaystackService.generateReference();

    // Initialize payment with Paystack
    const paymentData = {
      amount: amount,
      email: email,
      reference: reference,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success?reference=${reference}`,
      metadata: {
        ...metadata,
        customer_name: customerName,
        customer_phone: customerPhone
      }
    };

    console.log('🚀 Initializing Paystack payment...');
    const result = await PaystackService.initializePayment(paymentData);

    if (!result.success) {
      console.error('❌ Paystack initialization failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Payment initialization failed' },
        { status: 400 }
      )
    }

    console.log('✅ Paystack payment initialized successfully');
    
    console.log('📤 Sending response:', {
      success: true,
      authorization_url: result.data?.authorization_url,
      access_code: result.data?.access_code,
      reference: result.data?.reference
    });
    
    return NextResponse.json({
      success: true,
      data: result.data,
      authorization_url: result.data?.authorization_url,
      access_code: result.data?.access_code,
      reference: result.data?.reference
    })

  } catch (error) {
    console.error('❌ Payment initialization error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
