-- Create reviews table for customer feedback
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    booking_type TEXT NOT NULL,
    item_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded')),
    admin_response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE
);

-- Create admin_messages table for system messages
CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'general',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_messages_status ON admin_messages(status);
CREATE INDEX IF NOT EXISTS idx_admin_messages_type ON admin_messages(type);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews (allow public insert, admin read/update)
CREATE POLICY "Anyone can submit reviews" ON reviews
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Admins can update reviews" ON reviews
    FOR UPDATE USING (true);

-- Create policies for admin_messages (admin only)
CREATE POLICY "Admins can view all messages" ON admin_messages
    FOR SELECT USING (true);

CREATE POLICY "System can insert messages" ON admin_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update messages" ON admin_messages
    FOR UPDATE USING (true);
