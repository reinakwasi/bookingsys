-- Fix Contact Form Permissions
-- This script ensures the contact form can submit messages properly

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    replied_at TIMESTAMPTZ
);

-- Add status column if it doesn't exist (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'messages' 
                   AND column_name = 'status') THEN
        ALTER TABLE public.messages ADD COLUMN status TEXT DEFAULT 'unread';
    END IF;
END $$;

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Anyone can create messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can read messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can update messages" ON public.messages;

-- Allow anyone to insert messages (contact form submissions)
CREATE POLICY "Public can create messages" ON public.messages
  FOR INSERT 
  WITH CHECK (true);

-- Allow admins to read all messages
CREATE POLICY "Admins can read messages" ON public.messages
  FOR SELECT 
  USING (true); -- Simplified for now, can be restricted later

-- Allow admins to update messages (mark as read, etc.)
CREATE POLICY "Admins can update messages" ON public.messages
  FOR UPDATE 
  USING (true); -- Simplified for now, can be restricted later

-- Allow admins to delete messages
CREATE POLICY "Admins can delete messages" ON public.messages
  FOR DELETE 
  USING (true); -- Simplified for now, can be restricted later

-- Create message_replies table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.message_replies (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT REFERENCES public.messages(id) ON DELETE CASCADE,
    reply_content TEXT NOT NULL,
    sent_to_email TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on message_replies table
ALTER TABLE public.message_replies ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage replies
CREATE POLICY "Admins can manage replies" ON public.message_replies
  FOR ALL 
  USING (true);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_replies TO authenticated;

-- Grant permissions to anonymous users for contact form
GRANT INSERT ON public.messages TO anon;

-- Grant usage on sequences (if they exist)
DO $$
BEGIN
    -- Grant permissions on messages sequence if it exists
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'messages_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE public.messages_id_seq TO authenticated, anon;
    END IF;
    
    -- Grant permissions on message_replies sequence if it exists  
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'message_replies_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE public.message_replies_id_seq TO authenticated;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_replies_message_id ON public.message_replies(message_id);

COMMENT ON TABLE public.messages IS 'Contact form messages from website visitors';
COMMENT ON TABLE public.message_replies IS 'Admin replies to contact messages';
