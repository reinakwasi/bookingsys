import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email address is required'
      }, { status: 400 });
    }

    console.log('🧪 Testing email to:', email);

    // Test email sending
    const emailResponse = await fetch('/api/send-ticket-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        purchase_id: 'TEST123',
        access_token: 'TEST1234',
        customer_email: email,
        customer_name: 'Test Customer',
        my_tickets_link: 'https://hotel734.com/my-tickets/TEST1234'
      })
    });

    const emailResult = await emailResponse.json();

    if (emailResult.success || emailResponse.ok) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        details: emailResult
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send test email',
        details: emailResult
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Test email error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test email API error',
      details: error.message
    }, { status: 500 });
  }
}
