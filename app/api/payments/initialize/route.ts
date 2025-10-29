import { NextRequest, NextResponse } from 'next/server'
import { PaystackService } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  try {
    console.log('💳 Payment initialization request received');
    const { amount, email, metadata, customerName, customerPhone } = await request.json()
    console.log('📋 Request data:', { amount, email, customerName, customerPhone, metadata });

    // More flexible validation - email is optional, phone is preferred but not strictly required
    if (!amount) {
      console.error('❌ Missing required field: amount');
      return NextResponse.json(
        { success: false, error: 'Amount is required' },
        { status: 400 }
      )
    }

    // Log detailed validation info
    console.log('🔍 Validation check:', {
      hasAmount: !!amount,
      hasEmail: !!email,
      hasCustomerName: !!customerName,
      hasCustomerPhone: !!customerPhone,
      emailValue: email,
      phoneValue: customerPhone
    });

    // Validate Paystack configuration
    console.log('🔧 Checking Paystack configuration...');
    const configValidation = PaystackService.validateConfiguration();
    console.log('📋 Config validation result:', configValidation);
    
    if (!configValidation.isValid) {
      console.error('❌ Paystack configuration error:', configValidation.issues);
      return NextResponse.json(
        { success: false, error: `Paystack not configured: ${configValidation.issues.join(', ')}` },
        { status: 400 }
      )
    }
    
    console.log('✅ Paystack configuration valid');

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
    console.log('📤 Payment data being sent to Paystack:', paymentData);
    
    const result = await PaystackService.initializePayment(paymentData);
    console.log('📥 Paystack service result:', result);

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
