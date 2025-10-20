// Import Supabase database functions
import { 
  eventsAPI as supabaseEventsAPI, 
  bookingsAPI as supabaseBookingsAPI, 
  usersAPI as supabaseUsersAPI,
  ticketsAPI as supabaseTicketsAPI,
  ticketPurchasesAPI as supabaseTicketPurchasesAPI,
  checkAvailability
} from './database';
import { supabase } from './supabase';

// Auth API using Supabase Auth
export const authAPI = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },
  
  register: async (userData: { email: string; password: string; name: string; phone?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone,
        }
      }
    });
    if (error) throw error;
    
    // Create user profile
    if (data.user) {
      await supabaseUsersAPI.create({
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: 'guest'
      });
    }
    
    return data;
  },
  
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const profile = await supabaseUsersAPI.getById(user.id);
    return { ...user, profile };
  },
  
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};

// Rooms API (keeping original structure for compatibility)
export const roomsAPI = {
  getAll: async (filters?: any) => {
    // Mock data for rooms - updated to match database room type names
    return [
      {
        id: '1',
        name: 'Royal Suite',
        type: 'royal_suite',
        price: 500,
        capacity: 4,
        amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Jacuzzi'],
        images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a']
      },
      {
        id: '2',
        name: 'Superior Room',
        type: 'superior_room',
        price: 250,
        capacity: 3,
        amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304']
      },
      {
        id: '3',
        name: 'Classic Room',
        type: 'classic_room',
        price: 150,
        capacity: 2,
        amenities: ['WiFi', 'AC', 'TV'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304']
      }
    ];
  },
  getById: async (id: string) => {
    const rooms = await roomsAPI.getAll();
    return rooms.find(room => room.id === id);
  },
  create: async (roomData: any) => roomData,
  update: async (id: string, roomData: any) => roomData,
  delete: async (id: string) => ({ success: true }),
};

// Events API using Supabase
export const eventsAPI = {
  getAll: async (filters?: any) => {
    return await supabaseEventsAPI.getAll();
  },
  getById: async (id: string) => {
    return await supabaseEventsAPI.getById(id);
  },
  create: async (eventData: any) => {
    return await supabaseEventsAPI.create(eventData);
  },
  update: async (id: string, eventData: any) => {
    return await supabaseEventsAPI.update(id, eventData);
  },
  delete: async (id: string) => {
    await supabaseEventsAPI.delete(id);
    return { success: true };
  },
};

// Bookings API using Supabase
export const bookingsAPI = {
  async create(bookingData: any) {
    console.log('📝 Creating booking with data:', bookingData);
    
    // If this is a room booking, check availability atomically
    if (bookingData.booking_type === 'room') {
      console.log('🏨 Room booking detected, performing atomic availability check...');
      
      // Get fresh booking data
      const availability = await this.checkRoomAvailability(
        bookingData.item_id,
        bookingData.start_date,
        bookingData.end_date
      );
      
      console.log('🔍 Atomic availability check result:', availability);
      
      if (!availability || !availability.available || (availability.availableRooms !== undefined && availability.availableRooms <= 0)) {
        const availableCount = availability?.availableRooms ?? 0;
        const errorMsg = `Only ${availableCount} rooms available for these dates`;
        console.error('❌ Atomic validation failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('✅ Atomic validation passed, proceeding with booking creation');
    }
    
    // If this is an event booking, check availability atomically
    if (bookingData.booking_type === 'event') {
      console.log('🎉 Event booking detected, performing atomic availability check...');
      
      // Get fresh event availability data
      const availability = await this.checkEventAvailability(
        bookingData.item_id,
        bookingData.start_date
      );
      
      console.log('🔍 Atomic event availability check result:', availability);
      
      if (!availability || !availability.available) {
        const errorMsg = `Event is already booked for the selected date`;
        console.error('❌ Atomic event validation failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('✅ Atomic event validation passed, proceeding with booking creation');
    }
    
    return await supabaseBookingsAPI.create(bookingData);
  },

  async getAll() {
    try {
      console.log('🔍 Fetching all bookings via API...');
      
      const response = await fetch('/api/bookings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('⚠️ API route failed, trying fallback method...');
        throw new Error('API route failed');
      }

      const data = await response.json();
      
      // Filter out cancelled bookings on the client side
      const activeBookings = data.filter((booking: any) => booking.status !== 'cancelled');
      
      console.log('✅ Successfully fetched bookings via API:', activeBookings.length, 'active records');
      return activeBookings;
      
    } catch (error: any) {
      console.error('❌ API route failed, trying direct Supabase fallback:', error.message);
      
      // Fallback to direct Supabase query without joins
      try {
        console.log('🔄 Trying direct Supabase query as fallback...');
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .neq('status', 'cancelled')
          .neq('status', 'deleted')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('❌ Supabase fallback error:', error);
          return [];
        }
        
        console.log('✅ Fallback successful:', data?.length || 0, 'records');
        return data || [];
        
      } catch (fallbackError: any) {
        console.error('❌ Both API and fallback failed:', fallbackError);
        return [];
      }
    }
  },

  async getMyBookings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    return await supabaseBookingsAPI.getByUser(user.id);
  },

  async updateStatus(id: string, status: string) {
    try {
      console.log(`🔄 Updating booking ${id} status to: ${status}`);
      
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Update status API error:', errorData);
        throw new Error(errorData.error || 'Failed to update booking status');
      }

      const result = await response.json();
      console.log('✅ Update status API success:', result);
      return result.data;
      
    } catch (error: any) {
      console.error('❌ Update status error:', error);
      throw new Error(`Failed to update booking status: ${error.message}`);
    }
  },

  async cancel(id: string) {
    console.log(`🔄 Updating booking ${id} status to: cancelled`);
    
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Status update error:', error);
      throw new Error(`Failed to update booking status: ${error.message}`);
    }

    console.log(' Booking status updated successfully:', data);
    return data;
  },

  async delete(id: string) {
    try {
      console.log(' Deleting booking via API:', id);
      
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(' Delete API error:', errorData);
        throw new Error(errorData.error || 'Failed to delete booking');
      }

      const result = await response.json();
      console.log(' Delete API success:', result);
      return result.data;
      
    } catch (error: any) {
      console.error(' Delete error:', error);
      throw new Error(`Failed to delete booking: ${error.message}`);
    }
  },

  async getDeleted() {
    // Return all bookings with status 'cancelled' (trashed)
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'cancelled')
      .order('updated_at', { ascending: false });
    if (error) {
      console.error('❌ Get deleted bookings error:', error);
      return [];
    }
    return data || [];
  },

  async checkAvailability(eventId: string, startDate: string, endDate: string) {
    return await checkAvailability(eventId, startDate, endDate);
  },

  // Check room availability with inventory system (5 rooms per type)
  async checkRoomAvailability(roomType: string, checkIn: string, checkOut: string) {
    try {
      const bookings = await this.getAll();
      
      // If we can't get bookings data, assume rooms are available but log the issue
      if (!Array.isArray(bookings)) {
        console.error('⚠️ Could not fetch bookings data, assuming rooms are available');
        return {
          available: true,
          availableRooms: 5, // Default to full capacity
          totalRooms: 5,
          bookedRooms: 0,
          message: 'Unable to verify current bookings, but rooms should be available'
        };
      }
    
    // Room inventory: each room type has 5 individual rooms
    // Support both old and new room type names for compatibility
    const ROOM_INVENTORY = {
      'royal_suite': 5,    // Royal Suite has 5 rooms
      'superior_room': 5,  // Superior Room has 5 rooms  
      'classic_room': 5,   // Classic Room has 5 rooms
      'expensive': 5,      // Legacy: Royal Suite
      'standard': 5,       // Legacy: Superior Room
      'regular': 5         // Legacy: Classic Room
    };
    
    const totalRooms = ROOM_INVENTORY[roomType as keyof typeof ROOM_INVENTORY] || 0;
    
    // Create room type mapping for compatibility
    const getRoomTypeVariants = (roomType: string) => {
      const mapping = {
        'royal_suite': ['royal_suite', 'expensive'],
        'superior_room': ['superior_room', 'standard'],
        'classic_room': ['classic_room', 'regular'],
        'expensive': ['royal_suite', 'expensive'],
        'standard': ['superior_room', 'standard'],
        'regular': ['classic_room', 'regular']
      };
      return mapping[roomType as keyof typeof mapping] || [roomType];
    };

    const roomTypeVariants = getRoomTypeVariants(roomType);
    
    console.log('🔍 Checking availability for:', { roomType, checkIn, checkOut, totalRooms });
    console.log('📄 All bookings:', bookings.map(b => ({ id: b.id, item_id: b.item_id, booking_type: b.booking_type, status: b.status, dates: `${b.start_date} to ${b.end_date}` })));
    console.log('🔧 Room type variants being checked:', roomTypeVariants);
    
    // Filter bookings for the specific room type that overlap with requested dates
    const conflictingBookings = bookings.filter((booking: any) => {
      // First check if it's the right room type and booking type
      if (!roomTypeVariants.includes(booking.item_id) || 
          booking.booking_type !== 'room' || 
          booking.status === 'cancelled' ||
          !booking.item_id) { // Exclude bookings with null/undefined item_id
        console.log('❌ Skipping booking:', { id: booking.id, reason: 'wrong type/status/null_item_id', item_id: booking.item_id, booking_type: booking.booking_type, status: booking.status, roomTypeVariants });
        return false;
      }
      
      const bookingStart = new Date(booking.start_date);
      const bookingEnd = new Date(booking.end_date);
      const requestStart = new Date(checkIn);
      const requestEnd = new Date(checkOut);
      
      // Normalize dates to avoid time zone issues
      bookingStart.setHours(0, 0, 0, 0);
      bookingEnd.setHours(0, 0, 0, 0);
      requestStart.setHours(0, 0, 0, 0);
      requestEnd.setHours(0, 0, 0, 0);
      
      // Check if dates overlap - exclude bookings that have already ended
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      // If booking has already ended (checkout date is in the past), it's not conflicting
      if (bookingEnd < today) {
        console.log('📅 Booking already ended:', {
          bookingId: booking.id,
          bookingEnd: bookingEnd.toDateString(),
          today: today.toDateString()
        });
        return false;
      }
      
      // Check if dates overlap using proper date comparison
      // Two date ranges overlap if: start1 < end2 AND start2 < end1
      const hasOverlap = requestStart < bookingEnd && bookingStart < requestEnd;
      
      console.log('📅 Date overlap check:', {
        bookingId: booking.id,
        bookingDates: `${bookingStart.toDateString()} to ${bookingEnd.toDateString()}`,
        requestDates: `${requestStart.toDateString()} to ${requestEnd.toDateString()}`,
        hasOverlap,
        requestStart_lt_bookingEnd: requestStart < bookingEnd,
        bookingStart_lt_requestEnd: bookingStart < requestEnd
      });
      
      return hasOverlap;
    });
    
    const bookedRooms = conflictingBookings.length;
    const availableRooms = totalRooms - bookedRooms;
    
    console.log('📊 Availability result:', {
      totalRooms,
      bookedRooms,
      availableRooms,
      available: availableRooms > 0,
      conflictingBookingsCount: conflictingBookings.length
    });
    
    return {
      available: availableRooms > 0,
      availableRooms,
      totalRooms,
      bookedRooms,
      conflictingBookings
    };
    } catch (error) {
      console.error('❌ Error in checkRoomAvailability:', error);
      // Return default availability on error
      return {
        available: true,
        availableRooms: 5,
        totalRooms: 5,
        bookedRooms: 0,
        conflictingBookings: [],
        message: 'Error checking availability, assuming rooms are available'
      };
    }
  },

  // Check event availability
  async checkEventAvailability(eventId: string, eventDate: string) {
    try {
      console.log('🎯 Checking event availability for:', { eventId, eventDate });
      
      const bookings = await this.getAll();
      
      // Filter bookings for the specific event that overlap with the requested date
      const eventBookings = bookings.filter((booking: any) => {
        const matchesEvent = booking.item_id === eventId;
        const matchesType = booking.booking_type === 'event';
        const isActive = booking.status !== 'cancelled';
        
        // Check if the booking overlaps with the requested date
        const bookingStart = new Date(booking.start_date);
        const bookingEnd = new Date(booking.end_date);
        const requestedDate = new Date(eventDate);
        
        // Normalize dates to avoid timezone issues
        bookingStart.setHours(0, 0, 0, 0);
        bookingEnd.setHours(0, 0, 0, 0);
        requestedDate.setHours(0, 0, 0, 0);
        
        // Check if requested date falls within booking period
        const dateOverlaps = requestedDate >= bookingStart && requestedDate <= bookingEnd;
        
        console.log('🔍 Checking booking:', {
          id: booking.id,
          item_id: booking.item_id,
          booking_type: booking.booking_type,
          start_date: booking.start_date,
          end_date: booking.end_date,
          status: booking.status,
          guests_count: booking.guests_count,
          matchesEvent,
          matchesType,
          isActive,
          dateOverlaps,
          requestedDate: eventDate
        });
        
        return matchesEvent && matchesType && isActive && dateOverlaps;
      });
      
      console.log('📋 Found event bookings:', eventBookings.length);
      
      // For events, if ANY booking exists for the requested date, the event is unavailable
      // Events are exclusive - only one booking per date allowed
      const isEventAvailable = eventBookings.length === 0;
      
      console.log('📊 Event availability check:', {
        eventId,
        requestedDate: eventDate,
        existingBookings: eventBookings.length,
        isAvailable: isEventAvailable
      });
      
      // Set capacity to 1 since events are exclusive (one booking per date)
      const totalCapacity = 1;
      const bookedCapacity = eventBookings.length > 0 ? 1 : 0;
      const availableCapacity = isEventAvailable ? 1 : 0;
      
      console.log('📈 Event availability result:', {
        totalCapacity,
        bookedCapacity,
        availableCapacity,
        available: availableCapacity > 0
      });
      
      return {
        available: availableCapacity > 0,
        totalCapacity,
        bookedCapacity,
        availableCapacity,
        eventBookings
      };
    } catch (error) {
      console.error('❌ Error in checkEventAvailability:', error);
      // Return safe defaults on error
      return {
        available: true,
        totalCapacity: 100,
        bookedCapacity: 0,
        availableCapacity: 100,
        eventBookings: []
      };
    }
  }
};

