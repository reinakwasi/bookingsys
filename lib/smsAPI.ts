// SMS API using multiple providers for reliability
export const smsAPI = {
  async sendSMS({
    to,
    message
  }: {
    to: string;
    message: string;
  }) {
    try {
      // Use the SMS API route
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send SMS');
      }

      const data = await response.json();
      console.log('✅ SMS sent successfully:', { to, messageId: data.messageId });
      
      return { success: true, messageId: data.messageId };
    } catch (error) {
      console.error('❌ SMS API error:', error);
      throw new Error('Failed to send SMS');
    }
  }
};

// SMS templates
export const smsTemplates = {
  bookingConfirmation: ({
    guestName,
    bookingType,
    itemName,
    startDate,
    endDate,
    totalPrice,
    bookingId
  }: {
    guestName: string;
    bookingType: 'room' | 'event';
    itemName: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    bookingId: string;
  }) => {
    if (bookingType === 'room') {
      return `HOTEL 734 - BOOKING CONFIRMED

Hello ${guestName},

Your room reservation is confirmed!

Room Type: ${itemName}
Check-in: ${startDate}
Check-out: ${endDate}
Total: GHC ${totalPrice}
Booking ID: ${bookingId}

Please present this booking ID upon arrival.

Questions? Call: 0244093821

Thank you for choosing Hotel 734!`;
    } else {
      return `HOTEL 734 - EVENT BOOKING CONFIRMED

Hello ${guestName},

Your event space is reserved!

Event Space: ${itemName}
Date: ${startDate}
Booking ID: ${bookingId}

Our team will contact you shortly to discuss event details.

Questions? Call: 0244093821

Thank you for choosing Hotel 734!`;
    }
  }
};
