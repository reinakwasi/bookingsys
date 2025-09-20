# Vercel Environment Variables Setup

To fix the "View My Tickets" email links and admin login issues, you need to set up environment variables in your Vercel dashboard.

## Required Environment Variables

### 1. Website URLs
#### Option A: Set Your Custom Domain (Recommended)
If you have a custom domain:
```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

#### Option B: Use Your Vercel App URL
If you're using the default Vercel URL:
```
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-app-name.vercel.app
```

### 2. Supabase Database (CRITICAL for Admin Login)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Email Configuration (for notifications)
```
GMAIL_USER=your_gmail_address
GMAIL_PASS=your_gmail_app_password
```

### 4. Payment Configuration (for Paystack)
```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project (hotel-734-booking-system)
3. Go to Settings → Environment Variables
4. Add each variable:
   - **Key**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://your-actual-domain.com` (or your Vercel URL)
   - **Environment**: Production, Preview, Development (select all)

5. Repeat for the other variables
6. Redeploy your application

## What This Fixes

- ✅ **Admin Login**: Will work properly on Vercel (requires Supabase variables)
- ✅ **"View My Tickets"** button in emails will open your actual website
- ✅ **Payment callbacks** will work correctly
- ✅ **All email links** will use your proper domain instead of localhost
- ✅ **Database connections** will work properly

## Critical Issues Without These Variables

❌ **Admin login will fail** - Shows "Database not configured" error
❌ **Email links point to localhost** - Users can't access their tickets
❌ **Payment callbacks fail** - Payments may not complete properly
❌ **Database errors** - App may not function correctly

## Automatic Fallback

If you don't set the URL variables, the system will automatically use:
1. `VERCEL_URL` (automatically provided by Vercel)
2. `localhost:3000` (for local development)

But setting the explicit URLs is recommended for better control and custom domains.

## Admin Login Troubleshooting

If admin login still doesn't work after setting environment variables:
1. Check the browser console for error messages
2. Verify your Supabase project is active
3. Ensure the `verify_admin_login` function exists in your Supabase database
4. Check that the admin user exists in the `admin_users` table