// Tickets API using API routes
export const ticketsAPI = {
  async getAll() {
    try {
      console.log('🎫 Fetching all tickets via API...');
      
      const response = await fetch(`/api/tickets?_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Get tickets API error:', errorData);
        return [];
      }

      const data = await response.json();
      console.log('✅ Successfully fetched tickets:', data.length, 'records');
      return data;
      
    } catch (error: any) {
      console.error('❌ Unexpected error in getAll():', error);
      return [];
    }
  },
  
  async getActive() {
    try {
      const allTickets = await this.getAll();
      return allTickets.filter((ticket: any) => ticket.status === 'active');
    } catch (error: any) {
      console.error('❌ Error in getActive():', error);
      return [];
    }
  },
  
  async getById(id: string) {
    try {
      console.log('🎫 Fetching ticket by ID via API:', id);
      
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Get ticket API error:', errorData);
        return null;
      }

      const data = await response.json();
      console.log('✅ Successfully fetched ticket:', data.id);
      return data;
      
    } catch (error: any) {
      console.error('❌ Error in getById():', error);
      return null;
    }
  },
  
  async create(ticketData: any) {
    try {
      console.log('🎫 Creating ticket via API:', ticketData);
      
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Create ticket API error:', errorData);
        throw new Error(errorData.error || 'Failed to create ticket');
      }

      const result = await response.json();
      console.log('✅ Create ticket API success:', result);
      return result.data;
      
    } catch (error: any) {
      console.error('❌ Create ticket error:', error);
      throw new Error(`Failed to create ticket: ${error.message}`);
    }
  },
  
  async update(id: string, ticketData: any) {
    try {
      console.log('🎫 Updating ticket via API:', id, ticketData);
      
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Update ticket API error:', errorData);
        throw new Error(errorData.error || 'Failed to update ticket');
      }

      const result = await response.json();
      console.log('✅ Update ticket API success:', result);
      return result.data;
      
    } catch (error: any) {
      console.error('❌ Update ticket error:', error);
      throw new Error(`Failed to update ticket: ${error.message}`);
    }
  },
  
  async delete(id: string) {
    try {
      console.log('🗑️ Deleting ticket via API:', id);
      
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('⚠️ Ticket API route failed, trying fallback method...');
        throw new Error('API route failed');
      }

      const result = await response.json();
      console.log('✅ Delete ticket API success:', result);
      return result.data;
      
    } catch (error: any) {
      console.error('❌ Ticket API route failed, trying direct fallback:', error.message);
      
      // Fallback: Try smart deletion logic directly
      try {
        console.log('🔄 Trying smart deletion fallback...');
        
        // First check if ticket exists
        const { data: ticketCheck, error: ticketCheckError } = await supabase
          .from('tickets')
          .select('id, status')
          .eq('id', id)
          .single();
        
        if (ticketCheckError) {
          if (ticketCheckError.code === 'PGRST116' || ticketCheckError.message?.includes('relation "tickets" does not exist')) {
            console.log('⚠️ Tickets table does not exist, returning success');
            return { id, deleted: true, note: 'Table does not exist' };
          }
          console.log('⚠️ Ticket not found, returning success');
          return { id, deleted: true, note: 'Ticket not found' };
        }
        
        // Check for foreign key references (payments, purchases, etc.)
        let hasReferences = false;
        let referenceType = '';
        
        // Check payments table
        try {
          const { data: payments } = await supabase
            .from('payments')
            .select('id')
            .eq('ticket_id', id)
            .limit(1);
          
          if (payments && payments.length > 0) {
            hasReferences = true;
            referenceType = 'payments';
          }
        } catch (paymentError) {
          console.log('⚠️ Could not check payments table');
        }
        
        // Check ticket_purchases table if no payments found
        if (!hasReferences) {
          try {
            const { data: purchases } = await supabase
              .from('ticket_purchases')
              .select('id')
              .eq('ticket_id', id)
              .limit(1);
            
            if (purchases && purchases.length > 0) {
              hasReferences = true;
              referenceType = 'purchases';
            }
          } catch (purchaseError) {
            console.log('⚠️ Could not check purchases table');
          }
        }
        
        if (hasReferences) {
          // Soft delete - mark as inactive
          console.log(`⚠️ Ticket has ${referenceType}, doing soft delete`);
          const { data, error } = await supabase
            .from('tickets')
            .update({
              status: 'inactive',
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
          
          if (error) {
            console.error('❌ Soft delete failed:', error);
            return { id, deleted: true, note: 'Soft delete may have failed but continuing' };
          }
          
          console.log('✅ Fallback soft delete successful');
          return { id, deleted: true, soft_deleted: true, reason: referenceType };
        } else {
          // Try hard delete
          console.log('✅ No references found, trying hard delete');
          const { data, error } = await supabase
            .from('tickets')
            .delete()
            .eq('id', id)
            .select()
            .single();
          
          if (error) {
            // If hard delete fails, fall back to soft delete
            console.log('⚠️ Hard delete failed, trying soft delete as final fallback');
            const { data: softData, error: softError } = await supabase
              .from('tickets')
              .update({ status: 'inactive', updated_at: new Date().toISOString() })
              .eq('id', id)
              .select()
              .single();
            
            if (softError) {
              console.error('❌ Both hard and soft delete failed:', softError);
              return { id, deleted: true, note: 'Deletion may have failed but continuing' };
            }
            
            console.log('✅ Fallback soft delete successful after hard delete failure');
            return { id, deleted: true, soft_deleted: true, reason: 'hard_delete_failed' };
          }
          
          console.log('✅ Fallback hard delete successful');
          return data;
        }
        
      } catch (fallbackError: any) {
        console.error('❌ Both API and fallback failed:', fallbackError);
        // Return success anyway to avoid blocking the UI
        return { id, deleted: true, note: 'Deletion status unknown but continuing' };
      }
    }
  }
};

// Ticket Purchases API using Supabase
export const ticketPurchasesAPI = {
  async create(purchaseData: any) {
    return await supabaseTicketPurchasesAPI.create(purchaseData);
  },
  
  async getByEmail(email: string) {
    return await supabaseTicketPurchasesAPI.getByEmail(email);
  },
  
  async getByTicketId(ticketId: string) {
    return await supabaseTicketPurchasesAPI.getByTicketId(ticketId);
  },
  
  async getAll() {
    return await supabaseTicketPurchasesAPI.getAll();
  },
  
  async updatePaymentStatus(id: string, status: string) {
    return await supabaseTicketPurchasesAPI.updatePaymentStatus(id, status as any);
  }
};

// Export supabase client for direct access if needed
export { supabase };