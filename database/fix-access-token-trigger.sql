-- Fix Access Token System - Remove conflicting triggers and update existing data
-- This script fixes the conflict between the database trigger generating ACCESS- tokens
-- and the application code generating 8-character short hashes

-- Step 1: Drop the conflicting triggers and functions that overwrite access_token
-- Drop all possible trigger names that might exist
DROP TRIGGER IF EXISTS create_individual_tickets_trigger ON ticket_purchases;
DROP TRIGGER IF EXISTS trigger_generate_access_token ON ticket_purchases;
DROP TRIGGER IF EXISTS generate_individual_tickets_trigger ON ticket_purchases;

-- Drop functions with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS create_individual_tickets() CASCADE;
DROP FUNCTION IF EXISTS generate_individual_tickets() CASCADE;

-- Step 2: Create a new trigger that only generates access_token if it's NULL
-- This allows our application code to set the access_token, but provides a fallback
CREATE OR REPLACE FUNCTION ensure_access_token()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate access_token if it's not already set by the application
    IF NEW.access_token IS NULL OR NEW.access_token = '' THEN
        -- Generate a short 8-character token as fallback
        NEW.access_token = UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT) FROM 1 FOR 8));
        RAISE NOTICE 'Generated fallback access_token: %', NEW.access_token;
    END IF;
    
    -- Ensure QR code is set
    IF NEW.qr_code IS NULL OR NEW.qr_code = '' THEN
        NEW.qr_code = 'QR-' || NEW.access_token;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create the new trigger
CREATE TRIGGER ensure_access_token_trigger
    BEFORE INSERT OR UPDATE ON ticket_purchases
    FOR EACH ROW
    EXECUTE FUNCTION ensure_access_token();

-- Step 4: Update existing ACCESS- tokens to short 8-character format
-- This will convert existing long tokens to short ones and ensure consistent QR codes
DO $$
DECLARE
    purchase_record RECORD;
    new_token VARCHAR(8);
BEGIN
    FOR purchase_record IN 
        SELECT id FROM ticket_purchases WHERE access_token LIKE 'ACCESS-%'
    LOOP
        -- Generate consistent 8-character token
        new_token := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || purchase_record.id::TEXT) FROM 1 FOR 8));
        
        -- Update both access_token and qr_code consistently
        UPDATE ticket_purchases 
        SET access_token = new_token,
            qr_code = 'QR-' || new_token
        WHERE id = purchase_record.id;
        
        RAISE NOTICE 'Updated purchase % with new token: %', purchase_record.id, new_token;
    END LOOP;
END $$;

-- Step 5: Show the results
SELECT 
    COUNT(*) as total_purchases,
    COUNT(CASE WHEN access_token LIKE 'ACCESS-%' THEN 1 END) as old_format_remaining,
    COUNT(CASE WHEN LENGTH(access_token) = 8 THEN 1 END) as new_format_count
FROM ticket_purchases;

-- Step 6: Verify the trigger works by showing a sample
SELECT 
    id, 
    customer_name, 
    access_token, 
    qr_code,
    created_at
FROM ticket_purchases 
ORDER BY created_at DESC 
LIMIT 5;

-- Final status messages
DO $$
BEGIN
    RAISE NOTICE 'Access token system has been fixed!';
    RAISE NOTICE 'Old ACCESS- tokens have been converted to 8-character format';
    RAISE NOTICE 'New purchases will use application-generated short hashes';
    RAISE NOTICE 'Fallback trigger will generate 8-character tokens if application fails';
END $$;
