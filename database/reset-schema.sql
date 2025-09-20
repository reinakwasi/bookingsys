-- Reset and recreate Hotel 734 Database Schema
-- Run this first to clean up existing tables

-- Drop existing tables (in reverse order due to dependencies)
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Now run the main schema.sql file after this
