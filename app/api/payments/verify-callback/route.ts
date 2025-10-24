import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Verify payment via Hubtel callback confirmation
 * This is used as an alternative when the main status check API fails due to IP whitelisting
 */
export async function POST(request: NextRequest) {
  try {
    const { clientReference } = await request.json();
    
    if (!clientReference) {
      return NextResponse.json(
        { error: 'Client reference is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking callback confirmation for:', clientReference);

    // Check if we have a callback confirmation record for this payment
    const { data: callbackRecord, error } = await supabase
      .from('payment_callbacks')
      .select('*')
      .eq('client_reference', clientReference)
      .eq('status', 'Success')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Database error checking callback:', error);
      return NextResponse.json(
        { error: 'Database error checking callback confirmation' },
        { status: 500 }
      );
    }

    if (callbackRecord) {
      console.log('✅ Callback confirmation found:', {
        reference: callbackRecord.client_reference,
        amount: callbackRecord.amount,
        timestamp: callbackRecord.created_at
      });

      return NextResponse.json({
        success: true,
        confirmed: true,
        data: {
          clientReference: callbackRecord.client_reference,
          amount: callbackRecord.amount,
          checkoutId: callbackRecord.checkout_id,
          timestamp: callbackRecord.created_at,
          verificationMethod: 'callback'
        }
      });
    } else {
      console.log('❌ No callback confirmation found for:', clientReference);
      return NextResponse.json({
        success: true,
        confirmed: false,
        message: 'No callback confirmation found for this payment reference'
      });
    }

  } catch (error) {
    console.error('❌ Callback verification error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
