-- Test script to verify ticket validation system is working properly
-- This script creates test data and verifies the format conversion

-- First, let's see what tickets currently exist
SELECT 
    'Current Tickets' as status,
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN ticket_number ~ '^TKT-[A-Z0-9]{8}$' THEN 1 END) as new_format_tickets,
    COUNT(CASE WHEN ticket_number ~ '^TKT-\d{10,13}-\d{3}$' THEN 1 END) as old_format_tickets
FROM individual_tickets;

-- Show sample tickets with their formats
SELECT 
    'Sample Tickets' as info,
    ticket_number,
    qr_code,
    status,
    created_at
FROM individual_tickets 
ORDER BY created_at DESC 
LIMIT 5;

-- Create a test ticket purchase to verify the new trigger works
DO $$
DECLARE
    test_ticket_id UUID;
    test_purchase_id UUID;
    new_ticket_numbers TEXT[];
BEGIN
    -- Get or create a test event ticket
    SELECT id INTO test_ticket_id FROM tickets WHERE title LIKE '%Test%' OR title LIKE '%Pool%' LIMIT 1;
    
    IF test_ticket_id IS NULL THEN
        -- Create a test ticket if none exists
        INSERT INTO tickets (
            title,
            description,
            price,
            total_quantity,
            available_quantity,
            event_date,
            event_time,
            venue,
            status
        ) VALUES (
            'Test Validation Event',
            'Test event for validation system',
            50.00,
            100,
            100,
            CURRENT_DATE + INTERVAL '7 days',
            '19:00:00',
            'Hotel 734 Test Venue',
            'active'
        ) RETURNING id INTO test_ticket_id;
        
        RAISE NOTICE 'Created test ticket: %', test_ticket_id;
    END IF;
    
    -- Create a test purchase (this should trigger the new format generation)
    INSERT INTO ticket_purchases (
        ticket_id,
        customer_name,
        customer_email,
        customer_phone,
        quantity,
        total_amount,
        payment_status,
        payment_method
    ) VALUES (
        test_ticket_id,
        'Test Validation User',
        'test-validation@hotel734.com',
        '+233244000000',
        2,
        100.00,
        'completed',
        'test'
    ) RETURNING id INTO test_purchase_id;
    
    RAISE NOTICE 'Created test purchase: %', test_purchase_id;
    
    -- Wait a moment for triggers to complete
    PERFORM pg_sleep(1);
    
    -- Check what individual tickets were created
    SELECT array_agg(ticket_number) INTO new_ticket_numbers
    FROM individual_tickets 
    WHERE purchase_id = test_purchase_id;
    
    RAISE NOTICE 'Generated ticket numbers: %', new_ticket_numbers;
    
    -- Verify the format
    IF array_length(new_ticket_numbers, 1) > 0 THEN
        FOR i IN 1..array_length(new_ticket_numbers, 1) LOOP
            IF new_ticket_numbers[i] ~ '^TKT-[A-Z0-9]{8}$' THEN
                RAISE NOTICE 'Ticket % has CORRECT new format', new_ticket_numbers[i];
            ELSE
                RAISE NOTICE 'Ticket % has INCORRECT format', new_ticket_numbers[i];
            END IF;
        END LOOP;
    END IF;
END $$;

-- Final verification - show the results
SELECT 
    'Final Status' as status,
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN ticket_number ~ '^TKT-[A-Z0-9]{8}$' THEN 1 END) as new_format_tickets,
    COUNT(CASE WHEN ticket_number ~ '^TKT-\d{10,13}-\d{3}$' THEN 1 END) as old_format_tickets,
    COUNT(CASE WHEN ticket_number !~ '^TKT-[A-Z0-9]{8}$' AND ticket_number !~ '^TKT-\d{10,13}-\d{3}$' THEN 1 END) as unknown_format_tickets
FROM individual_tickets;

-- Show the most recent tickets for manual verification
SELECT 
    'Recent Test Tickets' as info,
    it.ticket_number,
    it.qr_code,
    it.status,
    tp.customer_name,
    tp.created_at
FROM individual_tickets it
JOIN ticket_purchases tp ON it.purchase_id = tp.id
WHERE tp.customer_name = 'Test Validation User'
ORDER BY tp.created_at DESC;

-- Test validation patterns
SELECT 
    'Validation Test' as test_type,
    ticket_number,
    CASE 
        WHEN ticket_number ~ '^TKT-[A-Z0-9]{8}$' THEN 'NEW_FORMAT_VALID'
        WHEN ticket_number ~ '^TKT-\d{10,13}-\d{3}$' THEN 'OLD_FORMAT_VALID'
        ELSE 'INVALID_FORMAT'
    END as format_status,
    qr_code,
    CASE 
        WHEN qr_code ~ '^QR-[A-Z0-9]{8}$' THEN 'NEW_QR_VALID'
        WHEN qr_code ~ '^QR-\d{10,13}-[A-Z0-9]{8}-\d+$' THEN 'OLD_QR_VALID'
        ELSE 'INVALID_QR'
    END as qr_status
FROM individual_tickets 
ORDER BY created_at DESC 
LIMIT 10;
