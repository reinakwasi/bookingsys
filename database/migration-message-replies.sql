-- Create message_replies table to track admin replies
CREATE TABLE IF NOT EXISTS public.message_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    reply_content TEXT NOT NULL,
    sent_to_email TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_by TEXT DEFAULT 'admin',
    email_status TEXT DEFAULT 'sent' -- 'sent', 'delivered', 'failed'
);

-- Index for finding replies by message
CREATE INDEX IF NOT EXISTS idx_message_replies_message_id ON public.message_replies(message_id);

-- Add replied_at column to messages table to track if message has been replied to
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE;

-- Allow authenticated users to insert and select replies
CREATE POLICY "Authenticated can manage replies"
  ON public.message_replies
  FOR ALL
  USING (auth.role() = 'authenticated');

GRANT ALL ON public.message_replies TO authenticated;
