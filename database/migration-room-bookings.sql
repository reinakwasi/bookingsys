-- Migration script to add room booking support to existing bookings table
-- Run this in your Supabase SQL Editor to update the schema

-- Add new columns to support room bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS booking_type TEXT CHECK (booking_type IN ('room', 'event')) DEFAULT 'event',
ADD COLUMN IF NOT EXISTS item_id TEXT;

-- Make event_id optional (allow NULL for room bookings)
ALTER TABLE public.bookings 
ALTER COLUMN event_id DROP NOT NULL;

-- Update existing bookings to have booking_type = 'event'
UPDATE public.bookings 
SET booking_type = 'event' 
WHERE booking_type IS NULL;

-- Make booking_type NOT NULL after setting default values
ALTER TABLE public.bookings 
ALTER COLUMN booking_type SET NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.bookings.booking_type IS 'Type of booking: room or event';
COMMENT ON COLUMN public.bookings.item_id IS 'Room ID for room bookings, Event ID for event bookings';
COMMENT ON COLUMN public.bookings.event_id IS 'Event ID (only for event bookings, NULL for room bookings)';
