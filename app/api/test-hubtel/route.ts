import { NextRequest, NextResponse } from 'next/server'

/**
 * Test endpoint to verify Hubtel credentials
 * Access at: http://localhost:3000/api/test-hubtel
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Hubtel credentials...');

    // Check environment variables
    const apiId = process.env.NEXT_PUBLIC_HUBTEL_API_ID;
    const apiKey = process.env.HUBTEL_API_KEY;
    const merchantAccount = process.env.NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT;

    const envCheck = {
      hasApiId: !!apiId,
      hasApiKey: !!apiKey,
      hasMerchantAccount: !!merchantAccount,
      apiIdLength: apiId?.length || 0,
      apiKeyLength: apiKey?.length || 0,
      merchantAccountLength: merchantAccount?.length || 0,
      apiIdPreview: apiId ? `${apiId.substring(0, 3)}***` : 'MISSING',
      merchantAccountPreview: merchantAccount ? `${merchantAccount.substring(0, 3)}***` : 'MISSING'
    };

    console.log('📋 Environment variables check:', envCheck);

    if (!apiId || !apiKey || !merchantAccount) {
      return NextResponse.json({
        success: false,
        error: 'Missing Hubtel credentials in environment variables',
        details: envCheck
      }, { status: 500 });
    }

    // Create Basic Auth header
    const credentials = `${apiId}:${apiKey}`;
    const authHeader = `Basic ${Buffer.from(credentials).toString('base64')}`;

    console.log('🔐 Auth header created (length):', authHeader.length);

    // Test payload
    const testPayload = {
      totalAmount: 1,
      description: 'Test Payment - Credential Verification',
      callbackUrl: 'http://localhost:3000/api/payments/hubtel/callback',
      returnUrl: 'http://localhost:3000/tickets',
      merchantAccountNumber: merchantAccount,
      cancellationUrl: 'http://localhost:3000/tickets',
      clientReference: `TEST_${Date.now()}`
    };

    console.log('📤 Sending test request to Hubtel...');
    console.log('📋 Payload:', { ...testPayload, merchantAccountNumber: '***' });

    // Make test request to Hubtel
    const response = await fetch('https://payproxyapi.hubtel.com/items/initiate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📡 Hubtel response status:', response.status, response.statusText);

    // Get response text first
    const responseText = await response.text();
    console.log('📥 Raw response:', responseText);

    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }

    // Return detailed results
    return NextResponse.json({
      success: response.ok,
      testResults: {
        environmentVariables: envCheck,
        httpStatus: response.status,
        httpStatusText: response.statusText,
        responseData: responseData,
        rawResponse: responseText.substring(0, 500), // First 500 chars
        authHeaderLength: authHeader.length
      },
      message: response.ok 
        ? '✅ Credentials are valid! Hubtel API is accessible.'
        : '❌ Credentials test failed. See details above.',
      nextSteps: response.ok
        ? 'Your Hubtel credentials are working! You can now process payments.'
        : response.status === 401
          ? 'CREDENTIALS INVALID: Contact Hubtel support to verify your API ID, API Key, and merchant account.'
          : response.status === 400
            ? 'BAD REQUEST: The request format might be incorrect. Contact Hubtel support.'
            : 'API ERROR: Hubtel API might be down or there\'s a network issue.'
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed with exception',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
