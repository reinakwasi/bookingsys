import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: 'guest' | 'admin'
  created_at: string
}

export interface Event {
  id: string
  name: string
  description: string
  category: string
  date: string
  price: number
  capacity: number
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  user_id?: string
  event_id?: string
  booking_type: 'room' | 'event'
  item_id?: string
  guest_name: string
  email: string
  phone: string
  start_date: string
  end_date: string
  guests_count: number
  total_price: number
  special_requests?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked-in' | 'completed'
  created_at: string
  // Support both camelCase and snake_case for compatibility
  guestName?: string
  startDate?: string
  endDate?: string
  numberOfGuests?: number
  totalPrice?: number
  specialRequests?: string
  bookingType?: 'room' | 'event'
  itemId?: string
}

export interface Ticket {
  id: string
  title: string
  description?: string
  activity_type: string
  event_date: string
  event_time: string
  price: number
  total_quantity: number
  available_quantity: number
  image_url?: string
  venue?: string
  duration_hours?: number
  status: 'active' | 'inactive' | 'sold_out'
  created_at: string
  updated_at: string
}

export interface TicketPurchase {
  id: string
  ticket_id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  quantity: number
  total_amount: number
  purchase_date: string
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_reference?: string
  payment_method?: string
  qr_code?: string
  special_requests?: string
  created_at: string
  access_token?: string
  // Joined ticket data
  ticket?: Ticket
}

