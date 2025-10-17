# Newsletter Management Setup

## Database Setup Required

To enable the newsletter management system, you need to run the database migration in Supabase:

### Steps:

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Migration**
   - Copy the contents of `supabase/migrations/create-newsletter-subscribers.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

3. **Verify Setup**
   - The `newsletter_subscribers` table should now exist
   - RLS policies will be automatically configured
   - The admin can now manage newsletter subscribers

### What the Migration Creates:

- ✅ `newsletter_subscribers` table with proper structure
- ✅ Email uniqueness constraints
- ✅ Status tracking (active/unsubscribed)
- ✅ Timestamp tracking (subscribed_at, unsubscribed_at)
- ✅ RLS policies for security
- ✅ Indexes for performance

### Newsletter Features Available:

#### For Users:
- Subscribe via footer form
- Duplicate prevention
- Welcome email on subscription
- Professional email templates

#### For Admin:
- View all subscribers with statistics
- Send newsletters to active subscribers
- Manage subscriber list
- Track email delivery success/failure

### Admin Access:

1. Login to admin dashboard
2. Click "Newsletter" in the sidebar
3. View subscriber statistics
4. Send newsletters to all active subscribers
5. Manage individual subscribers

### Email Configuration:

Make sure these environment variables are set:
- `GMAIL_USER` - Your Gmail address
- `GMAIL_PASS` - Your Gmail app password
- `NEXT_PUBLIC_SITE_URL` - Your website URL

The newsletter system is now fully functional!
