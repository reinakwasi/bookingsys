-- Make all bookings visible to all users (for debugging or public dashboard)
-- This will allow the admin dashboard to see all bookings regardless of user
-- Run this in your Supabase SQL Editor

DROP POLICY IF EXISTS "Users can read own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can read all bookings" ON public.bookings;

CREATE POLICY "Anyone can read all bookings" ON public.bookings
  FOR SELECT USING (true);
