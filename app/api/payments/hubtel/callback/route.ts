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
      console.log('🔍 Retrieving pending payment details from database...');
      
      try {
        const clientRef = parsedData.Data.ClientReference;
        console.log('🔍 Looking for pending payment with reference:', clientRef);
        
        // Check if ticket purchase already exists (avoid duplicates)
        const { data: existingPurchase } = await supabase
          .from('ticket_purchases')
          .select('*')
          .eq('payment_reference', clientRef)
          .single();
        
        if (existingPurchase) {
          console.log('✅ Ticket already created for this payment:', existingPurchase.id);
          console.log('🔍 Skipping duplicate ticket creation');
        } else {
          // Get pending payment details
          const { data: pendingPayment, error: pendingError } = await supabase
            .from('pending_payments')
            .select('*')
            .eq('client_reference', clientRef)
            .single();
          
          if (pendingError || !pendingPayment) {
            console.error('❌ No pending payment found:', pendingError);
            console.log('⚠️ Cannot create ticket without pending payment details');
          } else {
            console.log('✅ Pending payment found:', pendingPayment);
            console.log('🔍 Creating ticket purchase...');
            
            // Create ticket purchase using ticketPurchasesAPI
            const { ticketPurchasesAPI } = await import('@/lib/database');
            
            const purchaseData = {
              ticket_id: pendingPayment.ticket_id,
              customer_name: pendingPayment.customer_name,
              customer_email: pendingPayment.customer_email,
              customer_phone: pendingPayment.customer_phone,
              quantity: pendingPayment.quantity,
              total_amount: pendingPayment.total_amount,
              payment_status: 'completed' as const,
              payment_reference: clientRef,
              payment_method: 'hubtel'
            };
            
            console.log('🔍 Purchase data:', purchaseData);
            
            const purchase = await ticketPurchasesAPI.create(purchaseData);
            console.log('✅ Ticket created successfully:', purchase.id);
            console.log('✅ Email and SMS sent via ticketPurchasesAPI.create');
            
            // Update pending payment status
            await supabase
              .from('pending_payments')
              .update({ status: 'completed' })
              .eq('client_reference', clientRef);
            
            console.log('✅ Pending payment marked as completed');
          }
        }
      } catch (ticketError) {
        console.error('❌ Error creating ticket:', ticketError);
        console.error('🔍 Error details:', ticketError instanceof Error ? ticketError.message : 'Unknown');
      }
      
      console.log('🔍 Callback processing complete');
      
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
