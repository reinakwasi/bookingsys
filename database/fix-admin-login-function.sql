-- Fix for verify_admin_login function - resolves column ambiguity error
-- Run this SQL in Supabase to fix the login issue

-- Drop and recreate the verify_admin_login function with proper table qualifiers
DROP FUNCTION IF EXISTS verify_admin_login(TEXT, TEXT);

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
  -- Get admin user record with explicit table qualification
  SELECT 
    au.id,
    au.username,
    au.email,
    au.full_name,
    au.password_hash,
    au.failed_login_attempts,
    au.locked_until,
    au.is_active
  INTO admin_record
  FROM public.admin_users au
  WHERE au.username = p_username AND au.is_active = true;
  
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
