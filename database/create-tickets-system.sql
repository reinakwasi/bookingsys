-- Create tickets table for hotel activities
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    activity_type VARCHAR(100) NOT NULL, -- e.g., 'pool_party', 'conference', 'dinner', 'entertainment'
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    venue VARCHAR(255),
    duration_hours INTEGER DEFAULT 2,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold_out')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_purchases table (main purchase record)
CREATE TABLE IF NOT EXISTS ticket_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    quantity INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    access_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create individual_tickets table (individual ticket instances)
CREATE TABLE IF NOT EXISTS individual_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES ticket_purchases(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    holder_name VARCHAR(255),
    holder_email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'unused' CHECK (status IN ('unused', 'used', 'expired', 'transferred')),
    used_at TIMESTAMP WITH TIME ZONE,
    used_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_event_date ON tickets(event_date);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_activity_type ON tickets(activity_type);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_ticket_id ON ticket_purchases(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_customer_email ON ticket_purchases(customer_email);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_payment_status ON ticket_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_access_token ON ticket_purchases(access_token);
CREATE INDEX IF NOT EXISTS idx_individual_tickets_purchase_id ON individual_tickets(purchase_id);
CREATE INDEX IF NOT EXISTS idx_individual_tickets_qr_code ON individual_tickets(qr_code);
CREATE INDEX IF NOT EXISTS idx_individual_tickets_status ON individual_tickets(status);

-- Create function to update available quantity when tickets are purchased
CREATE OR REPLACE FUNCTION update_ticket_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- Update available quantity when a purchase is made
    IF TG_OP = 'INSERT' THEN
        UPDATE tickets 
        SET available_quantity = available_quantity - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.ticket_id;
        
        -- Update status to sold_out if no tickets left
        UPDATE tickets 
        SET status = 'sold_out'
        WHERE id = NEW.ticket_id AND available_quantity <= 0;
        
        RETURN NEW;
    END IF;
    
    -- Handle refunds/cancellations
    IF TG_OP = 'DELETE' THEN
        UPDATE tickets 
        SET available_quantity = available_quantity + OLD.quantity,
            status = CASE 
                WHEN status = 'sold_out' AND available_quantity + OLD.quantity > 0 THEN 'active'
                ELSE status
            END,
            updated_at = NOW()
        WHERE id = OLD.ticket_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update ticket availability
DROP TRIGGER IF EXISTS trigger_update_ticket_availability ON ticket_purchases;
CREATE TRIGGER trigger_update_ticket_availability
    AFTER INSERT OR DELETE ON ticket_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_availability();

-- Create function to generate QR codes for tickets
CREATE OR REPLACE FUNCTION generate_ticket_qr_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate a unique QR code for each ticket purchase
    NEW.qr_code = 'TICKET-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate individual tickets and access tokens
CREATE OR REPLACE FUNCTION create_individual_tickets()
RETURNS TRIGGER AS $$
DECLARE
    i INTEGER;
    ticket_num VARCHAR(50);
    qr_code_val VARCHAR(255);
    access_token_val VARCHAR(255);
BEGIN
    -- Generate unique access token for the purchase
    NEW.access_token = 'ACCESS-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate individual tickets after purchase
CREATE OR REPLACE FUNCTION generate_individual_tickets()
RETURNS TRIGGER AS $$
DECLARE
    i INTEGER;
    ticket_num VARCHAR(50);
    qr_code_val VARCHAR(255);
    timestamp_val BIGINT;
BEGIN
    -- Get current timestamp once for consistency
    timestamp_val = EXTRACT(EPOCH FROM NOW())::BIGINT;
    
    -- Create individual tickets for each quantity purchased
    FOR i IN 1..NEW.quantity LOOP
        ticket_num = 'TKT-' || timestamp_val || '-' || LPAD(i::TEXT, 3, '0');
        qr_code_val = 'QR-' || timestamp_val || '-' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8) || '-' || i::TEXT;
        
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

-- Create triggers
DROP TRIGGER IF EXISTS trigger_generate_access_token ON ticket_purchases;
CREATE TRIGGER trigger_generate_access_token
    BEFORE INSERT ON ticket_purchases
    FOR EACH ROW
    EXECUTE FUNCTION create_individual_tickets();

DROP TRIGGER IF EXISTS trigger_generate_individual_tickets ON ticket_purchases;
CREATE TRIGGER trigger_generate_individual_tickets
    AFTER INSERT ON ticket_purchases
    FOR EACH ROW
    EXECUTE FUNCTION generate_individual_tickets();

-- Add RLS (Row Level Security) policies
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on tickets" ON tickets;
DROP POLICY IF EXISTS "Allow all operations on ticket_purchases" ON ticket_purchases;
DROP POLICY IF EXISTS "Allow all operations on individual_tickets" ON individual_tickets;

-- Policy for tickets - allow all operations for now (can be restricted later)
CREATE POLICY "Allow all operations on tickets" ON tickets
    FOR ALL USING (true);

-- Policy for ticket_purchases - allow all operations for now (can be restricted later)
CREATE POLICY "Allow all operations on ticket_purchases" ON ticket_purchases
    FOR ALL USING (true);

-- Policy for individual_tickets - allow all operations for now (can be restricted later)
CREATE POLICY "Allow all operations on individual_tickets" ON individual_tickets
    FOR ALL USING (true);
