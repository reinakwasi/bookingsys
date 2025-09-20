import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json();

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, and content' },
        { status: 400 }
      );
    }

    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
    const FROM_NAME = process.env.FROM_NAME || 'Hotel 734';

    if (!SMTP_USER || !SMTP_PASS) {
      return NextResponse.json(
        { error: `SMTP credentials missing. User: ${SMTP_USER ? 'SET' : 'MISSING'}, Pass: ${SMTP_PASS ? 'SET' : 'MISSING'}` },
        { status: 500 }
      );
    }

    // Use SMTPjs library via CDN (no npm install needed)
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://smtpjs.com/v3/smtp.js"></script>
      </head>
      <body>
        <script>
          Email.send({
            Host: "smtp.gmail.com",
            Username: "${SMTP_USER}",
            Password: "${SMTP_PASS}",
            To: "${to}",
            From: "${FROM_EMAIL}",
            Subject: "${subject}",
            Body: \`${html || text}\`
          }).then(
            message => console.log("Email sent:", message)
          );
        </script>
      </body>
      </html>
    `;

    // Use Web3Forms (free, no signup needed)
    const web3formsResponse = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: 'YOUR_ACCESS_KEY', // Get free key from web3forms.com
        from_name: FROM_NAME,
        from_email: FROM_EMAIL,
        to_email: to,
        subject: subject,
        message: html || text,
        email: FROM_EMAIL
      })
    });

    if (web3formsResponse.ok) {
      console.log('✅ Email sent via Web3Forms to:', to);
      return NextResponse.json({ 
        success: true, 
        messageId: `web3forms_${Date.now()}`,
        provider: 'web3forms'
      });
    }

    // Fallback: Use EmailJS (requires setup but works)
    const emailJSResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'service_gmail',
        template_id: 'template_reply', 
        user_id: 'your-emailjs-public-key',
        template_params: {
          to_email: to,
          from_name: FROM_NAME,
          from_email: FROM_EMAIL,
          subject: subject,
          message: html || text
        }
      })
    });

    if (emailJSResponse.ok) {
      console.log('✅ Email sent via EmailJS to:', to);
      return NextResponse.json({ 
        success: true, 
        messageId: `emailjs_${Date.now()}`,
        provider: 'emailjs'
      });
    }

    // If all services fail, log the email for manual sending
    console.log('📧 All email services failed. Email details:', {
      to,
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      subject,
      content: html || text,
      smtp_user: SMTP_USER,
      smtp_configured: !!SMTP_PASS
    });

    return NextResponse.json({ 
      success: false, 
      error: 'All email services failed',
      debug: {
        to,
        subject,
        smtp_user: SMTP_USER,
        smtp_configured: !!SMTP_PASS
      }
    }, { status: 500 });

  } catch (error: any) {
    console.error('❌ Email API error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
