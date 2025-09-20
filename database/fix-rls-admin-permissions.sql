-- Fix RLS policies to allow admin operations
-- Drop existing restrictive admin policies
DROP POLICY IF EXISTS "Admins can read all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can read all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;

-- Create permissive policies for admin operations
CREATE POLICY "Allow admin operations on bookings" ON public.bookings
  FOR ALL USING (true);

CREATE POLICY "Allow admin operations on tickets" ON public.tickets  
  FOR ALL USING (true);

CREATE POLICY "Allow admin operations on events" ON public.events
  FOR ALL USING (true);
