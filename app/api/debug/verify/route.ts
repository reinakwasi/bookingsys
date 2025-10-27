import { NextRequest, NextResponse } from 'next/server'
import { HubtelService } from '@/lib/hubtel'

/**
 * Debug endpoint for payment verification
 * Helps troubleshoot verification issues
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference') || 'TEST_REF_123';

    console.log('🔧 DEBUG: Starting verification test for:', reference);

    // Test 1: Configuration validation
    console.log('🔧 DEBUG: Testing configuration...');
    const configValidation = HubtelService.validateConfiguration();
    console.log('🔧 DEBUG: Configuration result:', configValidation);

    if (!configValidation.isValid) {
      return NextResponse.json({
        step: 'configuration',
        success: false,
        error: 'Configuration invalid',
        details: configValidation
      });
    }

    // Test 2: Call Hubtel service
    console.log('🔧 DEBUG: Calling Hubtel service...');
    const result = await HubtelService.checkTransactionStatus(reference);
    console.log('🔧 DEBUG: Hubtel service result:', JSON.stringify(result, null, 2));

    // Test 3: Process result
    console.log('🔧 DEBUG: Processing result...');
    
    return NextResponse.json({
      step: 'complete',
      success: true,
      hubtelResult: result,
      analysis: {
        hasSuccess: 'success' in result,
        successValue: result.success,
        hasResponseCode: 'responseCode' in result,
        responseCode: result.responseCode,
        hasError: 'error' in result,
        errorValue: result.error,
        hasData: 'data' in result,
        dataKeys: result.data ? Object.keys(result.data) : null
      }
    });

  } catch (error) {
    console.error('🔧 DEBUG: Exception occurred:', error);
    return NextResponse.json({
      step: 'exception',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();
    
    if (!reference) {
      return NextResponse.json({
        success: false,
        error: 'Reference is required'
      }, { status: 400 });
    }

    console.log('🔧 DEBUG POST: Testing verification for:', reference);

    // Same logic as the real verify endpoint
    const configValidation = HubtelService.validateConfiguration();
    if (!configValidation.isValid) {
      return NextResponse.json({
        step: 'configuration',
        success: false,
        error: `Hubtel not configured: ${configValidation.issues.join(', ')}`,
        isPaid: false,
        responseCode: 'CONFIG_ERROR'
      });
    }

    const result = await HubtelService.checkTransactionStatus(reference);
    console.log('🔧 DEBUG POST: Hubtel result:', JSON.stringify(result, null, 2));

    // Return the exact same structure as the real endpoint
    if (!result.success && result.responseCode === 'IP_NOT_WHITELISTED') {
      return NextResponse.json({
        success: false,
        error: 'Payment verification failed: Server IP not whitelisted with Hubtel',
        responseCode: 'IP_NOT_WHITELISTED',
        isPaid: false,
        note: 'Contact Hubtel support to whitelist your server IP address for payment verification.'
      }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Payment verification failed',
        responseCode: result.responseCode,
        isPaid: false
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      status: result.data?.status,
      isPaid: result.data?.status === 'Paid'
    });

  } catch (error) {
    console.error('🔧 DEBUG POST: Exception:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Payment verification failed',
      isPaid: false
    }, { status: 500 });
  }
}
