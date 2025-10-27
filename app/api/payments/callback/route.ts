import { NextRequest, NextResponse } from 'next/server'
import { PaystackService } from '@/lib/paystack'

/**
 * Paystack Payment Callback Endpoint
 * Handles redirects from Paystack after payment completion
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref'); // Paystack also sends trxref

    const paymentReference = reference || trxref;

    if (!paymentReference) {
      console.error('❌ No payment reference in callback');
      return NextResponse.redirect(
        new URL('/tickets?payment=failed&error=no_reference', request.url)
      );
    }

    console.log('📞 Paystack callback received for reference:', paymentReference);

    // Verify the payment
    const result = await PaystackService.verifyPayment(paymentReference);

    if (!result.success || result.data?.status !== 'success') {
      console.error('❌ Payment verification failed:', result.error);
      return NextResponse.redirect(
        new URL(`/tickets?payment=failed&reference=${paymentReference}`, request.url)
      );
    }

    console.log('✅ Payment verified successfully');

    // Redirect to success page with reference
    return NextResponse.redirect(
      new URL(`/tickets?payment=success&reference=${paymentReference}`, request.url)
    );

  } catch (error) {
    console.error('❌ Callback processing error:', error);
    return NextResponse.redirect(
      new URL('/tickets?payment=failed&error=callback_error', request.url)
    );
  }
}
