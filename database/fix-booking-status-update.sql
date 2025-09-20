-- Fix booking status update permissions for admin users
-- This allows authenticated admin users to update booking statuses

-- First, ensure the bookings table supports the new status values
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'checked-in', 'completed'));

-- Create policy to allow admin users to update booking statuses
CREATE POLICY "Admin can update booking status" ON public.bookings
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE username = current_user 
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE username = current_user 
      AND is_active = true
    )
  );

-- Also allow admin users to view all bookings for management
CREATE POLICY "Admin can view all bookings" ON public.bookings
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE username = current_user 
      AND is_active = true
    )
  );

-- Create admin function to update booking status
CREATE OR REPLACE FUNCTION admin_update_booking_status(
  booking_id UUID,
  new_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_exists BOOLEAN := FALSE;
BEGIN
  -- Check if current user is an active admin
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE username = current_user 
    AND is_active = true
  ) INTO admin_exists;
  
  -- If not admin, raise exception
  IF NOT admin_exists THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Validate status value
  IF new_status NOT IN ('pending', 'confirmed', 'cancelled', 'checked-in', 'completed') THEN
    RAISE EXCEPTION 'Invalid status value: %', new_status;
  END IF;
  
  -- Update the booking status
  UPDATE public.bookings 
  SET 
    status = new_status,
    updated_at = NOW()
  WHERE id = booking_id;
  
  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found: %', booking_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_update_booking_status(UUID, TEXT) TO authenticated;

-- Grant necessary permissions to authenticated users for booking operations
GRANT SELECT, UPDATE ON public.bookings TO authenticated;
GRANT SELECT ON public.admin_users TO authenticated;
