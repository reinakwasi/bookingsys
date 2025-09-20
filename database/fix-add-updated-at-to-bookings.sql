-- Add updated_at column to bookings table if it does not exist
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Backfill updated_at for existing rows
UPDATE public.bookings SET updated_at = NOW() WHERE updated_at IS NULL;
