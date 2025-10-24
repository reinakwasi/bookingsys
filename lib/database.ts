import { supabase } from './supabase'
import type { Event, Booking, User, Ticket, TicketPurchase } from './supabase'
import { generateTicketNumber, generateQRCode } from './ticketUtils'

// Events API
export const eventsAPI = {
  async getAll(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, event: Partial<Event>): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .update(event)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Bookings API
export const bookingsAPI = {
  async create(booking: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> {
    // Handle both room and event bookings
    const bookingData = {
      ...booking,
      status: 'confirmed',
      // Map field names for compatibility
      guest_name: booking.guestName || booking.guest_name,
      start_date: booking.startDate || booking.start_date,
      end_date: booking.endDate || booking.end_date,
      guests_count: booking.numberOfGuests || booking.guests_count || 1,
      total_price: booking.totalPrice || booking.total_price,
      special_requests: booking.specialRequests || booking.special_requests,
      booking_type: booking.bookingType || booking.booking_type || 'event',
      item_id: booking.itemId || booking.item_id,
      // Set event_id only for event bookings
      event_id: booking.bookingType === 'room' ? null : (booking.itemId || booking.event_id),
      // Don't set user_id for unauthenticated bookings
      user_id: null
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getAll(): Promise<Booking[]> {
    console.log('Getting all bookings, excluding deleted ones...');
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        events (
          name,
          date,
          category
        )
      `)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
    
    console.log('getAll result:', { 
      data,
      error,
      count: data?.length, 
      deletedCount: data?.filter(b => b.status === 'deleted').length,
      statuses: data?.map(b => ({ id: b.id.slice(-8), status: b.status }))
    });
    
    if (error) {
      console.error('Bookings getAll error:', error);
      throw error;
    }
    return data || []
  },

  async getByUser(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        events (
          name,
          date,
          category
        )
      `)
      .eq('user_id', userId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async updateStatus(id: string, status: Booking['status']): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    console.log('Database delete called for ID:', id);
    
    // First check if booking exists
    const { data: existingBooking, error: checkError } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('id', id)
      .single()
    
    console.log('Booking check result:', { existingBooking, checkError });
    
    if (checkError || !existingBooking) {
      throw new Error('No booking found with that ID');
    }
    
    if (existingBooking.status === 'deleted') {
      console.log('Booking already deleted');
      return;
    }
    
    // Perform soft delete with timestamp
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status: 'deleted',
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    console.log('Soft delete result:', { data, error });
    if (error) {
      console.error('Soft delete error:', error);
      throw new Error(`Failed to delete booking: ${error.message || 'Unknown error'}`);
    }
    
    // Check if update actually affected any rows
    if (!data || data.length === 0) {
      console.error('No rows were updated - likely RLS policy blocking admin update');
      throw new Error('Failed to delete booking - insufficient permissions or booking not found');
    }
    
    // Verify the update worked
    console.log('Updated booking status:', data[0].status);
    console.log('Booking successfully marked as deleted');
    
    // Force a small delay to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 100));
  },

  async getDeleted(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        events (
          name,
          date,
          category
        )
      `)
      .eq('status', 'deleted')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Tickets API
export const ticketsAPI = {
  async getAll(): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('event_date', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async getActive(): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'active')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Ticket | null> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>): Promise<Ticket> {
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        ...ticket,
        available_quantity: ticket.total_quantity
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, ticket: Partial<Ticket>): Promise<Ticket> {
    const { data, error } = await supabase
      .from('tickets')
      .update({
        ...ticket,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Individual Tickets API
export const individualTicketsAPI = {
  async getByPurchaseId(purchaseId: string) {
    const { data, error } = await supabase
      .from('individual_tickets')
      .select('*')
      .eq('purchase_id', purchaseId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('individual_tickets')
      .select(`
        *,
        ticket_purchases!inner (
          *,
          tickets (*)
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: string, usedBy?: string) {
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    }
    
    if (status === 'used') {
      updateData.used_at = new Date().toISOString()
      updateData.used_by = usedBy
    }

    const { data, error } = await supabase
      .from('individual_tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Ticket Purchases API
export const ticketPurchasesAPI = {
  async create(purchase: Omit<TicketPurchase, 'id' | 'purchase_date' | 'created_at' | 'access_token'>): Promise<TicketPurchase> {
    console.log('🔍 ========== TICKET PURCHASE CREATION STARTED ==========');
    console.log('🔍 Input purchase data:', purchase);
    // Generate simple access token
    const accessToken = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Get ticket details for SMS message
    const { data: ticketData } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', purchase.ticket_id)
      .single();
    
    const { data, error } = await supabase
      .from('ticket_purchases')
      .insert({
        ...purchase,
        purchase_date: new Date().toISOString(),
        access_token: accessToken,
        qr_code: `QR-${accessToken.toUpperCase()}`
      })
      .select()
      .single()
    
    if (error) throw error
    
    console.log('✅ Ticket purchase created:', data.id);
    
    // Generate ticket access URL
    let baseUrl = 'https://hotel734.com'; // Default to production domain
    
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    }
    
    const ticketUrl = `${baseUrl}/my-tickets/${data.access_token}`;
    console.log('🔗 Generated ticket URL:', ticketUrl);
    
    // Send email notification
    console.log('🔍 ========== STARTING EMAIL NOTIFICATION ==========');
    console.log('📧 Attempting to send email notification...');
    console.log('🔍 Email recipient:', data.customer_email);
    console.log('🔍 Customer name:', data.customer_name);
    console.log('🔍 Purchase ID:', data.id);
    console.log('🔍 Access token:', data.access_token);
    
    try {
      const emailPayload = {
        purchase_id: data.id,
        access_token: data.access_token,
        customer_email: data.customer_email,
        customer_name: data.customer_name
      };
      
      console.log('🔍 Email API payload:', emailPayload);
      
      const emailResponse = await fetch('/api/send-ticket-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });
      
      console.log('🔍 Email API response status:', emailResponse.status, emailResponse.statusText);
      
      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('🔍 Email API returned error status:', errorText);
        throw new Error(`Email API error: ${emailResponse.status} - ${errorText}`);
      }
      
      const emailResult = await emailResponse.json();
      console.log('🔍 Email API response:', emailResult);
      
      if (emailResult.success) {
        console.log('✅ Email sent successfully:', emailResult);
      } else {
        console.error('❌ Email sending failed:', emailResult);
        throw new Error(emailResult.error || 'Email sending failed');
      }
    } catch (emailError) {
      console.error('🔍 ========== EMAIL NOTIFICATION ERROR ==========');
      console.error('❌ Failed to send ticket email:', emailError);
      console.error('🔍 Email error type:', typeof emailError);
      console.error('🔍 Email error message:', emailError instanceof Error ? emailError.message : 'Unknown error');
      console.error('🔍 Email error stack:', emailError instanceof Error ? emailError.stack : 'No stack trace');
      // Don't fail the purchase if email fails, but log the error
      console.error('📧 EMAIL NOTIFICATION FAILED - Check environment variables GMAIL_USER and GMAIL_PASS');
    }
    
    // Send SMS notification if phone number is provided
    console.log('🔍 ========== STARTING SMS NOTIFICATION ==========');
    console.log('🔍 Customer phone:', purchase.customer_phone);
    
    if (purchase.customer_phone && purchase.customer_phone.trim()) {
      console.log('🔍 Phone number provided, proceeding with SMS...');
      try {
        // Create SMS message with ticket details and access link
        const eventDate = new Date(ticketData?.event_date || '').toLocaleDateString('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        
        const ticketText = purchase.quantity === 1 ? 'Ticket' : 'Tickets';
        
        const smsMessage = `HOTEL 734 - TICKET CONFIRMED

Hello ${purchase.customer_name}!

EVENT: ${(ticketData?.title || 'Event').toUpperCase()}
DATE: ${eventDate}
${ticketText.toUpperCase()}: ${purchase.quantity}
REFERENCE: ${data.access_token}

VIEW TICKET: ${ticketUrl}

IMPORTANT: Present this SMS or scan QR code at venue entrance.

Thank you for choosing Hotel 734!

Support: 0244093821
Email: info@hotel734.com

- Hotel 734 Management`;

        console.log('📱 Sending SMS notification to:', purchase.customer_phone.substring(0, 6) + '***');
        
        const smsPayload = {
          to: purchase.customer_phone,
          message: smsMessage
        };
        
        console.log('🔍 SMS API payload:', {
          to: purchase.customer_phone?.substring(0, 6) + '***',
          messageLength: smsMessage.length
        });
        
        const smsResponse = await fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(smsPayload)
        });
        
        console.log('🔍 SMS API response status:', smsResponse.status, smsResponse.statusText);
        
        if (!smsResponse.ok) {
          const errorText = await smsResponse.text();
          console.error('🔍 SMS API returned error status:', errorText);
          throw new Error(`SMS API error: ${smsResponse.status} - ${errorText}`);
        }
        
        const smsResult = await smsResponse.json();
        console.log('🔍 SMS API response:', smsResult);
        
        if (smsResult.success) {
          console.log('✅ SMS sent successfully:', {
            messageId: smsResult.messageId,
            provider: smsResult.provider,
            to: smsResult.to?.substring(0, 6) + '***'
          });
          
          if (smsResult.provider?.includes('Fallback')) {
            console.warn('⚠️ SMS sent via fallback - Check BULKSMS_API_KEY environment variable for real SMS delivery');
          }
        } else {
          console.error('❌ SMS sending failed:', smsResult.error);
          throw new Error(smsResult.error || 'SMS sending failed');
        }
      } catch (smsError) {
        console.error('🔍 ========== SMS NOTIFICATION ERROR ==========');
        console.error('❌ Failed to send SMS:', smsError);
        console.error('🔍 SMS error type:', typeof smsError);
        console.error('🔍 SMS error message:', smsError instanceof Error ? smsError.message : 'Unknown error');
        console.error('🔍 SMS error stack:', smsError instanceof Error ? smsError.stack : 'No stack trace');
        console.error('📱 SMS NOTIFICATION FAILED - Check environment variable BULKSMS_API_KEY');
        // Don't fail the purchase if SMS fails
      }
    } else {
      console.log('📱 No phone number provided, skipping SMS notification');
    }
    
    console.log('🔍 ========== TICKET PURCHASE CREATION COMPLETED ==========');
    console.log('🔍 Returning purchase data:', data);
    
    return data
  },

  async getByEmail(email: string): Promise<TicketPurchase[]> {
    const { data, error } = await supabase
      .from('ticket_purchases')
      .select(`
        *,
        ticket:tickets(*)
      `)
      .eq('customer_email', email)
      .order('purchase_date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getByTicketId(ticketId: string): Promise<TicketPurchase[]> {
    const { data, error } = await supabase
      .from('ticket_purchases')
      .select(`
        *,
        ticket:tickets(*)
      `)
      .eq('ticket_id', ticketId)
      .order('purchase_date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getAll(): Promise<TicketPurchase[]> {
    const { data, error } = await supabase
      .from('ticket_purchases')
      .select(`
        *,
        ticket:tickets(*)
      `)
      .order('purchase_date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async updatePaymentStatus(id: string, status: TicketPurchase['payment_status']): Promise<TicketPurchase> {
    const { data, error } = await supabase
      .from('ticket_purchases')
      .update({ payment_status: status })
      .eq('id', id)
      .select(`
        *,
        ticket:tickets(*)
      `)
      .single()
    
    if (error) throw error
    return data
  }
}

// Users API
export const usersAPI = {
  async create(user: Omit<User, 'created_at'> | Omit<User, 'id' | 'created_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateProfile(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Utility functions
export const checkAvailability = async (
  eventId: string, 
  startDate: string, 
  endDate: string
): Promise<boolean> => {
  // Check if there are conflicting bookings
  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('event_id', eventId)
    .neq('status', 'cancelled')
    .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
  
  if (error) throw error
  
  // For now, return true if no conflicts (you can add more complex logic)
  return !data || data.length === 0
}
