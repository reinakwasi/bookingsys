-- Add payment tracking fields to ticket_purchases table
DO $$
BEGIN
    -- Add payment_reference column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ticket_purchases' 
        AND column_name = 'payment_reference'
    ) THEN
        ALTER TABLE ticket_purchases ADD COLUMN payment_reference VARCHAR(255);
        CREATE INDEX IF NOT EXISTS idx_ticket_purchases_payment_reference ON ticket_purchases(payment_reference);
    END IF;

    -- Add payment_method column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ticket_purchases' 
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE ticket_purchases ADD COLUMN payment_method VARCHAR(50) DEFAULT 'paystack';
        CREATE INDEX IF NOT EXISTS idx_ticket_purchases_payment_method ON ticket_purchases(payment_method);
    END IF;
END $$;
