import { supabase } from './supabase';

export const messagesAPI = {
  // Get all reviews and messages, newest first
  async getAll() {
    try {
      // Try to get reviews first
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Try to get admin messages
      const { data: adminMessages, error: messagesError } = await supabase
        .from('admin_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      const allMessages = [];
      
      // Add reviews with type indicator
      if (reviews && !reviewsError) {
        allMessages.push(...reviews.map(review => ({
          ...review,
          type: 'review',
          title: `Review - ${review.rating} Stars`,
          message: review.review_text,
          name: review.guest_name,
          email: review.email,
          is_read: review.status === 'read'
        })));
      }
      
      // Add admin messages
      if (adminMessages && !messagesError) {
        allMessages.push(...adminMessages.map(msg => ({
          ...msg,
          name: 'System',
          is_read: msg.status === 'read'
        })));
      }
      
      // Sort by created_at
      allMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return allMessages;
    } catch (error) {
      console.error('❌ Get messages error:', error);
      return [];
    }
  },

  // Get unread count
  async getUnreadCount() {
    try {
      let totalUnread = 0;
      
      // Count unread reviews
      const { count: reviewCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread');
      
      // Count unread admin messages
      const { count: messageCount } = await supabase
        .from('admin_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread');
      
      totalUnread = (reviewCount || 0) + (messageCount || 0);
      return totalUnread;
    } catch (error) {
      console.error('❌ Get unread count error:', error);
      return 0;
    }
  },

  // Mark as read
  async markAsRead(id: string, type: string = 'review') {
    try {
      if (type === 'review') {
        const { data, error } = await supabase
          .from('reviews')
          .update({ status: 'read' })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('admin_messages')
          .update({ status: 'read' })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } catch (error: any) {
      console.error('❌ Mark as read error:', error);
      throw new Error(error.message);
    }
  },

  // Mark as unread
  async markAsUnread(id: string, type: string = 'review') {
    try {
      if (type === 'review') {
        const { data, error } = await supabase
          .from('reviews')
          .update({ status: 'unread' })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('admin_messages')
          .update({ status: 'unread' })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } catch (error: any) {
      console.error('❌ Mark as unread error:', error);
      throw new Error(error.message);
    }
  },

  // Delete message
  async delete(id: string) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('❌ Delete message error:', error);
      throw new Error(error.message);
    }
    return true;
  },

  // Create message (used by contact form)
  async create({ name, email, subject, message }: { name: string; email?: string; subject?: string; message: string }) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ name, email, subject, message }])
      .select()
      .single();
    if (error) {
      console.error('❌ Create message error:', error);
      throw new Error(error.message);
    }
    return data;
  },

  // Send reply to message
  async sendReply({ messageId, replyContent, sentToEmail }: { messageId: string; replyContent: string; sentToEmail: string }) {
    // Insert reply record
    const { data: replyData, error: replyError } = await supabase
      .from('message_replies')
      .insert([{
        message_id: messageId,
        reply_content: replyContent,
        sent_to_email: sentToEmail
      }])
      .select()
      .single();

    if (replyError) {
      console.error('❌ Create reply error:', replyError);
      throw new Error(replyError.message);
    }

    // Update original message with replied_at timestamp
    const { error: updateError } = await supabase
      .from('messages')
      .update({ replied_at: new Date().toISOString() })
      .eq('id', messageId);

    if (updateError) {
      console.error('❌ Update message replied_at error:', updateError);
    }

    return replyData;
  },

  // Get replies for a message
  async getReplies(messageId: string) {
    const { data, error } = await supabase
      .from('message_replies')
      .select('*')
      .eq('message_id', messageId)
      .order('sent_at', { ascending: true });

    if (error) {
      console.error('❌ Get replies error:', error);
      return [];
    }
    return data || [];
  },
};
