import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    console.log('📱 SMS request received (simulation only):', {
      to,
      message: message.substring(0, 50) + '...',
      note: 'SMS services disabled - email notifications only'
    });

    // Simulate SMS sending for logging purposes only
    const messageId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('📱 SMS simulated successfully:', {
      to,
      messageId,
      note: 'SMS services removed - using email notifications only'
    });

    return NextResponse.json({
      success: true,
      messageId: messageId,
      provider: 'disabled',
      note: 'SMS services disabled - email notifications are used instead'
    });

  } catch (error: any) {
    console.error('❌ SMS API error:', error);
    return NextResponse.json({
      error: 'SMS API error',
      details: error.message
    }, { status: 500 });
  }
}
