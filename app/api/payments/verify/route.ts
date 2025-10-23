import { NextRequest, NextResponse } from 'next/server'
import { HubtelService } from '@/lib/hubtel'

/**
 * Hubtel Payment Verification Endpoint
 * Checks the status of a transaction using client reference
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Payment verification request received');
    const { reference, clientReference } = await request.json()
    
    // Use clientReference if provided, otherwise use reference
    const refToCheck = clientReference || reference;

    if (!refToCheck) {
      console.error('❌ Missing reference');
      return NextResponse.json(
        { error: 'Client reference is required' },
        { status: 400 }
      )
    }

    // Validate Hubtel configuration
    const configValidation = HubtelService.validateConfiguration();
    if (!configValidation.isValid) {
      console.error('❌ Hubtel configuration error:', configValidation.issues);
      return NextResponse.json(
        { error: `Hubtel not configured: ${configValidation.issues.join(', ')}` },
        { status: 500 }
      )
    }

    console.log('🔍 Checking transaction status for:', refToCheck);
    const result = await HubtelService.checkTransactionStatus(refToCheck);

    if (!result.success) {
      console.error('❌ Verification failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Payment verification failed' },
        { status: 400 }
      )
    }

    console.log('✅ Payment verified:', {
      status: result.data?.status,
      amount: result.data?.amount,
      paymentMethod: result.data?.paymentMethod
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      status: result.data?.status,
      isPaid: result.data?.status === 'Paid'
    })

  } catch (error) {
    console.error('❌ Payment verification error:', error)
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

// Also support GET for direct status checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientReference = searchParams.get('clientReference') || searchParams.get('reference');

    if (!clientReference) {
      return NextResponse.json(
        { error: 'Client reference is required' },
        { status: 400 }
      )
    }

    const result = await HubtelService.checkTransactionStatus(clientReference);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Status check failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      status: result.data?.status,
      isPaid: result.data?.status === 'Paid'
    })

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
