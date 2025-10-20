import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, guestName, email, bookingType, itemName, checkoutDate } = await request.json();

    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
    const FROM_NAME = process.env.FROM_NAME || 'Hotel 734';

    if (!SMTP_USER || !SMTP_PASS) {
      return NextResponse.json({
        error: 'SMTP credentials not configured'
      }, { status: 500 });
    }

    if (!email) {
      console.log('⚠️ No email provided for checkout notification');
      return NextResponse.json({
        success: false,
        message: 'No email provided'
      });
    }

    console.log('📧 Sending checkout email:', {
      bookingId,
      guestName,
      email,
      bookingType,
      itemName
    });

    // Use explicit SMTP settings for better reliability
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 45000,
      requireTLS: true,
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });

    // Get the proper base URL for email links
    let baseUrl;
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      baseUrl = 'https://hotel734.com';
    }
    
    const reviewUrl = `${baseUrl}/review?booking=${bookingId}`;
    
    console.log('🔗 Generated review URL:', reviewUrl);

    // Get booking details to determine if it's room or event
    const { data: booking } = await supabase
      .from('bookings')
      .select('booking_type, item_id, guest_name, start_date, end_date')
      .eq('id', bookingId)
      .single();

    const isEvent = booking?.booking_type === 'event';
    
    const subject = isEvent 
      ? `Thank you for your event at Hotel 734! 🎉`
      : `Thank you for staying with Hotel 734! 🌟`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You - Hotel 734</title>
        <style>
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #C49B66 0%, #F4E4BC 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
            .content { padding: 40px 30px; }
            .checkout-info { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #C49B66; }
            .review-section { background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; }
            .review-button { display: inline-block; background: linear-gradient(135deg, #C49B66 0%, #D4AF37 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; box-shadow: 0 4px 12px rgba(196, 155, 102, 0.3); transition: transform 0.2s; }
            .review-button:hover { transform: translateY(-2px); }
            .footer { background-color: #2c3e50; color: white; padding: 30px; text-align: center; }
            .rating-stars { font-size: 24px; color: #ffd700; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏨 Hotel 734</h1>
                <p style="color: #f8f9fa; margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing us!</p>
            </div>
            
            <div class="content">
                <h2 style="color: #2c3e50; margin-bottom: 20px;">Dear ${guestName},</h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #555;">
                    ${isEvent 
                      ? 'We hope your event was a tremendous success! Thank you for choosing Hotel 734 for your special occasion.'
                      : 'We hope you had a wonderful experience during your stay with us! Your checkout has been completed successfully.'
                    }
                </p>
                
                <div class="checkout-info">
                    <h3 style="color: #C49B66; margin-top: 0;">${isEvent ? '🎉 Event Details' : '📋 Checkout Details'}</h3>
                    <p><strong>Booking ID:</strong> #${bookingId}</p>
                    <p><strong>${isEvent ? 'Event' : 'Room'}:</strong> ${itemName}</p>
                    <p><strong>${isEvent ? 'Event Date' : 'Checkout Date'}:</strong> ${checkoutDate}</p>
                    <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">✅ Completed</span></p>
                </div>
                
                <div class="review-section">
                    <h3 style="color: #856404; margin-top: 0;">🌟 Share Your Experience</h3>
                    <div class="rating-stars">⭐⭐⭐⭐⭐</div>
                    <p style="font-size: 16px; color: #856404; margin: 15px 0;">
                        Your feedback helps us improve and serve you better. Please take a moment to share your experience with us.
                    </p>
                    <a href="${reviewUrl}" class="review-button">
                        📝 Leave a Review & Rating
                    </a>
                    <p style="font-size: 14px; color: #6c757d; margin-top: 15px;">
                        This will only take 2 minutes of your time
                    </p>
                </div>
                
                <p style="font-size: 16px; line-height: 1.6; color: #555; margin-top: 30px;">
                    ${isEvent 
                      ? 'We truly appreciate you choosing Hotel 734 for your event. We hope to host your future events and celebrations!'
                      : 'We truly appreciate your business and hope to welcome you back soon. If you have any questions or concerns, please don\'t hesitate to contact us.'
                    }
                </p>
                
                <p style="font-size: 16px; color: #C49B66; font-weight: bold; margin-top: 30px;">
                    Thank you for choosing Hotel 734! 🙏
                </p>
            </div>
            
            <div class="footer">
                <h3 style="margin-top: 0;">Hotel 734</h3>
                <p style="margin: 10px 0;">Where Luxury Meets Exceptional Service</p>
                <p style="font-size: 14px; color: #bdc3c7;">
                    📧 info@hotel734.com | 📞 +233 123 456 789<br>
                    🏨 123 Luxury Avenue, Accra, Ghana
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    const textContent = `
Dear ${guestName},

Thank you for staying with Hotel 734! Your checkout has been completed successfully.

Checkout Details:
- Booking ID: #${bookingId}
- ${bookingType === 'room' ? 'Room' : 'Event'}: ${itemName}
- Checkout Date: ${checkoutDate}
- Status: Completed

We would love to hear about your experience! Please take a moment to leave a review and rating:
${reviewUrl}

Your feedback helps us improve and serve you better.

Thank you for choosing Hotel 734!

Best regards,
The Hotel 734 Team
📧 info@hotel734.com | 📞 +233 123 456 789
    `;

    const info = await Promise.race([
      transporter.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: email,
        subject,
        text: textContent,
        html: htmlContent
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timeout after 30 seconds')), 30000)
      )
    ]) as any;

    console.log('📧 Checkout email sent successfully:', info?.messageId);

    return NextResponse.json({
      success: true,
      messageId: info?.messageId || 'unknown',
      provider: 'gmail-smtp'
    });

  } catch (error: any) {
    console.error('❌ Checkout email error:', error);
    
    return NextResponse.json({
      error: 'Failed to send checkout email',
      details: error.message
    }, { status: 500 });
  }
}
