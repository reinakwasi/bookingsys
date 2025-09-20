-- Update Room Type Names in Database
-- This migration updates existing bookings to use proper room type names
-- Run this in Supabase SQL Editor to update the database

-- Update existing bookings to use proper room type names
UPDATE public.bookings 
SET item_id = CASE 
    WHEN item_id = 'expensive' THEN 'royal_suite'
    WHEN item_id = 'standard' THEN 'superior_room' 
    WHEN item_id = 'regular' THEN 'classic_room'
    ELSE item_id
END
WHERE booking_type = 'room' 
AND item_id IN ('expensive', 'standard', 'regular');

-- Add a comment to track this migration
COMMENT ON TABLE public.bookings IS 'Updated room type names: expensive->royal_suite, standard->superior_room, regular->classic_room';

-- Verify the update
SELECT 
    item_id,
    COUNT(*) as booking_count
FROM public.bookings 
WHERE booking_type = 'room'
GROUP BY item_id
ORDER BY item_id;
