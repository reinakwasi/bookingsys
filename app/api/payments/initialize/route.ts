import { NextRequest, NextResponse } from 'next/server'
import { HubtelService } from '@/lib/hubtel'

export async function POST(request: NextRequest) {
  try {
    console.log('💳 Payment initialization request received');
    const { amount, email, metadata, customerName, customerPhone } = await request.json()
    console.log('📋 Request data:', { amount, email, customerName, customerPhone, metadata });

    if (!amount) {
      console.error('❌ Missing required field: amount');
      return NextResponse.json(
        { success: false, error: 'Amount is required' },
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

    // Generate unique client reference (max 32 chars for Hubtel)
    const clientReference = metadata?.reference || HubtelService.generateClientReference();

    // Initialize payment with Hubtel
    const paymentData = {
      totalAmount: amount,
      description: metadata?.description || `Payment for ${metadata?.ticket_title || 'Hotel 734 Service'}`,
      clientReference: clientReference,
      payeeName: customerName,
      payeeMobileNumber: customerPhone,
      payeeEmail: email,
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
      checkoutId: result.data?.checkoutId,
      clientReference: result.data?.clientReference
    });
    
    return NextResponse.json({
      success: true,
      data: result.data,
      authorization_url: result.data?.checkoutUrl, // For compatibility
      checkoutUrl: result.data?.checkoutUrl, // Redirect URL
      checkoutDirectUrl: result.data?.checkoutDirectUrl, // Onsite/iframe URL
      checkoutId: result.data?.checkoutId,
      reference: result.data?.clientReference
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
