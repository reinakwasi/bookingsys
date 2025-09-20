-- Fix RLS policies for admin operations on bookings
-- This ensures admins can properly read, update, and delete bookings
-- Run this in your Supabase SQL Editor

-- Drop existing admin policies to recreate them
DROP POLICY IF EXISTS "Admins can read all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;

-- Create a more permissive admin read policy
CREATE POLICY "Admins can read all bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR
    -- Allow service role to read all bookings (for admin operations)
    auth.role() = 'service_role'
  );

-- Admins can update booking status and soft delete
CREATE POLICY "Admins can update bookings" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR
    auth.role() = 'service_role'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR
    auth.role() = 'service_role'
  );

-- Admins can perform hard deletes if needed
CREATE POLICY "Admins can delete bookings" ON public.bookings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR
    auth.role() = 'service_role'
  );

-- Ensure the deleted_at column exists for soft deletes
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add an index for better performance when filtering deleted bookings
CREATE INDEX IF NOT EXISTS idx_bookings_status_not_deleted 
ON public.bookings (status) 
WHERE status != 'deleted';

-- Add an index for deleted bookings
CREATE INDEX IF NOT EXISTS idx_bookings_deleted 
ON public.bookings (status, deleted_at) 
WHERE status = 'deleted';
