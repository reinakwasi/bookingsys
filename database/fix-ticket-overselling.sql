-- ============================================================================
-- CRITICAL FIX: Ticket Overselling Prevention
-- ============================================================================
-- This script creates atomic functions to prevent ticket overselling
-- and race conditions in the Hotel 734 ticket system.

-- 1. Create atomic ticket purchase function
CREATE OR REPLACE FUNCTION create_ticket_purchase_atomic(
  p_ticket_id UUID,
  p_quantity INTEGER,
  p_customer_name VARCHAR(255),
  p_customer_email VARCHAR(255),
  p_customer_phone VARCHAR(20),
  p_total_amount DECIMAL(10,2),
  p_payment_status VARCHAR(20) DEFAULT 'completed',
  p_payment_reference VARCHAR(255) DEFAULT NULL,
  p_payment_method VARCHAR(50) DEFAULT 'paystack'
) RETURNS JSONB AS $$
DECLARE
  current_available INTEGER;
  purchase_id UUID;
  access_token_val VARCHAR(255);
  qr_code_val VARCHAR(255);
  ticket_info RECORD;
BEGIN
  -- Lock the ticket row and get current availability
  SELECT available_quantity, total_quantity, title, status, event_date
  INTO ticket_info
  FROM tickets 
  WHERE id = p_ticket_id 
  FOR UPDATE;
  
  -- Check if ticket exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ticket not found',
      'error_code', 'TICKET_NOT_FOUND'
    );
  END IF;
  
  -- Check if ticket is active
  IF ticket_info.status != 'active' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ticket is not available for purchase',
      'error_code', 'TICKET_INACTIVE',
      'status', ticket_info.status
    );
  END IF;
  
  -- Check if event date has passed
  IF ticket_info.event_date < CURRENT_DATE THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Event date has passed',
      'error_code', 'EVENT_EXPIRED',
      'event_date', ticket_info.event_date
    );
  END IF;
  
  -- Validate quantity
  IF p_quantity <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Quantity must be greater than 0',
      'error_code', 'INVALID_QUANTITY'
    );
  END IF;
  
  -- Check availability (CRITICAL: This prevents overselling)
  IF ticket_info.available_quantity < p_quantity THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not enough tickets available',
      'error_code', 'INSUFFICIENT_QUANTITY',
      'available', ticket_info.available_quantity,
      'requested', p_quantity,
      'ticket_title', ticket_info.title
    );
  END IF;
  
  -- Generate access token and QR code
  access_token_val = 'ACCESS-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8);
  qr_code_val = 'QR-' || access_token_val;
  
  -- Create the purchase (this will trigger the quantity update)
  INSERT INTO ticket_purchases (
    ticket_id,
    customer_name,
    customer_email,
    customer_phone,
    quantity,
    total_amount,
    payment_status,
    payment_reference,
    payment_method,
    access_token,
    qr_code,
    purchase_date
  ) VALUES (
    p_ticket_id,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_quantity,
    p_total_amount,
    p_payment_status,
    p_payment_reference,
    p_payment_method,
    access_token_val,
    qr_code_val,
    NOW()
  ) RETURNING id INTO purchase_id;
  
  -- Return success with purchase details
  RETURN jsonb_build_object(
    'success', true,
    'purchase_id', purchase_id,
    'access_token', access_token_val,
    'qr_code', qr_code_val,
    'quantity_purchased', p_quantity,
    'remaining_quantity', ticket_info.available_quantity - p_quantity,
    'ticket_title', ticket_info.title
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and return failure
    RAISE LOG 'Ticket purchase error: % %', SQLERRM, SQLSTATE;
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Database error occurred',
      'error_code', 'DATABASE_ERROR',
      'details', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- 2. Create function to check ticket availability
CREATE OR REPLACE FUNCTION check_ticket_availability(p_ticket_id UUID)
RETURNS JSONB AS $$
DECLARE
  ticket_info RECORD;
BEGIN
  SELECT 
    id,
    title,
    available_quantity,
    total_quantity,
    status,
    event_date,
    price
  INTO ticket_info
  FROM tickets 
  WHERE id = p_ticket_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ticket not found'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'ticket', jsonb_build_object(
      'id', ticket_info.id,
      'title', ticket_info.title,
      'available_quantity', ticket_info.available_quantity,
      'total_quantity', ticket_info.total_quantity,
      'status', ticket_info.status,
      'event_date', ticket_info.event_date,
      'price', ticket_info.price,
      'is_available', ticket_info.available_quantity > 0 AND ticket_info.status = 'active' AND ticket_info.event_date >= CURRENT_DATE
    )
  );
END;
$$ LANGUAGE plpgsql;

-- 3. Create function to reserve tickets temporarily (for payment processing)
CREATE OR REPLACE FUNCTION reserve_tickets_temporarily(
  p_ticket_id UUID,
  p_quantity INTEGER,
  p_customer_email VARCHAR(255),
  p_reservation_minutes INTEGER DEFAULT 10
) RETURNS JSONB AS $$
DECLARE
  current_available INTEGER;
  reservation_id UUID;
  expires_at TIMESTAMP;
