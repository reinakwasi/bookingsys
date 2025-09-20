-- Admin Users Migration
-- Creates a secure admin users table with password hashing

-- Admin users table (separate from regular users for security)
CREATE TABLE public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for admin users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only authenticated admin users can read admin data
CREATE POLICY "Admin users can read admin data" ON public.admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Only existing admin users can create new admin users
CREATE POLICY "Admin users can create admin users" ON public.admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Admin users can update their own data
CREATE POLICY "Admin users can update own data" ON public.admin_users
  FOR UPDATE USING (id = auth.uid());

-- Create function to hash passwords (using pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create admin user with hashed password
CREATE OR REPLACE FUNCTION create_admin_user(
  p_username TEXT,
  p_password TEXT,
  p_email TEXT,
  p_full_name TEXT
)
RETURNS UUID AS $$
DECLARE
  new_admin_id UUID;
BEGIN
  INSERT INTO public.admin_users (username, password_hash, email, full_name)
  VALUES (
    p_username,
    crypt(p_password, gen_salt('bf', 12)),
    p_email,
    p_full_name
  )
  RETURNING id INTO new_admin_id;
  
  RETURN new_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify admin login
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
  SELECT * INTO admin_record
  FROM public.admin_users
  WHERE username = p_username AND is_active = true;
  
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

-- Function to change admin password
CREATE OR REPLACE FUNCTION change_admin_password(
  p_admin_id UUID,
  p_old_password TEXT,
  p_new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Get admin user record
  SELECT * INTO admin_record
  FROM public.admin_users
  WHERE id = p_admin_id AND is_active = true;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Verify old password
  IF admin_record.password_hash = crypt(p_old_password, admin_record.password_hash) THEN
    -- Update password
    UPDATE public.admin_users 
    SET 
      password_hash = crypt(p_new_password, gen_salt('bf', 12)),
      updated_at = NOW()
    WHERE id = p_admin_id;
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for emergency password reset (only for database admin)
CREATE OR REPLACE FUNCTION emergency_reset_admin_password(
  p_username TEXT,
  p_new_password TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.admin_users 
  SET 
    password_hash = crypt(p_new_password, gen_salt('bf', 12)),
    failed_login_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
  WHERE username = p_username AND is_active = true;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create initial admin user (change these credentials immediately!)
SELECT create_admin_user(
  'admin',
  'Hotel734!SecureAdmin2024',
  'admin@hotel734.com',
  'System Administrator'
);

-- Add trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON public.admin_users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.admin_users IS 'Secure admin users table with password hashing and account locking';
COMMENT ON FUNCTION verify_admin_login IS 'Verifies admin login credentials and handles account locking';
COMMENT ON FUNCTION create_admin_user IS 'Creates new admin user with hashed password';
COMMENT ON FUNCTION change_admin_password IS 'Allows admin to change their own password';
COMMENT ON FUNCTION emergency_reset_admin_password IS 'Emergency password reset function for database admin use only';
