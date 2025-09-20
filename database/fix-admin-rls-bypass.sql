-- Alternative approach: Create admin bypass policies using service role
-- This allows admin operations by bypassing RLS when using service role key

-- For bookings table - allow all operations when using service role
CREATE POLICY "Service role can manage all bookings" ON public.bookings
  FOR ALL USING (current_setting('role') = 'service_role');

-- For tickets table - allow all operations when using service role  
CREATE POLICY "Service role can manage all tickets" ON public.tickets
  FOR ALL USING (current_setting('role') = 'service_role');

-- For events table - allow all operations when using service role
CREATE POLICY "Service role can manage all events" ON public.events
  FOR ALL USING (current_setting('role') = 'service_role');
