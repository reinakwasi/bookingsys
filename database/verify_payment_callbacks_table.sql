-- Verify payment_callbacks table exists and is configured correctly

-- 1. Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'payment_callbacks'
) as table_exists;

-- 2. Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payment_callbacks'
ORDER BY ordinal_position;

-- 3. Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'payment_callbacks';

-- 4. Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'payment_callbacks';

-- 5. Check existing policies
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'payment_callbacks';

-- 6. Test query to see if table is accessible
SELECT COUNT(*) as total_callbacks
FROM payment_callbacks;
