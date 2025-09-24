-- Fix All RLS Security Issues
-- This script addresses all the security warnings from Supabase Security Advisor

-- Enable RLS on all public tables that are missing it
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies and recreate them properly
DROP POLICY IF EXISTS "Authenticated can manage replies" ON public.message_replies;

-- ===== ADMIN USERS TABLE POLICIES =====
-- Only allow admin users to read admin data (no public access)
DROP POLICY IF EXISTS "Admin users can read admin data" ON public.admin_users;
CREATE POLICY "Admin users can read admin data" ON public.admin_users
  FOR SELECT USING (false); -- No direct access through RLS, only through functions

DROP POLICY IF EXISTS "Admin users can create admin users" ON public.admin_users;
CREATE POLICY "Admin users can create admin users" ON public.admin_users
  FOR INSERT WITH CHECK (false); -- Only through functions

DROP POLICY IF EXISTS "Admin users can update own data" ON public.admin_users;
CREATE POLICY "Admin users can update own data" ON public.admin_users
  FOR UPDATE USING (false); -- Only through functions

-- ===== MESSAGES TABLE POLICIES =====
-- Anyone can create messages (contact form submissions)
CREATE POLICY "Anyone can create messages" ON public.messages
  FOR INSERT WITH CHECK (true);

-- Only admins can read messages
CREATE POLICY "Admins can read messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE username = current_setting('app.current_admin_username', true)
      AND is_active = true
    )
  );

-- Only admins can update messages (mark as read)
CREATE POLICY "Admins can update messages" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE username = current_setting('app.current_admin_username', true)
      AND is_active = true
    )
  );

-- ===== MESSAGE REPLIES TABLE POLICIES =====
-- Only admins can create replies
CREATE POLICY "Admins can create replies" ON public.message_replies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE username = current_setting('app.current_admin_username', true)
      AND is_active = true
    )
  );

-- Only admins can read replies
CREATE POLICY "Admins can read replies" ON public.message_replies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE username = current_setting('app.current_admin_username', true)
      AND is_active = true
    )
  );

-- ===== PAYMENTS TABLE POLICIES =====
-- Create payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id),
  ticket_id UUID REFERENCES public.tickets(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  payment_method TEXT NOT NULL,
  payment_reference TEXT UNIQUE NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('pending', 'successful', 'failed', 'cancelled')) DEFAULT 'pending',
  paystack_reference TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Only create policies if the table actually exists and has the expected columns
DO $$
BEGIN
  -- Check if payments table exists and has the expected structure
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'payments'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'booking_id'
  ) THEN
    
    -- Users can read their own payments
    DROP POLICY IF EXISTS "Users can read own payments" ON public.payments;
    CREATE POLICY "Users can read own payments" ON public.payments
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.bookings b
          WHERE b.id = payments.booking_id 
          AND (b.user_id = auth.uid() OR b.email = auth.jwt() ->> 'email')
        )
        OR
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = payments.ticket_id 
          AND t.user_id = auth.uid()
        )
      );

    -- Users can create payments for their bookings/tickets
    DROP POLICY IF EXISTS "Users can create payments" ON public.payments;
    CREATE POLICY "Users can create payments" ON public.payments
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.bookings b
          WHERE b.id = payments.booking_id 
          AND (b.user_id = auth.uid() OR b.email = auth.jwt() ->> 'email')
        )
        OR
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = payments.ticket_id 
          AND t.user_id = auth.uid()
        )
      );

    -- Admins can read all payments
    DROP POLICY IF EXISTS "Admins can read all payments" ON public.payments;
    CREATE POLICY "Admins can read all payments" ON public.payments
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.admin_users 
          WHERE username = current_setting('app.current_admin_username', true)
          AND is_active = true
        )
      );
      
    RAISE NOTICE 'Created RLS policies for payments table';
  ELSE
    RAISE NOTICE 'Payments table does not exist or has different structure - skipping policies';
  END IF;
END
$$;

-- ===== ADDITIONAL SECURITY MEASURES =====

-- Create function to set admin context (for admin operations)
CREATE OR REPLACE FUNCTION set_admin_context(admin_username TEXT)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_admin_username', admin_username, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the verify_admin_login function to set context
CREATE OR REPLACE FUNCTION verify_admin_login(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE(
  admin_id UUID,
  username TEXT,
  email TEXT,
  full_name TEXT,
  is_locked BOOLEAN
) AS $$
DECLARE
  admin_record RECORD;
  is_password_valid BOOLEAN := false;
BEGIN
  -- Get admin user record
  SELECT admin_users.* INTO admin_record
  FROM public.admin_users
  WHERE admin_users.username = p_username AND admin_users.is_active = true;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check if account is locked
  IF admin_record.locked_until IS NOT NULL AND admin_record.locked_until > NOW() THEN
    RETURN QUERY SELECT 
      admin_record.id,
      admin_record.username,
      admin_record.email,
      admin_record.full_name,
      true as is_locked;
    RETURN;
  END IF;
  
  -- Verify password
  is_password_valid := (admin_record.password_hash = crypt(p_password, admin_record.password_hash));
  
  IF is_password_valid THEN
    -- Set admin context for this session
    PERFORM set_admin_context(admin_record.username);
    
    -- Reset failed attempts and update last login
    UPDATE public.admin_users 
    SET 
      failed_login_attempts = 0,
      locked_until = NULL,
      last_login = NOW()
    WHERE id = admin_record.id;
    
    -- Return successful login data
    RETURN QUERY SELECT 
      admin_record.id,
      admin_record.username,
      admin_record.email,
      admin_record.full_name,
      false as is_locked;
  ELSE
    -- Increment failed attempts
    UPDATE public.admin_users 
    SET 
      failed_login_attempts = failed_login_attempts + 1,
      locked_until = CASE 
        WHEN failed_login_attempts + 1 >= 5 
        THEN NOW() + INTERVAL '30 minutes'
        ELSE NULL
      END
    WHERE id = admin_record.id;
    
    -- Return nothing for invalid login
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.events TO anon, authenticated;
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT INSERT ON public.tickets TO anon, authenticated;
GRANT INSERT ON public.messages TO anon, authenticated;
GRANT INSERT ON public.payments TO anon, authenticated;

-- Revoke dangerous permissions
REVOKE ALL ON public.admin_users FROM anon, authenticated;
REVOKE ALL ON public.message_replies FROM anon, authenticated;

-- Add trigger for payments updated_at (only if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'payments'
  ) THEN
    DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
    CREATE TRIGGER update_payments_updated_at 
      BEFORE UPDATE ON public.payments 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE 'Created trigger for payments table';
  END IF;
END
$$;

-- Add comments for documentation
COMMENT ON TABLE public.payments IS 'Payment records for bookings and tickets with RLS security';
COMMENT ON FUNCTION set_admin_context IS 'Sets admin context for RLS policies';

-- Final security check - ensure all public tables have RLS enabled
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
        RAISE NOTICE 'Enabled RLS on table: %.%', r.schemaname, r.tablename;
    END LOOP;
END
$$;

-- Success message
SELECT 'RLS Security Issues Fixed Successfully! All public tables now have proper Row Level Security enabled.' as status;
