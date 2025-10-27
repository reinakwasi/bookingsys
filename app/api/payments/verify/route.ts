import { NextRequest, NextResponse } from 'next/server'
import { PaystackService } from '@/lib/paystack'

/**
 * Hubtel Payment Verification Endpoint
 * Checks the status of a transaction using client reference
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Payment verification request received');
    const { reference } = await request.json()

    if (!reference) {
      console.error('❌ Missing reference');
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    // Validate Hubtel configuration
    const configValidation = PaystackService.validateConfiguration();
    if (!configValidation.isValid) {
      console.error('❌ Hubtel configuration error:', configValidation.issues);
      return NextResponse.json(
        { 
          success: false,
          error: `Hubtel not configured: ${configValidation.issues.join(', ')}`,
          isPaid: false,
          responseCode: 'CONFIG_ERROR'
        },
        { status: 500 }
      )
    }

    console.log('🔍 Verifying transaction:', reference);
    const result = await PaystackService.verifyPayment(reference);
    console.log('📋 Hubtel service returned:', JSON.stringify(result, null, 2));

    // Check if verification failed
    if (!result.success) {
      console.error('❌ Payment verification failed:', result.error);
      
      return NextResponse.json({
        success: false,
        error: result.error || 'Payment verification failed',
        isPaid: false
      });
    }

    console.log('📝 Payment status:', result.data?.status);
    console.log('💰 Amount:', result.data?.amount);
    console.log('💳 Payment channel:', result.data?.channel);
    
    const isPaid = result.isPaid || (result.data?.status === 'success');
    console.log(`${isPaid ? '✅' : '❌'} Payment status: ${isPaid ? 'PAID' : 'NOT PAID'}`);

    return NextResponse.json({
      success: result.success,
      isPaid: isPaid,
      data: result.data
    })

  } catch (error) {
    console.error('❌ Payment verification error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Payment verification failed',
      isPaid: false
    }, { status: 500 })
  }
}

// Also support GET for direct status checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    const result = await PaystackService.verifyPayment(reference);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Verification failed'
        },
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
    console.error('Verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
