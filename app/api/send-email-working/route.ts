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

    // Try multiple SMTP configurations for better reliability
    const smtpConfigs = [
      {
        name: 'Port 465 (SSL)',
        config: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 20000,
          tls: { rejectUnauthorized: false }
        }
      },
      {
        name: 'Port 587 (TLS)',
        config: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 20000,
          requireTLS: true,
          tls: { rejectUnauthorized: false }
        }
      }
    ];

    let lastError: any = null;
    
    // Try each SMTP configuration
    for (const { name, config } of smtpConfigs) {
      try {
        console.log(`📧 Attempting to send email via ${name}...`);
        
        const transporter = nodemailer.createTransport(config);
        
        const info = await Promise.race([
          transporter.sendMail({
            from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
            to,
            subject,
            text,
            html
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Email sending timeout after 20 seconds (${name})`)), 20000)
          )
        ]) as any;
        
        console.log(`✅ Email sent successfully via ${name}:`, info);
        
        return NextResponse.json({
          success: true,
          messageId: info?.messageId || 'unknown',
          provider: `gmail-smtp-${name}`,
          debug: info
        });
        
      } catch (error: any) {
        console.error(`❌ Failed to send via ${name}:`, error.message);
        lastError = error;
        // Continue to next configuration
      }
    }
    
    // If all configurations failed, throw the last error
    throw lastError || new Error('All SMTP configurations failed');

  } catch (error: any) {
    console.error('❌ Email API error:', error);
    
    // Provide specific error messages for common Gmail SMTP issues
    let errorMessage = 'Email delivery failed';
    let troubleshooting: string[] = [];
    
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      errorMessage = 'Gmail SMTP connection timeout - tried both port 465 and 587';
      troubleshooting = [
        '🔑 CRITICAL: Verify Gmail App Password is correctly set in .env.local',
        '🔐 Ensure 2-Factor Authentication is ENABLED on Gmail account',
        '🌐 Check if your network/firewall blocks SMTP connections',
        '📧 Verify SMTP_USER email matches the Gmail account',
        '🔄 Try regenerating a new Gmail App Password',
        '💡 Test with a simple email client to verify credentials work'
      ];
    } else if (error.code === 'EAUTH' || error.message?.includes('authentication') || error.message?.includes('Invalid login')) {
      errorMessage = 'Gmail authentication failed - credentials rejected';
      troubleshooting = [
        '🔑 VERIFY: You must use Gmail App Password, NOT your regular Gmail password',
        '🔐 REQUIRED: 2-Factor Authentication must be enabled on Gmail',
        '📝 Steps: Google Account → Security → 2-Step Verification → App Passwords',
        '🔄 Generate new 16-character app password for "Mail"',
        '✅ Copy the app password to SMTP_PASS in .env.local (no spaces)',
        '⚠️ Regular Gmail password will NOT work - must be App Password'
      ];
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Gmail SMTP server connection refused';
      troubleshooting = [
        '🌐 Check your internet connection',
        '🔥 Verify firewall allows outbound connections to smtp.gmail.com',
        '🚫 Check if antivirus is blocking SMTP connections',
        '🔌 Try disabling VPN if you are using one',
        '📡 Verify DNS can resolve smtp.gmail.com'
      ];
    } else if (error.message?.includes('SMTP')) {
      errorMessage = 'SMTP configuration error';
      troubleshooting = [
        '📧 Verify SMTP_USER is set to your Gmail address',
        '🔑 Verify SMTP_PASS is set to your Gmail App Password',
        '✉️ Verify FROM_EMAIL matches your Gmail address',
        '🔄 Restart your development server after changing .env.local',
        '📝 Check .env.local file exists and has correct format'
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