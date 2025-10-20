-- Fix ticket number and QR code format to match validation logic
-- This updates the database trigger to generate the correct format

-- Drop existing trigger
DROP TRIGGER IF EXISTS trigger_generate_individual_tickets ON ticket_purchases;

-- Update the function to generate correct ticket format
CREATE OR REPLACE FUNCTION generate_individual_tickets()
RETURNS TRIGGER AS $$
DECLARE
    i INTEGER;
    ticket_num VARCHAR(50);
    qr_code_val VARCHAR(255);
    base_id VARCHAR(8);
BEGIN
    -- Get 8-character base from purchase ID (uppercase)
    base_id = UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 8));
    
    -- Create individual tickets for each quantity purchased
    FOR i IN 1..NEW.quantity LOOP
        -- Generate ticket number: TKT-[8-CHAR-ID][SEQUENCE]
        -- If quantity > 1, append sequence number to make unique
        IF NEW.quantity = 1 THEN
            ticket_num = 'TKT-' || base_id;
            qr_code_val = 'QR-' || base_id;
        ELSE
            -- For multiple tickets, append sequence to ensure uniqueness
            ticket_num = 'TKT-' || SUBSTRING(base_id FROM 1 FOR 6) || LPAD(i::TEXT, 2, '0');
            qr_code_val = 'QR-' || SUBSTRING(base_id FROM 1 FOR 6) || LPAD(i::TEXT, 2, '0');
        END IF;
        
        INSERT INTO individual_tickets (
            purchase_id,
            ticket_id,
            ticket_number,
            qr_code,
            holder_name,
            holder_email
        ) VALUES (
            NEW.id,
            NEW.ticket_id,
            ticket_num,
            qr_code_val,
            NEW.customer_name,
            NEW.customer_email
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_generate_individual_tickets
    AFTER INSERT ON ticket_purchases
    FOR EACH ROW
    EXECUTE FUNCTION generate_individual_tickets();

-- Update existing tickets to new format (if any exist)
DO $$
DECLARE
    ticket_record RECORD;
    new_ticket_num VARCHAR(50);
    new_qr_code VARCHAR(255);
    base_id VARCHAR(8);
    sequence_num INTEGER;
BEGIN
    -- Update existing individual tickets to new format
    sequence_num := 1;
    
    FOR ticket_record IN 
        SELECT it.id, it.purchase_id, tp.id as purchase_uuid
        FROM individual_tickets it
        JOIN ticket_purchases tp ON it.purchase_id = tp.id
        ORDER BY it.purchase_id, it.created_at
    LOOP
        -- Get 8-character base from purchase ID
        base_id := UPPER(SUBSTRING(ticket_record.purchase_uuid::TEXT FROM 1 FOR 8));
        
        -- Generate new format
        new_ticket_num := 'TKT-' || base_id;
        new_qr_code := 'QR-' || base_id;
        
        -- If there are multiple tickets for same purchase, add sequence
        IF (SELECT COUNT(*) FROM individual_tickets WHERE purchase_id = ticket_record.purchase_id) > 1 THEN
            new_ticket_num := 'TKT-' || SUBSTRING(base_id FROM 1 FOR 6) || LPAD(sequence_num::TEXT, 2, '0');
            new_qr_code := 'QR-' || SUBSTRING(base_id FROM 1 FOR 6) || LPAD(sequence_num::TEXT, 2, '0');
            sequence_num := sequence_num + 1;
        ELSE
            sequence_num := 1;
        END IF;
        
        -- Update the ticket
        UPDATE individual_tickets 
        SET 
            ticket_number = new_ticket_num,
            qr_code = new_qr_code,
            updated_at = NOW()
        WHERE id = ticket_record.id;
        
        RAISE NOTICE 'Updated ticket % to %', ticket_record.id, new_ticket_num;
    END LOOP;
END $$;

-- Verify the changes
SELECT 
    'Updated Tickets' as status,
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN ticket_number ~ '^TKT-[A-Z0-9]{8}$' THEN 1 END) as correct_format_tickets
FROM individual_tickets;
