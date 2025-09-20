// Production-ready email API using SendGrid or similar service
// Replace with your preferred email service provider

export const emailAPI = {
  async sendEmail({
    to,
    subject,
    html,
    text
  }: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }) {
    try {
      // Use the Resend transactional email API route
      const response = await fetch('/api/send-email-working', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html,
          text
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      const data = await response.json();
      console.log('✅ Email sent successfully:', { to, subject, messageId: data.messageId });
      
      return { success: true, messageId: data.messageId };
    } catch (error) {
      console.error('❌ Email API error:', error);
      throw new Error('Failed to send email');
    }
  }
};

// Email templates
export const emailTemplates = {
  // Booking confirmation template
  bookingConfirmation: ({
    guestName,
    bookingType,
    itemName,
    startDate,
    endDate,
    totalPrice,
    bookingId,
    specialRequests
  }: {
    guestName: string;
    bookingType: 'room' | 'event';
    itemName: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    bookingId: string;
    specialRequests?: string;
  }) => ({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #C49B66, #FFD700); padding: 30px; text-align: center;">
          <h1 style="color: #1a233b; margin: 0; font-size: 28px; font-weight: bold;">Hotel 734</h1>
          <p style="color: #1a233b; margin: 10px 0 0 0; font-size: 16px;">Booking Confirmation</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #1a233b; margin-bottom: 20px;">Dear ${guestName},</h2>
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            Thank you for choosing Hotel 734! We're delighted to confirm your ${bookingType} booking.
          </p>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #C49B66;">
            <h3 style="color: #1a233b; margin: 0 0 15px 0; font-size: 18px;">Booking Details</h3>
            <div style="display: grid; gap: 10px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                <span style="font-weight: bold; color: #666;">Booking ID:</span>
                <span style="color: #1a233b; font-weight: bold;">${bookingId}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                <span style="font-weight: bold; color: #666;">${bookingType === 'room' ? 'Room Type:' : 'Event:'}:</span>
                <span style="color: #1a233b; font-weight: bold;">${itemName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                <span style="font-weight: bold; color: #666;">${bookingType === 'room' ? 'Check-in:' : 'Start Date:'}:</span>
                <span style="color: #1a233b;">${startDate}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                <span style="font-weight: bold; color: #666;">${bookingType === 'room' ? 'Check-out:' : 'End Date:'}:</span>
                <span style="color: #1a233b;">${endDate}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                <span style="font-weight: bold; color: #666;">Total Amount:</span>
                <span style="color: #C49B66; font-weight: bold; font-size: 18px;">GHC ${totalPrice}</span>
              </div>
            </div>
            ${specialRequests ? `
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
              <span style="font-weight: bold; color: #666;">Special Requests:</span>
              <p style="margin: 5px 0 0 0; color: #1a233b; font-style: italic;">${specialRequests}</p>
            </div>
            ` : ''}
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <h4 style="color: #2E7D32; margin: 0 0 10px 0;">What's Next?</h4>
            <ul style="margin: 0; padding-left: 20px; color: #333;">
              <li>You will receive an SMS confirmation shortly</li>
              <li>${bookingType === 'room' ? 'Arrive at the hotel on your check-in date' : 'Arrive at the venue on your event date'}</li>
              <li>Present this confirmation email or your booking ID</li>
              <li>Contact us if you need to make any changes</li>
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
    `,
    text: `
Hotel 734 - Booking Confirmation

Dear ${guestName},

Thank you for choosing Hotel 734! We're delighted to confirm your ${bookingType} booking.

Booking Details:
- Booking ID: ${bookingId}
- ${bookingType === 'room' ? 'Room Type' : 'Event'}: ${itemName}
- ${bookingType === 'room' ? 'Check-in' : 'Start Date'}: ${startDate}
- ${bookingType === 'room' ? 'Check-out' : 'End Date'}: ${endDate}
- Total Amount: GHC ${totalPrice}
${specialRequests ? `- Special Requests: ${specialRequests}` : ''}

What's Next?
- You will receive an SMS confirmation shortly
- ${bookingType === 'room' ? 'Arrive at the hotel on your check-in date' : 'Arrive at the venue on your event date'}
- Present this confirmation email or your booking ID
- Contact us if you need to make any changes

Contact Information:
Address: New Edubiase, Ashanti Region, Ghana
Phone: 0244093821
Email: info@hotel734@gmail.com

Best regards,
Hotel 734 Team
Creating unforgettable experiences
    `
  }),
  replyTemplate: (replyContent: string, originalMessage?: string) => ({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 30px; text-align: center;">
          <h1 style="color: #1a233b; margin: 0; font-size: 28px; font-weight: bold;">Hotel 734</h1>
          <p style="color: #1a233b; margin: 10px 0 0 0; font-size: 16px;">Thank you for contacting us</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #1a233b; margin-bottom: 20px;">Our Reply</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFD700;">
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6; color: #333;">${replyContent}</p>
          </div>
          
          ${originalMessage ? `
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <h3 style="color: #666; font-size: 14px; margin-bottom: 10px;">Your Original Message:</h3>
          <div style="background: #f0f0f0; padding: 15px; border-radius: 6px; font-size: 14px; color: #666;">
            <p style="margin: 0; white-space: pre-wrap;">${originalMessage}</p>
          </div>
          ` : ''}
        </div>
        
        <div style="background: #1a233b; padding: 30px; text-align: center;">
          <h3 style="color: #FFD700; margin: 0 0 15px 0;">Contact Information</h3>
          <p style="color: #ffffff; margin: 5px 0; font-size: 14px;">📍 New Edubiase, Ashanti Region, Ghana</p>
          <p style="color: #ffffff; margin: 5px 0; font-size: 14px;">📞 0244093821</p>
          <p style="color: #ffffff; margin: 5px 0; font-size: 14px;">✉️ info@hotel734@gmail.com</p>
          <div style="margin-top: 20px;">
            <p style="color: #FFD700; margin: 0; font-size: 16px; font-weight: bold;">Hotel 734 Team</p>
            <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 12px;">Creating unforgettable experiences</p>
          </div>
        </div>
      </div>
    `,
    text: `
Hotel 734 - Reply to Your Message

Our Reply:
${replyContent}

${originalMessage ? `Your Original Message:\n${originalMessage}\n\n` : ''}

Contact Information:
Address: New Edubiase, Ashanti Region, Ghana
Phone: 0244093821
Email: info@hotel734@gmail.com

Best regards,
Hotel 734 Team
    `
  })
};
