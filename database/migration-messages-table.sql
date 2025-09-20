-- Create messages table for contact form submissions
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for sorting by newest
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
-- Index for unread filtering
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);
