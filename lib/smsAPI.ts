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
    
    return `HOTEL 734 - BOOKING CONFIRMED

Hello ${guestName}!

${itemLabel.toUpperCase()}: ${itemName}
${dateLabel.toUpperCase()}: ${startDate}
TOTAL: GHC ${totalPrice}
REFERENCE: ${bookingId}

IMPORTANT: Present this SMS or booking ID on arrival.

Thank you for choosing Hotel 734!

Support: 0244093821
Email: info@hotel734.com

- Hotel 734 Management`;
  },

  ticketConfirmation: ({
    customerName,
    eventName,
    eventDate,
    ticketNumber,
    shortLink,
    quantity
  }: {
    customerName: string;
    eventName: string;
    eventDate: string;
    ticketNumber: string;
    shortLink: string;
    quantity: number;
  }) => {
    const formattedDate = new Date(eventDate).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    const ticketText = quantity === 1 ? 'Ticket' : 'Tickets';
    
    return `HOTEL 734 - TICKET CONFIRMED

Hello ${customerName}!

EVENT: ${eventName.toUpperCase()}
DATE: ${formattedDate}
${ticketText.toUpperCase()}: ${quantity}
REFERENCE: ${ticketNumber}

VIEW TICKET: ${shortLink}

IMPORTANT: Present this SMS or scan QR code at venue entrance.

Thank you for choosing Hotel 734!

Support: 0244093821
Email: info@hotel734.com

- Hotel 734 Management`;
  }
};