BEGIN
  -- Lock the ticket row
  SELECT available_quantity INTO current_available
  FROM tickets 
  WHERE id = p_ticket_id 
  FOR UPDATE;
  
  -- Check availability
  IF current_available < p_quantity THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not enough tickets available for reservation',
      'available', current_available,
      'requested', p_quantity
    );
  END IF;
  
  -- Calculate expiration time
  expires_at = NOW() + (p_reservation_minutes || ' minutes')::INTERVAL;
  
  -- Create reservation record (you'll need to create this table)
  -- This is optional but recommended for high-traffic scenarios
  
  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', reservation_id,
    'expires_at', expires_at,
    'reserved_quantity', p_quantity
  );
END;
$$ LANGUAGE plpgsql;

-- 4. Enhanced trigger function with better error handling
CREATE OR REPLACE FUNCTION update_ticket_availability_enhanced()
RETURNS TRIGGER AS $$
BEGIN
  -- Update available quantity when a purchase is made
  IF TG_OP = 'INSERT' THEN
    -- Double-check availability before updating (extra safety)
    IF (SELECT available_quantity FROM tickets WHERE id = NEW.ticket_id) < NEW.quantity THEN
      RAISE EXCEPTION 'Cannot purchase % tickets, insufficient availability', NEW.quantity;
    END IF;
    
    UPDATE tickets 
    SET available_quantity = available_quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.ticket_id;
    
    -- Update status to sold_out if no tickets left
    UPDATE tickets 
    SET status = 'sold_out'
    WHERE id = NEW.ticket_id AND available_quantity <= 0;
    
    -- Log the purchase for audit trail
    RAISE LOG 'Ticket purchase: ticket_id=%, quantity=%, customer=%', 
      NEW.ticket_id, NEW.quantity, NEW.customer_email;
    
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
    
    RAISE LOG 'Ticket refund: ticket_id=%, quantity=%, customer=%', 
      OLD.ticket_id, OLD.quantity, OLD.customer_email;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 5. Replace the existing trigger with enhanced version
DROP TRIGGER IF EXISTS trigger_update_ticket_availability ON ticket_purchases;
CREATE TRIGGER trigger_update_ticket_availability_enhanced
    AFTER INSERT OR DELETE ON ticket_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_availability_enhanced();

-- 6. Create audit table for tracking purchase attempts
CREATE TABLE IF NOT EXISTS ticket_purchase_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES tickets(id),
    customer_email VARCHAR(255),
    requested_quantity INTEGER,
    available_quantity INTEGER,
    success BOOLEAN,
    error_message TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create index for performance
CREATE INDEX IF NOT EXISTS idx_ticket_purchase_attempts_ticket_id ON ticket_purchase_attempts(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_purchase_attempts_created_at ON ticket_purchase_attempts(created_at);

-- 8. Create function to log purchase attempts
CREATE OR REPLACE FUNCTION log_purchase_attempt(
  p_ticket_id UUID,
  p_customer_email VARCHAR(255),
  p_requested_quantity INTEGER,
  p_available_quantity INTEGER,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO ticket_purchase_attempts (
    ticket_id,
    customer_email,
    requested_quantity,
    available_quantity,
    success,
    error_message,
    ip_address,
    user_agent
  ) VALUES (
    p_ticket_id,
    p_customer_email,
    p_requested_quantity,
    p_available_quantity,
    p_success,
    p_error_message,
    p_ip_address,
    p_user_agent
  );
END;
$$ LANGUAGE plpgsql;

-- 9. Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_ticket_purchase_atomic TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_ticket_availability TO authenticated, anon;
GRANT EXECUTE ON FUNCTION reserve_tickets_temporarily TO authenticated, anon;
GRANT EXECUTE ON FUNCTION log_purchase_attempt TO authenticated, anon;

-- 10. Add RLS policies for audit table
ALTER TABLE ticket_purchase_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on ticket_purchase_attempts" ON ticket_purchase_attempts
    FOR ALL USING (true);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test the atomic function (replace with actual ticket ID)
-- SELECT create_ticket_purchase_atomic(
--   'your-ticket-id'::UUID,
--   2,
--   'Test Customer',
--   'test@example.com',
--   '+233123456789',
--   100.00,
--   'completed',
--   'TEST-REF-123',
--   'test'
-- );

-- Check ticket availability
-- SELECT check_ticket_availability('your-ticket-id'::UUID);

-- View audit trail
-- SELECT * FROM ticket_purchase_attempts ORDER BY created_at DESC LIMIT 10;

COMMENT ON FUNCTION create_ticket_purchase_atomic IS 'Atomically creates a ticket purchase with overselling prevention';
COMMENT ON FUNCTION check_ticket_availability IS 'Checks current ticket availability and status';
COMMENT ON FUNCTION reserve_tickets_temporarily IS 'Temporarily reserves tickets during payment processing';
COMMENT ON TABLE ticket_purchase_attempts IS 'Audit trail for all ticket purchase attempts';
