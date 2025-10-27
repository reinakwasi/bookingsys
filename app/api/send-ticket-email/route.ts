import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { 
      purchase_id, 
      access_token, 
      customer_email, 
      customer_name, 
      ticket_title,
      quantity,
      total_amount,
      payment_reference,
      event_date,
      purchase_date,
      my_tickets_link 
    } = await request.json()

    console.log('📧 Email request data:', { 
      purchase_id, 
      access_token, 
      customer_email, 
      customer_name,
      ticket_title,
      quantity,
      total_amount
    });

    // Validate required parameters
    if (!access_token) {
      console.error('❌ Missing access_token for ticket email');
      return NextResponse.json(
        { error: 'Access token is required for ticket email' },
        { status: 400 }
      );
    }

    // Use the my_tickets_link if provided, otherwise generate the URL
    let ticketUrl;
    
    if (my_tickets_link) {
      ticketUrl = my_tickets_link;
      console.log('✅ Using provided my_tickets_link:', ticketUrl);
    } else {
      // Fallback to generating my-tickets URL
      let baseUrl;
      
      if (process.env.NEXT_PUBLIC_APP_URL) {
        baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      } else if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else {
        baseUrl = 'https://hotel734.com';
      }
      
      ticketUrl = `${baseUrl}/my-tickets/${access_token}`;
      console.log('⚠️ Using fallback URL generation:', ticketUrl);
    }
    
    console.log('🔗 Final ticket URL:', ticketUrl);
    
    // Check for required email credentials
    const emailUser = process.env.GMAIL_USER || process.env.SMTP_USER
    const emailPass = process.env.GMAIL_PASS || process.env.SMTP_PASS
    
    if (!emailUser || !emailPass) {
      console.error('❌ Email credentials missing. Please set GMAIL_USER and GMAIL_PASS in .env.local')
      return NextResponse.json(
        { 
          error: 'Email service not configured. Please contact administrator.',
          details: 'Missing GMAIL_USER or GMAIL_PASS environment variables'
        },
        { status: 500 }
      )
    }
    
    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    })

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #C49B66, #FFD700); padding: 30px; text-align: center;">
          <h1 style="color: #1a233b; margin: 0; font-size: 28px; font-weight: bold;">Hotel 734</h1>
          <p style="color: #1a233b; margin: 10px 0 0 0; font-size: 16px;">🎉 Ticket Purchase Confirmation</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #1a233b; margin-bottom: 20px;">Dear ${customer_name},</h2>
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            Thank you for purchasing tickets for <strong>${ticket_title || 'our event'}</strong>! Your payment has been confirmed and your tickets are ready.
          </p>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #C49B66;">
            <h3 style="color: #1a233b; margin: 0 0 15px 0; font-size: 18px;">🎫 Ticket Details</h3>
            <div style="display: grid; gap: 10px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                <span style="font-weight: bold; color: #666;">Event:</span>
                <span style="color: #1a233b; font-weight: bold;">${ticket_title || 'Event'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                <span style="font-weight: bold; color: #666;">Event Date:</span>
                <span style="color: #1a233b;">${event_date || 'TBA'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                <span style="font-weight: bold; color: #666;">Quantity:</span>
                <span style="color: #1a233b; font-weight: bold;">${quantity || 1} ticket${quantity > 1 ? 's' : ''}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                <span style="font-weight: bold; color: #666;">Total Amount:</span>
                <span style="color: #C49B66; font-weight: bold; font-size: 18px;">GHS ${total_amount ? total_amount.toFixed(2) : '0.00'}</span>
              </div>
              ${payment_reference ? `
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                <span style="font-weight: bold; color: #666;">Payment Reference:</span>
                <span style="color: #1a233b; font-family: monospace; font-size: 12px;">${payment_reference}</span>
              </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="font-weight: bold; color: #666;">Purchase Date:</span>
                <span style="color: #1a233b;">${purchase_date || new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <h4 style="color: #2E7D32; margin: 0 0 10px 0;">✅ Payment Successful!</h4>
            <p style="margin: 0; color: #333; line-height: 1.6;">
              Your payment has been processed successfully. Click the button below to view and download your tickets.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ticketUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #C49B66, #FFD700); color: #1a233b; padding: 15px 40px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              🎫 View My Tickets
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin: 0 0 10px 0;">📱 What's Next?</h4>
            <ul style="margin: 0; padding-left: 20px; color: #333;">
              <li>Visit the "My Tickets" page to view your tickets</li>
              <li>Download or screenshot your tickets with QR codes</li>
              <li>Present your QR code at the event entrance</li>
              <li>Arrive early to ensure smooth entry</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #1a233b; padding: 30px; text-align: center;">
          <h3 style="color: #C49B66; margin: 0 0 15px 0;">Contact Information</h3>
          <p style="color: #ffffff; margin: 5px 0; font-size: 14px;">📍 New Edubiase, Ashanti Region, Ghana</p>
          <p style="color: #ffffff; margin: 5px 0; font-size: 14px;">📞 0244093821</p>
          <p style="color: #ffffff; margin: 5px 0; font-size: 14px;">✉️ info@hotel734@gmail.com</p>
          <div style="margin-top: 20px;">
            <p style="color: #C49B66; margin: 0; font-size: 16px; font-weight: bold;">Hotel 734 Team</p>
            <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 12px;">Creating unforgettable experiences</p>
          </div>
        </div>
      </div>
    `

    // Send email using Gmail SMTP
    const mailOptions = {
      from: `"Hotel 734" <${emailUser}>`,
      to: customer_email,
      subject: '🎉 Hotel 734 - Ticket Purchase Confirmation',
      html: emailContent
    }

    await transporter.sendMail(mailOptions)

    console.log('✅ Email sent successfully to:', customer_email)

    return NextResponse.json({ 
      success: true, 
      message: 'Ticket email sent successfully',
      ticket_url: ticketUrl
    })

  } catch (error) {
    console.error('Error sending ticket email:', error)
    return NextResponse.json(
      { error: 'Failed to send ticket email: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
