-- Fix access_token column if it doesn't exist
DO $$ 
BEGIN
    -- Check if access_token column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ticket_purchases' 
        AND column_name = 'access_token'
    ) THEN
        ALTER TABLE ticket_purchases ADD COLUMN access_token VARCHAR(255) UNIQUE;
        CREATE INDEX IF NOT EXISTS idx_ticket_purchases_access_token ON ticket_purchases(access_token);
    END IF;
END $$;

-- Update the trigger function to handle access_token properly
CREATE OR REPLACE FUNCTION create_individual_tickets()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate unique access token for the purchase
    NEW.access_token = 'ACCESS-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_generate_access_token ON ticket_purchases;
CREATE TRIGGER trigger_generate_access_token
    BEFORE INSERT ON ticket_purchases
    FOR EACH ROW
    EXECUTE FUNCTION create_individual_tickets();
