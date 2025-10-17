-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON public.newsletter_subscribers(status);

-- Enable RLS (Row Level Security)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for subscription)
CREATE POLICY "Allow public newsletter subscription" ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);

-- Create policy to allow admin to view all subscribers
CREATE POLICY "Allow admin to view newsletter subscribers" ON public.newsletter_subscribers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE username = current_user
        )
    );

-- Create policy to allow admin to update subscribers (for unsubscribe management)
CREATE POLICY "Allow admin to update newsletter subscribers" ON public.newsletter_subscribers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE username = current_user
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_newsletter_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_newsletter_subscribers_updated_at
    BEFORE UPDATE ON public.newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_newsletter_subscribers_updated_at();

-- Insert comment for documentation
COMMENT ON TABLE public.newsletter_subscribers IS 'Stores email addresses for newsletter subscriptions';
COMMENT ON COLUMN public.newsletter_subscribers.email IS 'Subscriber email address (unique)';
COMMENT ON COLUMN public.newsletter_subscribers.status IS 'Subscription status: active or unsubscribed';
COMMENT ON COLUMN public.newsletter_subscribers.subscribed_at IS 'When the user subscribed';
COMMENT ON COLUMN public.newsletter_subscribers.unsubscribed_at IS 'When the user unsubscribed (if applicable)';
