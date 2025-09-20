import { NextRequest, NextResponse } from 'next/server';
import { emailAPI } from '@/lib/emailAPI';
import { smsAPI } from '@/lib/smsAPI';

export async function POST(request: NextRequest) {
  try {
    const { email, phone, testType } = await request.json();
    
    const results = {
      email: { sent: false, error: null as string | null },
      sms: { sent: false, error: null as string | null }
    };

    // Test email if provided
    if (email && (testType === 'email' || testType === 'both')) {
      try {
        await emailAPI.sendEmail({
          to: email,
          subject: 'Hotel 734 - Email Test',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #C49B66, #FFD700); padding: 30px; text-align: center;">
                <h1 style="color: #1a233b; margin: 0;">Hotel 734</h1>
                <p style="color: #1a233b; margin: 10px 0 0 0;">Email Test Successful!</p>
              </div>
              <div style="padding: 30px;">
                <p>This is a test email to verify your SMTP configuration is working correctly.</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              </div>
            </div>
          `,
          text: `Hotel 734 - Email Test\n\nThis is a test email to verify your SMTP configuration is working correctly.\n\nTime: ${new Date().toLocaleString()}`
        });
        results.email.sent = true;
      } catch (error: any) {
        results.email.error = error.message;
      }
    }

    // Test SMS if provided
    if (phone && (testType === 'sms' || testType === 'both')) {
      try {
        await smsAPI.sendSMS({
          to: phone,
          message: `🏨 Hotel 734 SMS Test\n\nYour SMS configuration is working correctly!\n\nTime: ${new Date().toLocaleString()}`
        });
        results.sms.sent = true;
      } catch (error: any) {
        results.sms.error = error.message;
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Test completed'
    });

  } catch (error: any) {
    console.error('❌ Test notification error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error.message
    }, { status: 500 });
  }
}
