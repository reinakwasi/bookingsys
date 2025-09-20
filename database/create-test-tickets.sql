-- Create test tickets and purchases for validation testing

-- First, clean up any existing test data to avoid conflicts
DELETE FROM individual_tickets WHERE ticket_number LIKE 'TKT-1757889%';
DELETE FROM ticket_purchases WHERE access_token LIKE 'ACCESS-1757889%';
DELETE FROM tickets WHERE title = 'Pool Party Experience';

-- Insert a test ticket/event
INSERT INTO tickets (
    id,
    title,
    description,
    activity_type,
    event_date,
    event_time,
    price,
    total_quantity,
    available_quantity,
    venue,
    status
) VALUES (
    gen_random_uuid(),
    'Pool Party Experience',
    'Exclusive pool party with DJ and refreshments',
    'pool_party',
    '2024-12-25',
    '18:00:00',
    150.00,
    100,
    95,
    'Hotel 734 Pool Area',
    'active'
) ON CONFLICT DO NOTHING;

-- Disable triggers temporarily to avoid conflicts
ALTER TABLE ticket_purchases DISABLE TRIGGER trigger_generate_individual_tickets;

-- Get the ticket ID for the test purchase
DO $$
DECLARE
    test_ticket_id UUID;
    test_purchase_id UUID;
BEGIN
    -- Get the ticket ID
    SELECT id INTO test_ticket_id FROM tickets WHERE title = 'Pool Party Experience' LIMIT 1;
    
    -- Create a test purchase (without triggering automatic individual ticket creation)
    INSERT INTO ticket_purchases (
        id,
        ticket_id,
        customer_name,
        customer_email,
        customer_phone,
        quantity,
        total_amount,
        payment_status,
        access_token
    ) VALUES (
        gen_random_uuid(),
        test_ticket_id,
        'John Doe',
        'john.doe@example.com',
        '+233123456789',
        1,
        150.00,
        'completed',
        'ACCESS-1757889235-001'
    ) RETURNING id INTO test_purchase_id;
    
    -- Manually create the individual ticket with the specific ticket number from the image
    INSERT INTO individual_tickets (
        id,
        purchase_id,
        ticket_id,
        ticket_number,
        qr_code,
        holder_name,
        holder_email,
        status
    ) VALUES (
        gen_random_uuid(),
        test_purchase_id,
        test_ticket_id,
        'TKT-1757889235-001',
        'TKT-1757889235-001',
        'John Doe',
        'john.doe@example.com',
        'unused'
    );
    
END $$;

-- Create additional test tickets for more testing
DO $$
DECLARE
    test_ticket_id UUID;
    test_purchase_id UUID;
    i INTEGER;
BEGIN
    -- Get the ticket ID
    SELECT id INTO test_ticket_id FROM tickets WHERE title = 'Pool Party Experience' LIMIT 1;
    
    -- Create more test purchases (triggers are disabled, so we manually create individual tickets)
    FOR i IN 2..5 LOOP
        INSERT INTO ticket_purchases (
            id,
            ticket_id,
            customer_name,
            customer_email,
            customer_phone,
            quantity,
            total_amount,
            payment_status,
            access_token
        ) VALUES (
            gen_random_uuid(),
            test_ticket_id,
            'Test User ' || i,
            'test' || i || '@example.com',
            '+23312345678' || i,
            1,
            150.00,
            'completed',
            'ACCESS-175788923' || i || '-00' || i
        ) RETURNING id INTO test_purchase_id;
        
        -- Manually create individual tickets
        INSERT INTO individual_tickets (
            id,
            purchase_id,
            ticket_id,
            ticket_number,
            qr_code,
            holder_name,
            holder_email,
            status
        ) VALUES (
            gen_random_uuid(),
            test_purchase_id,
            test_ticket_id,
            'TKT-175788923' || i || '-00' || i,
            'TKT-175788923' || i || '-00' || i,
            'Test User ' || i,
            'test' || i || '@example.com',
            'unused'
        );
    END LOOP;
    
END $$;

-- Re-enable triggers after manual data creation
ALTER TABLE ticket_purchases ENABLE TRIGGER trigger_generate_individual_tickets;
