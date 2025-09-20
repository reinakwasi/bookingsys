# Supabase Setup Guide for Hotel 734

## Step 1: Configure Your Supabase Project

1. **Get your Supabase credentials** from your project dashboard:
   - Go to Settings → API
   - Copy your Project URL and anon/public key

2. **Create environment file**:
   ```bash
   # Copy the example file
   cp env.example .env.local
   ```

3. **Add your credentials to `.env.local`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 2: Set Up Database Schema

1. **Open Supabase SQL Editor** in your project dashboard
2. **Copy and paste** the entire contents of `database/schema.sql`
3. **Run the SQL** to create all tables, policies, and sample data

## Step 3: Configure Authentication (Optional)

If you want user authentication:

1. **Go to Authentication → Settings** in Supabase
2. **Enable Email authentication**
3. **Configure your site URL**: `http://localhost:3000` (for development)

## Step 4: Test the Connection

Run your Next.js app and check:
- Events should load from the database
- Booking forms should save to the database
- Admin panel should manage real events

## Database Tables Created

### `events`
- Stores all hotel events (weddings, conferences, etc.)
- Includes pricing, capacity, and scheduling

### `bookings`
- Stores event reservations
- Links to events and user information
- Tracks booking status and special requests

### `tickets`
- Stores ticket purchases
- Generates unique QR codes
- Tracks ticket status and usage

### `users`
- Extends Supabase auth with custom fields
- Supports guest and admin roles
- Stores contact information

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Users can only access their own data**
- **Admins have full access to manage events and bookings**
- **Public can view events but not modify them**

## Sample Data Included

The schema includes sample events:
- Wedding Reception ($2,500, 150 capacity)
- Corporate Conference ($1,200, 100 capacity)
- Birthday Party ($800, 50 capacity)
- Anniversary Dinner ($1,500, 75 capacity)

## Next Steps

After setup, the app will:
1. ✅ Load real events from database
2. ✅ Save bookings to database
3. ✅ Generate unique QR codes for tickets
4. ✅ Support admin event management
5. ✅ Handle user authentication (if enabled)

## Troubleshooting

**Connection Issues:**
- Verify your environment variables are correct
- Check your Supabase project is active
- Ensure RLS policies are properly configured

**Permission Errors:**
- Check your anon key has proper permissions
- Verify RLS policies match your use case
- Test with service role key for debugging
