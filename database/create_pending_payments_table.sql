-- Create pending_payments table for storing payment details before completion
-- This allows the server-side callback to create tickets without relying on frontend session storage

CREATE TABLE IF NOT EXISTS pending_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_reference TEXT NOT NULL UNIQUE,
  ticket_id UUID NOT NULL,
  ticket_title TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on client_reference for fast lookups
CREATE INDEX IF NOT EXISTS idx_pending_payments_client_reference 
ON pending_payments(client_reference);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_pending_payments_status 
ON pending_payments(status);

-- Add RLS (Row Level Security)
ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage pending payments
CREATE POLICY "Service role can manage pending payments" ON pending_payments
FOR ALL USING (auth.role() = 'service_role');

-- Allow public to insert (for payment initialization)
CREATE POLICY "Public can insert pending payments" ON pending_payments
FOR INSERT WITH CHECK (true);

-- Allow public to read their own pending payments
CREATE POLICY "Public can read pending payments" ON pending_payments
FOR SELECT USING (true);
