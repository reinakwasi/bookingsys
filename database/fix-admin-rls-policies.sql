-- Fix RLS policies to recognize admin_users table for admin operations

-- Drop existing admin policies that reference the wrong table
DROP POLICY IF EXISTS "Admins can read all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can read all tickets" ON public.tickets;

-- Create new admin policies that check admin_users table
CREATE POLICY "Admin users can manage all bookings" ON public.bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin users can manage all tickets" ON public.tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Also update events policies to use admin_users
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;

CREATE POLICY "Admin users can manage events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );
