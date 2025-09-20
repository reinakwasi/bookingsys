import { supabase } from './supabase'
import type { Event, Booking, User, Ticket, TicketPurchase } from './supabase'

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
    const { data, error } = await supabase
      .from('ticket_purchases')
      .insert({
        ...purchase,
        purchase_date: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Send email notification
    try {
      await fetch('/api/send-ticket-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchase_id: data.id,
          access_token: data.access_token,
          customer_email: data.customer_email,
          customer_name: data.customer_name
        })
      })
    } catch (emailError) {
      console.error('Failed to send ticket email:', emailError)
      // Don't fail the purchase if email fails
    }
    
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
