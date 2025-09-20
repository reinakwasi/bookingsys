# Vercel Environment Variables Setup

To fix the "View My Tickets" email links, you need to set up environment variables in your Vercel dashboard.

## Required Environment Variables

### Option 1: Set Your Custom Domain (Recommended)
If you have a custom domain:
```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Option 2: Use Your Vercel App URL
If you're using the default Vercel URL:
```
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-app-name.vercel.app
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

- ✅ "View My Tickets" button in emails will open your actual website
- ✅ Payment callback URLs will work correctly
- ✅ All email links will use your proper domain instead of localhost

## Automatic Fallback

If you don't set these variables, the system will automatically use:
1. `VERCEL_URL` (automatically provided by Vercel)
2. `localhost:3000` (for local development)

But setting the explicit URLs is recommended for better control and custom domains.
