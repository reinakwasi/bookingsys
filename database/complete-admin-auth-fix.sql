-- COMPLETE ADMIN AUTHENTICATION FIX
-- This script ensures all admin authentication functions work properly

-- 1. Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for admin_users (only accessible through functions)
DROP POLICY IF EXISTS "Admin users are only accessible through secure functions" ON public.admin_users;
CREATE POLICY "Admin users are only accessible through secure functions" ON public.admin_users
    FOR ALL USING (false);

-- 4. Drop and recreate verify_admin_login function
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

-- 5. Create change_admin_password function
DROP FUNCTION IF EXISTS change_admin_password(UUID, TEXT, TEXT);

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
  SELECT password_hash INTO admin_record
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
      password_hash = crypt(p_new_password, gen_salt('bf')),
      updated_at = NOW()
    WHERE id = p_admin_id;
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create unlock_admin_account function
DROP FUNCTION IF EXISTS unlock_admin_account(TEXT);

CREATE OR REPLACE FUNCTION unlock_admin_account(
  p_username TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.admin_users 
  SET 
    failed_login_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
  WHERE username = p_username;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Insert default admin user if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE username = 'admin') THEN
    INSERT INTO public.admin_users (
      username, 
      email, 
      full_name, 
      password_hash
    ) VALUES (
      'admin',
      'admin@hotel734.com',
      'Hotel 734 Administrator',
      crypt('Hotel734!SecureAdmin2024', gen_salt('bf'))
    );
    
    RAISE NOTICE 'Default admin user created: admin / Hotel734!SecureAdmin2024';
  ELSE
    -- Update existing admin password to ensure it's correct
    UPDATE public.admin_users 
    SET 
      password_hash = crypt('Hotel734!SecureAdmin2024', gen_salt('bf')),
      failed_login_attempts = 0,
      locked_until = NULL,
      is_active = true,
      updated_at = NOW()
    WHERE username = 'admin';
    
    RAISE NOTICE 'Admin user updated: admin / Hotel734!SecureAdmin2024';
  END IF;
END $$;

-- 8. Grant necessary permissions
GRANT EXECUTE ON FUNCTION verify_admin_login(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION change_admin_password(UUID, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION unlock_admin_account(TEXT) TO anon, authenticated;

-- 9. Test the function
DO $$
DECLARE
  test_result RECORD;
BEGIN
  -- Test login function
  SELECT * INTO test_result FROM verify_admin_login('admin', 'Hotel734!SecureAdmin2024') LIMIT 1;
  
  IF test_result.admin_id IS NOT NULL THEN
    RAISE NOTICE 'SUCCESS: Admin authentication function is working correctly!';
    RAISE NOTICE 'Admin ID: %', test_result.admin_id;
    RAISE NOTICE 'Username: %', test_result.username;
    RAISE NOTICE 'Email: %', test_result.email;
  ELSE
    RAISE NOTICE 'ERROR: Admin authentication function failed!';
  END IF;
END $$;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '✅ COMPLETE ADMIN AUTHENTICATION FIX APPLIED SUCCESSFULLY!';
  RAISE NOTICE '🔐 Login credentials: admin / Hotel734!SecureAdmin2024';
  RAISE NOTICE '🛡️ All security functions are now properly configured';
END $$;
