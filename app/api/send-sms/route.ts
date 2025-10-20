import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    console.log('📱 SMS request received:', {
      to: to.substring(0, 8) + '***',
      messageLength: message.length,
      provider: 'BulkSMS Ghana'
    });

    // BulkSMS Ghana API configuration from environment variables
    const BULKSMS_API_KEY = process.env.BULKSMS_API_KEY || '2887bf87-85f2-4bd9-81a5-49578ad12f02';
    const BULKSMS_SENDER_ID = process.env.BULKSMS_SENDER_ID || 'HOTEL 734';
    const BULKSMS_URL = process.env.BULKSMS_URL || 'https://clientlogin.bulksmsgh.com/smsapi';

    if (!BULKSMS_API_KEY) {
      console.error('❌ BulkSMS API key not configured');
      return NextResponse.json({
        success: false,
        error: 'SMS service not configured',
        details: 'Missing BULKSMS_API_KEY environment variable'
      }, { status: 500 });
    }

    // Format phone number (ensure it starts with country code)
    let formattedPhone = to.replace(/\s+/g, ''); // Remove spaces
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '233' + formattedPhone.substring(1); // Convert 0xxx to 233xxx
    } else if (!formattedPhone.startsWith('233') && !formattedPhone.startsWith('+233')) {
      formattedPhone = '233' + formattedPhone; // Add country code if missing
    }
    formattedPhone = formattedPhone.replace('+', ''); // Remove + if present

    console.log('📱 Formatted phone:', formattedPhone.substring(0, 6) + '***');

    // Prepare SMS API request
    const smsParams = new URLSearchParams({
      key: BULKSMS_API_KEY,
      to: formattedPhone,
      msg: message,
      sender_id: BULKSMS_SENDER_ID
    });

    console.log('📱 Sending SMS via BulkSMS Ghana...');

    // Send SMS request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(`${BULKSMS_URL}?${smsParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const responseText = await response.text();
      console.log('📱 BulkSMS Response:', responseText);

      // Check if SMS was sent successfully
      // BulkSMS Ghana typically returns a message ID or success indicator
      if (response.ok && (responseText.includes('success') || responseText.includes('sent') || /^\d+$/.test(responseText.trim()))) {
        const messageId = responseText.trim() || `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('✅ SMS sent successfully:', {
          to: formattedPhone.substring(0, 6) + '***',
          messageId: messageId,
          provider: 'BulkSMS Ghana'
        });

        return NextResponse.json({
          success: true,
          messageId: messageId,
          provider: 'BulkSMS Ghana',
          to: formattedPhone
        });
      } else {
        console.error('❌ BulkSMS failed:', responseText);
        
        // Check if we're in development mode for fallback
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (isDevelopment) {
          // Fallback: Return success for development/testing only
          const fallbackMessageId = `dev_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          console.log('⚠️ Using SMS development fallback:', {
            to: formattedPhone.substring(0, 6) + '***',
            messageId: fallbackMessageId,
            provider: 'Development Fallback'
          });

          return NextResponse.json({
            success: true,
            messageId: fallbackMessageId,
            provider: 'Development Fallback',
            to: formattedPhone,
            note: 'SMS sent via development fallback (development mode only)'
          });
        } else {
          // Production: Return actual failure
          return NextResponse.json({
            success: false,
            error: 'SMS delivery failed',
            details: responseText,
            provider: 'BulkSMS Ghana'
          }, { status: 400 });
        }
      }

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      const errorType = fetchError.name === 'AbortError' ? 'timeout' : 'network';
      const errorMessage = fetchError.name === 'AbortError' 
        ? 'SMS request timeout after 15 seconds' 
        : `SMS network error: ${fetchError.message}`;
        
      console.error('❌', errorMessage);
      
      // Check if we're in development mode for fallback
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        // Use fallback simulation for development only
        const fallbackMessageId = `dev_${errorType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('⚠️ Using SMS development fallback due to', errorType + ':', {
          to: formattedPhone.substring(0, 6) + '***',
          messageId: fallbackMessageId,
          provider: 'Development Network Fallback'
        });

        return NextResponse.json({
          success: true,
          messageId: fallbackMessageId,
          provider: 'Development Network Fallback',
          to: formattedPhone,
          note: `SMS sent via development fallback due to ${errorType} (development mode only)`
        });
      } else {
        // Production: Return actual failure
        return NextResponse.json({
          success: false,
          error: errorMessage,
          errorType: errorType,
          provider: 'BulkSMS Ghana'
        }, { status: 500 });
      }
    }

  } catch (error: any) {
    console.error('❌ SMS API error:', error);
    
    // Check if we're in development mode for final fallback
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // Final fallback for development only
      const fallbackMessageId = `dev_final_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return NextResponse.json({
        success: true,
        messageId: fallbackMessageId,
        provider: 'Development Final Fallback',
        to: 'unknown',
        note: 'SMS sent via development final fallback (development mode only)'
      });
    } else {
      // Production: Return actual failure
      return NextResponse.json({
        success: false,
        error: 'SMS service error',
        details: error.message || 'Unknown SMS API error',
        provider: 'SMS Service'
      }, { status: 500 });
    }
  }
}
