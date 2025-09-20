-- Fix verify_admin_login function - removes column ambiguity
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
BEGIN
  -- Get admin user record with fully qualified column names
  SELECT 
    admin_users.id,
    admin_users.username,
    admin_users.email,
    admin_users.full_name,
    admin_users.password_hash,
    admin_users.failed_login_attempts,
    admin_users.locked_until
  INTO admin_record
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
      true;
    RETURN;
  END IF;
  
  -- Verify password
  IF admin_record.password_hash = crypt(p_password, admin_record.password_hash) THEN
    -- Reset failed attempts and update last login
    UPDATE public.admin_users 
    SET 
      failed_login_attempts = 0,
      locked_until = NULL,
      last_login = NOW()
    WHERE admin_users.id = admin_record.id;
    
    -- Return successful login data
    RETURN QUERY SELECT 
      admin_record.id,
      admin_record.username,
      admin_record.email,
      admin_record.full_name,
      false;
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
    WHERE admin_users.id = admin_record.id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
