import { emailAPI, emailTemplates } from './emailAPI';

export const emailService = {
  async sendReply({
    to,
    subject,
    message,
    replyToMessageId,
    originalMessage
  }: {
    to: string;
    subject: string;
    message: string;
    replyToMessageId: string;
    originalMessage?: string;
  }) {
    try {
      if (!to) {
        throw new Error('Recipient email is required');
      }

      // Generate professional email template
      const template = emailTemplates.replyTemplate(message, originalMessage);
      
      // Send email using email API
      const result = await emailAPI.sendEmail({
        to,
        subject: `Re: ${subject}`,
        html: template.html,
        text: template.text
      });

      console.log('✅ Email reply sent successfully:', {
        to,
        subject: `Re: ${subject}`,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      console.error('❌ Email send error:', error);
      throw new Error('Failed to send email reply');
    }
  }
};
