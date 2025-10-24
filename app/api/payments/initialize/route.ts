import { NextRequest, NextResponse } from 'next/server'
import { HubtelService } from '@/lib/hubtel'
import { supabase } from '@/lib/supabase'

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

    // Store pending payment in database so callback can access it
    console.log('🔍 Storing pending payment in database...');
    try {
      const { data: pendingPayment, error: pendingError } = await supabase
        .from('pending_payments')
        .insert({
          client_reference: clientReference,
          ticket_id: metadata?.ticket_id,
          ticket_title: metadata?.ticket_title,
          quantity: metadata?.quantity,
          total_amount: amount,
          customer_name: metadata?.customer_name,
          customer_email: metadata?.customer_email,
          customer_phone: metadata?.customer_phone,
          status: 'pending'
        })
        .select()
        .single();
      
      if (pendingError) {
        console.error('❌ Failed to store pending payment:', pendingError);
      } else {
        console.log('✅ Pending payment stored:', pendingPayment.id);
      }
    } catch (dbError) {
      console.error('❌ Database error storing pending payment:', dbError);
    }

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
    
    // Get credentials for SDK (safe to send since it's over HTTPS)
    const apiId = process.env.NEXT_PUBLIC_HUBTEL_API_ID;
    const apiKey = process.env.HUBTEL_API_KEY;
    const merchantAccount = process.env.NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT;
    
    // Create Basic Auth for SDK
    const basicAuth = Buffer.from(`${apiId}:${apiKey}`).toString('base64');
    
    console.log('📤 Sending response:', {
      success: true,
      checkoutUrl: result.data?.checkoutUrl,
      checkoutDirectUrl: result.data?.checkoutDirectUrl,
      checkoutId: result.data?.checkoutId,
      clientReference: result.data?.clientReference,
      merchantAccount: merchantAccount,
      hasBasicAuth: !!basicAuth
    });
    
    return NextResponse.json({
      success: true,
      data: result.data,
      checkoutUrl: result.data?.checkoutUrl,
      checkoutDirectUrl: result.data?.checkoutDirectUrl,
      checkoutId: result.data?.checkoutId,
      clientReference: result.data?.clientReference,
      basicAuth: basicAuth, // For SDK usage
      merchantAccount: parseInt(merchantAccount || '0') // For SDK usage
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
