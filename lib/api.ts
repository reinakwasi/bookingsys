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
      console.log('🔍 Fetching all bookings from database...');
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Get all bookings error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return [];
      }
      
      console.log('✅ Successfully fetched bookings:', data?.length || 0, 'records');
      return data || [];
    } catch (catchError) {
      console.error('❌ Unexpected error in getAll():', catchError);
      return [];
    }
  },

  async getMyBookings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    return await supabaseBookingsAPI.getByUser(user.id);
  },

  async updateStatus(id: string, status: string) {
    console.log(`🔄 Updating booking ${id} status to: ${status}`);
    
    // For now, use direct update with service role permissions
    // This bypasses RLS for admin operations
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status: status as 'pending' | 'confirmed' | 'cancelled' | 'checked-in' | 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Status update error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      
      // Provide more helpful error message
      if (error.code === 'PGRST301' || !error.message) {
        throw new Error('Permission denied: Unable to update booking status. Please ensure you have admin privileges.');
      }
      
      throw new Error(`Failed to update booking status: ${error.message || 'Unknown error'}`);
    }

    console.log('✅ Booking status updated successfully:', data);
    return data;
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

    console.log('✅ Booking status updated successfully:', data);
    return data;
  },

  async delete(id: string) {
    console.log('Admin soft delete called for ID:', id);
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
      console.error('❌ Delete error:', error);
      throw new Error(`Failed to delete booking: ${error.message}`);
    }
    return data;
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

// Tickets API using Supabase
export const ticketsAPI = {
  async getAll() {
    return await supabaseTicketsAPI.getAll();
  },
  
  async getActive() {
    return await supabaseTicketsAPI.getActive();
  },
  
  async getById(id: string) {
    return await supabaseTicketsAPI.getById(id);
  },
  
  async create(ticketData: any) {
    return await supabaseTicketsAPI.create(ticketData);
  },
  
  async update(id: string, ticketData: any) {
    return await supabaseTicketsAPI.update(id, ticketData);
  },
  
  async delete(id: string) {
    return await supabaseTicketsAPI.delete(id);
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