import { emailAPI, emailTemplates } from './emailAPI';
import { smsAPI, smsTemplates } from './smsAPI';

export interface BookingNotificationData {
  guestName: string;
  email?: string;
  phone: string;
  bookingType: 'room' | 'event';
  itemName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  bookingId: string;
  specialRequests?: string;
}

export const notificationService = {
  async sendBookingConfirmation(data: BookingNotificationData) {
    const results = {
      email: { sent: false, error: null as string | null },
      sms: { sent: false, error: null as string | null }
    };

    // Send email if email address is provided
    if (data.email && data.email.trim()) {
      try {
        const emailTemplate = emailTemplates.bookingConfirmation({
          guestName: data.guestName,
          bookingType: data.bookingType,
          itemName: data.itemName,
          startDate: data.startDate,
          endDate: data.endDate,
          totalPrice: data.totalPrice,
          bookingId: data.bookingId,
          specialRequests: data.specialRequests
        });

        await emailAPI.sendEmail({
          to: data.email,
          subject: `Hotel 734 - Booking Confirmation #${data.bookingId}`,
          html: emailTemplate.html,
          text: emailTemplate.text
        });

        results.email.sent = true;
        console.log('✅ Email confirmation sent to:', data.email);
      } catch (error: any) {
        results.email.error = error.message;
        console.error('❌ Failed to send email confirmation:', error);
      }
    }

    // Send SMS if phone number is provided (always required)
    if (data.phone && data.phone.trim()) {
      try {
        const smsMessage = smsTemplates.bookingConfirmation({
          guestName: data.guestName,
          bookingType: data.bookingType,
          itemName: data.itemName,
          startDate: data.startDate,
          endDate: data.endDate,
          totalPrice: data.totalPrice,
          bookingId: data.bookingId
        });

        await smsAPI.sendSMS({
          to: data.phone,
          message: smsMessage
        });

        results.sms.sent = true;
        console.log('✅ SMS confirmation sent to:', data.phone);
      } catch (error: any) {
        results.sms.error = error.message;
        console.error('❌ Failed to send SMS confirmation:', error);
      }
    }

    return results;
  }
};
