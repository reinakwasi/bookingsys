import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    console.log('📱 SMS request received:', {
      to: to.substring(0, 8) + '***',
      messageLength: message.length,
      provider: 'BulkSMS Ghana'
    });

    // BulkSMS Ghana API configuration
    const BULKSMS_API_KEY = '2887bf87-85f2-4bd9-81a5-49578ad12f02';
    const BULKSMS_SENDER_ID = 'HOTEL 734';
    const BULKSMS_URL = 'https://clientlogin.bulksmsgh.com/smsapi';

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

    // Send SMS request
    const response = await fetch(`${BULKSMS_URL}?${smsParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

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
      console.error('❌ SMS sending failed:', responseText);
      
      return NextResponse.json({
        success: false,
        error: 'SMS sending failed',
        details: responseText,
        provider: 'BulkSMS Ghana'
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ SMS API error:', error);
    return NextResponse.json({
      success: false,
      error: 'SMS API error',
      details: error.message,
      provider: 'BulkSMS Ghana'
    }, { status: 500 });
  }
}
