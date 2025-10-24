-- Create payment_callbacks table for storing Hubtel callback confirmations
-- This provides alternative payment verification when IP whitelisting prevents API verification

CREATE TABLE IF NOT EXISTS payment_callbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_reference TEXT NOT NULL,
  checkout_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL,
  payment_type TEXT,
  channel TEXT,
  response_code TEXT NOT NULL,
  raw_callback_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on client_reference for fast lookups
CREATE INDEX IF NOT EXISTS idx_payment_callbacks_client_reference 
ON payment_callbacks(client_reference);

-- Create index on status for filtering successful payments
CREATE INDEX IF NOT EXISTS idx_payment_callbacks_status 
ON payment_callbacks(status);

-- Create composite index for verification queries
CREATE INDEX IF NOT EXISTS idx_payment_callbacks_verification 
ON payment_callbacks(client_reference, status);

-- Add RLS (Row Level Security) if needed
ALTER TABLE payment_callbacks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to manage all records
CREATE POLICY "Service role can manage payment callbacks" ON payment_callbacks
FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow authenticated users to read their own callbacks (optional)
CREATE POLICY "Users can read payment callbacks" ON payment_callbacks
FOR SELECT USING (true); -- Adjust this based on your security requirements

COMMENT ON TABLE payment_callbacks IS 'Stores Hubtel payment callback confirmations for alternative verification when IP whitelisting prevents direct API verification';
COMMENT ON COLUMN payment_callbacks.client_reference IS 'Unique payment reference from Hubtel';
COMMENT ON COLUMN payment_callbacks.checkout_id IS 'Hubtel checkout session ID';
COMMENT ON COLUMN payment_callbacks.amount IS 'Payment amount in GHS';
COMMENT ON COLUMN payment_callbacks.status IS 'Payment status from Hubtel callback';
COMMENT ON COLUMN payment_callbacks.raw_callback_data IS 'Complete callback payload from Hubtel for debugging';
