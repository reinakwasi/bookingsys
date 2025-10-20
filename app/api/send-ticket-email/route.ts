import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { purchase_id, access_token, customer_email, customer_name, my_tickets_link } = await request.json()

    console.log('📧 Email request data:', { purchase_id, access_token, customer_email, customer_name, my_tickets_link });

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
      
      ticketUrl = `${baseUrl}/t/${access_token}`;
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #0d9488); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Hotel 734</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Event Tickets</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${customer_name}!</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Thank you for purchasing tickets from Hotel 734! Your tickets are ready and waiting for you.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Access Your Tickets</h3>
            <p style="color: #4b5563; margin-bottom: 15px;">
              Click the button below to view, download, and share your individual tickets:
            </p>
            <a href="${ticketUrl}" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold;">
              View My Tickets
            </a>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0;">Important Information:</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>Each ticket has a unique QR code for individual entry</li>
              <li>You can share individual tickets with different people</li>
              <li>Present the QR code at the venue for entry</li>
              <li>Keep this email safe - it contains your ticket access link</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you have any questions, please contact Hotel 734 support.<br>
            This link will remain active until after your event.
          </p>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">© 2024 Hotel 734. All rights reserved.</p>
        </div>
      </div>
    `

    // Send email using Gmail SMTP
    const mailOptions = {
      from: `"Hotel 734" <${emailUser}>`,
      to: customer_email,
      subject: 'Your Hotel 734 Event Tickets',
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
