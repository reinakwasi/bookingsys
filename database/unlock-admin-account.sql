-- Unlock the admin account that got locked during testing
UPDATE public.admin_users 
SET 
  failed_login_attempts = 0,
  locked_until = NULL
WHERE username = 'admin';
