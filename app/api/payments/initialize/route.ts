import { NextRequest, NextResponse } from 'next/server'
import { HubtelService } from '@/lib/hubtel'

export async function POST(request: NextRequest) {
  try {
    console.log('💳 Payment initialization request received');
    const { amount, description, metadata } = await request.json()
    console.log('📋 Request data:', { amount, description, metadata });

    if (!amount || !description) {
      console.error('❌ Missing required fields:', { amount: !!amount, description: !!description });
      return NextResponse.json(
        { success: false, error: 'Amount and description are required' },
        { status: 400 }
      )
    }

    // Validate Hubtel configuration
    const configValidation = HubtelService.validateConfiguration();
    if (!configValidation.isValid) {
      console.error('❌ Hubtel configuration error:', configValidation.issues);
      return NextResponse.json(
        { success: false, error: `Hubtel not configured: ${configValidation.issues.join(', ')}` },
        { status: 500 }
      )
    }

    // Generate unique client reference
    const clientReference = metadata?.clientReference || HubtelService.generateClientReference();

    // Initialize payment with Hubtel
    const paymentData = {
      totalAmount: amount,
      description: description,
      clientReference: clientReference,
      payeeName: metadata?.customer_name,
      payeeMobileNumber: metadata?.customer_phone,
      payeeEmail: metadata?.customer_email,
      metadata: metadata
    };

    console.log('🚀 Initializing Hubtel payment...');
    const result = await HubtelService.initializePayment(paymentData);

    if (!result.success) {
      console.error('❌ Hubtel initialization failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Payment initialization failed' },
        { status: 400 }
      )
    }

    console.log('✅ Hubtel payment initialized successfully');
    console.log('📤 Sending response:', {
      success: true,
      checkoutUrl: result.data?.checkoutUrl,
      checkoutDirectUrl: result.data?.checkoutDirectUrl,
      checkoutId: result.data?.checkoutId,
      clientReference: result.data?.clientReference
    });
    
    return NextResponse.json({
      success: true,
      data: result.data,
      checkoutUrl: result.data?.checkoutUrl,
      checkoutDirectUrl: result.data?.checkoutDirectUrl,
      checkoutId: result.data?.checkoutId,
      clientReference: result.data?.clientReference
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
