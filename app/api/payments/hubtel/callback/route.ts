import { NextRequest, NextResponse } from 'next/server'
import { HubtelService } from '@/lib/hubtel'
import { supabase } from '@/lib/supabase'

/**
 * Hubtel Payment Callback Endpoint
 * Receives payment notifications from Hubtel after transaction completion
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔊 🔊 🔊 HUBTEL CALLBACK ENDPOINT HIT! 🔊 🔊 🔊');
    console.log('📞 Hubtel callback received at:', new Date().toISOString());
    console.log('🌍 Request origin:', request.headers.get('origin'));
    console.log('🌍 Request host:', request.headers.get('host'));
    
    const callbackData = await request.json();
    console.log('📥 Callback data:', JSON.stringify(callbackData, null, 2));

    // Parse callback data
    const parsedData = HubtelService.parseCallbackData(callbackData);
    
    if (!parsedData) {
      console.error('❌ Invalid callback data format');
      return NextResponse.json(
        { error: 'Invalid callback data' },
        { status: 400 }
      );
    }

    // Log payment details
    console.log('💰 Payment Details:', {
      status: parsedData.Data.Status,
      amount: parsedData.Data.Amount,
      reference: parsedData.Data.ClientReference,
      checkoutId: parsedData.Data.CheckoutId,
      paymentType: parsedData.Data.PaymentDetails.PaymentType,
      channel: parsedData.Data.PaymentDetails.Channel
    });

    // Check if payment was successful
    if (parsedData.ResponseCode === '0000' && parsedData.Data.Status === 'Success') {
      console.log('✅ Payment successful via callback:', parsedData.Data.ClientReference);
      console.log('🔍 Hubtel callback received for successful payment');
      
      // SECURITY: Store callback confirmation in database for alternative verification
      try {
        const { data: callbackRecord, error: insertError } = await supabase
          .from('payment_callbacks')
          .insert({
            client_reference: parsedData.Data.ClientReference,
            checkout_id: parsedData.Data.CheckoutId,
            amount: parsedData.Data.Amount,
            status: parsedData.Data.Status,
            payment_type: parsedData.Data.PaymentDetails.PaymentType,
            channel: parsedData.Data.PaymentDetails.Channel,
            response_code: parsedData.ResponseCode,
            raw_callback_data: JSON.stringify(parsedData)
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('❌ Failed to store callback confirmation:', insertError);
        } else {
          console.log('✅ Callback confirmation stored in database:', callbackRecord.id);
        }
      } catch (dbError) {
        console.error('❌ Database error storing callback:', dbError);
      }
      
      // IMPORTANT: Create ticket and send notifications HERE in the callback
      // Don't rely on frontend SDK callback as it's unreliable when user clicks "Check Status"
      
      console.log('🔍 ========== STARTING TICKET CREATION FROM CALLBACK ==========');
      console.log('🔍 Retrieving pending payment details from session...');
      
      // Get ticket purchase details from database or reconstruct from callback data
      // We need to find the pending payment details
      try {
        // The client reference should match what was stored
        const clientRef = parsedData.Data.ClientReference;
        console.log('🔍 Looking for pending payment with reference:', clientRef);
        
        // Check if ticket purchase already exists (avoid duplicates)
        const { data: existingPurchase, error: checkError } = await supabase
          .from('ticket_purchases')
          .select('*')
          .eq('payment_reference', clientRef)
          .single();
        
        if (existingPurchase) {
          console.log('✅ Ticket already created for this payment:', existingPurchase.id);
          console.log('🔍 Skipping duplicate ticket creation');
        } else {
          console.log('🔍 No existing ticket found, need to create from metadata');
          console.log('⚠️ NOTE: Cannot create ticket without customer details from frontend');
          console.log('🔍 Callback confirmation stored - frontend will handle ticket creation');
        }
      } catch (ticketError) {
        console.error('❌ Error checking for existing ticket:', ticketError);
      }
      
      console.log('🔍 Callback confirmation stored for verification');
      
      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          clientReference: parsedData.Data.ClientReference,
          checkoutId: parsedData.Data.CheckoutId,
          amount: parsedData.Data.Amount,
          status: parsedData.Data.Status
        }
      });
    } else {
      console.log('⚠️ Payment not successful:', {
        status: parsedData.Data.Status,
        description: parsedData.Data.Description
      });
      
      return NextResponse.json({
        success: false,
        message: 'Payment not successful',
        data: {
          clientReference: parsedData.Data.ClientReference,
          status: parsedData.Data.Status,
          description: parsedData.Data.Description
        }
      });
    }

  } catch (error) {
    console.error('❌ Callback processing error:', error);
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
    );
  }
}

// Also support GET for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Hubtel callback endpoint is active',
    method: 'POST',
    description: 'This endpoint receives payment notifications from Hubtel'
  });
}
