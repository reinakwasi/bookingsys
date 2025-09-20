-- Hotel 734 Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT CHECK (role IN ('guest', 'admin')) DEFAULT 'guest',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  capacity INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table (supports both room and event bookings)
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  event_id UUID REFERENCES public.events(id), -- Optional for room bookings
  booking_type TEXT CHECK (booking_type IN ('room', 'event')) NOT NULL DEFAULT 'event',
  item_id TEXT, -- Room ID for room bookings, Event ID for event bookings
  guest_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  special_requests TEXT,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
CREATE TABLE public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  event_id UUID REFERENCES public.events(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('active', 'used', 'cancelled')) DEFAULT 'active',
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Everyone can read events
CREATE POLICY "Everyone can read events" ON public.events
  FOR SELECT USING (true);

-- Only admins can manage events
CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can read their own bookings
CREATE POLICY "Users can read own bookings" ON public.bookings
  FOR SELECT USING (
    auth.uid() = user_id OR 
    email = auth.jwt() ->> 'email'
  );

-- Users can create bookings
CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Admins can read all bookings
CREATE POLICY "Admins can read all bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can read their own tickets
CREATE POLICY "Users can read own tickets" ON public.tickets
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (true);

-- Admins can read all tickets
CREATE POLICY "Admins can read all tickets" ON public.tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON public.events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.events (name, description, category, date, price, capacity, image_url) VALUES
('Wedding Reception', 'Elegant wedding reception venue with full catering service', 'Wedding', '2024-12-15', 2500.00, 150, 'https://images.unsplash.com/photo-1519225421980-715cb0215aed'),
('Corporate Conference', 'Professional conference space with AV equipment', 'Corporate', '2024-11-20', 1200.00, 100, 'https://images.unsplash.com/photo-1511578314322-379afb476865'),
('Birthday Party', 'Private birthday celebration with decorations', 'Birthday', '2024-10-25', 800.00, 50, 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d'),
('Anniversary Dinner', 'Romantic anniversary dinner setup', 'Anniversary', '2024-11-10', 1500.00, 75, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0');
