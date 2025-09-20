-- Remove all ticket-related tables and policies from the database
-- Run this SQL in your Supabase SQL Editor

-- Drop tickets table and related policies
DROP POLICY IF EXISTS "Users can read own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can read all tickets" ON public.tickets;
DROP TABLE IF EXISTS public.tickets;

-- Remove ticket-related columns from other tables if they exist
-- (No ticket columns found in other tables, but this is for safety)

-- Clean up any ticket-related functions or triggers
-- (None found in the current schema)

-- Note: This will permanently delete all ticket data
-- Make sure to backup any important data before running this script
