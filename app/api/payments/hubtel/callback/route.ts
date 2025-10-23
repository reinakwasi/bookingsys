import { NextRequest, NextResponse } from 'next/server'
import { HubtelService } from '@/lib/hubtel'

/**
 * Hubtel Payment Callback Endpoint
 * Receives payment notifications from Hubtel after transaction completion
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📞 Hubtel callback received');
    
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
      console.log('✅ Payment successful:', parsedData.Data.ClientReference);
      
      // Here you can add logic to:
      // 1. Update ticket purchase record in database
      // 2. Send confirmation email/SMS
      // 3. Generate QR codes
      // 4. Update inventory
      
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
