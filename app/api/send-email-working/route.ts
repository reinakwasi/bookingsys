import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json();

    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
    const FROM_NAME = process.env.FROM_NAME || 'Hotel 734';

    if (!SMTP_USER || !SMTP_PASS) {
      return NextResponse.json({
        error: 'SMTP credentials not configured'
      }, { status: 500 });
    }

    console.log('📧 Attempting to send email with these parameters:', {
      SMTP_USER,
      SMTP_PASS: SMTP_PASS ? '***' : 'MISSING',
      FROM_EMAIL,
      FROM_NAME,
      to,
      subject,
      text,
      html: html ? '[HTML CONTENT PRESENT]' : '[NO HTML CONTENT]'
    });

    // Use explicit SMTP settings instead of 'service: gmail' for better reliability
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      },
      connectionTimeout: 15000, // 15 seconds
      greetingTimeout: 15000,   // 15 seconds
      socketTimeout: 45000,     // 45 seconds
      requireTLS: true,
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });

    // Skip verification to avoid blocking - let sendMail handle connection
    console.log('📧 Attempting to send email directly...');

    const info = await Promise.race([
      transporter.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to,
        subject,
        text,
        html
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timeout after 30 seconds')), 30000)
      )
    ]) as any;

    console.log('📧 Nodemailer sendMail result:', info);

    return NextResponse.json({
      success: true,
      messageId: info?.messageId || 'unknown',
      provider: 'gmail-smtp',
      debug: info
    });
  } catch (error: any) {
    console.error('❌ Email API error:', error);
    
    // Provide specific error messages for common Gmail SMTP issues
    let errorMessage = 'Email delivery failed';
    let troubleshooting: string[] = [];
    
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      errorMessage = 'Gmail SMTP connection timeout';
      troubleshooting = [
        'Check if Gmail App Password is correctly configured',
        'Verify 2-Factor Authentication is enabled on Gmail account',
        'Ensure network allows SMTP connections on port 587',
        'Try using port 465 with secure: true instead'
      ];
    } else if (error.code === 'EAUTH' || error.message?.includes('authentication')) {
      errorMessage = 'Gmail authentication failed';
      troubleshooting = [
        'Verify Gmail App Password is correct (not regular password)',
        'Ensure 2-Factor Authentication is enabled',
        'Check if account has "Less secure app access" disabled (recommended)'
      ];
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Gmail SMTP server connection refused';
      troubleshooting = [
        'Check network connectivity',
        'Verify firewall allows outbound SMTP connections',
        'Try using different SMTP settings'
      ];
    }
    
    console.error('📧 Email troubleshooting tips:', troubleshooting);
    
    return NextResponse.json({
      error: errorMessage,
      details: error.message,
      code: error.code,
      troubleshooting,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}