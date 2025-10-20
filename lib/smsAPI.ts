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
    const itemLabel = bookingType === 'room' ? 'Room' : 'Event';
    const dateLabel = bookingType === 'room' ? 'Check-in' : 'Start';
    
    return `🏨 Hotel 734 Booking Confirmed!

Dear ${guestName},

${itemLabel}: ${itemName}
${dateLabel}: ${startDate}
Total: GHC ${totalPrice}
ID: ${bookingId}

Present this SMS or booking ID on arrival. Contact us: 0244093821

Hotel 734 Team`;
  }
};
