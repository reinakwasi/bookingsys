# Environment Variables Setup for Hotel 734

## Required Environment Variables

To fix the "undefined" links in email and SMS confirmations, you need to set up the following environment variables:

### Base URL Configuration

Create a `.env.local` file in the root directory with:

```bash
# Base URL for the application (REQUIRED)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Alternative environment variables (fallbacks)
NEXT_PUBLIC_BASE_URL=https://your-domain.com
VERCEL_URL=your-vercel-deployment-url

# Email Configuration (for Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# SMS Configuration (optional - for Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Priority Order for Base URL

The system will use the first available environment variable in this order:

1. `NEXT_PUBLIC_APP_URL` (recommended)
2. `NEXT_PUBLIC_BASE_URL` (fallback)
3. `https://${VERCEL_URL}` (Vercel deployment)
4. `https://hotel734.com` (final fallback)

## Development Setup

For local development, set:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

For production deployment, set:
```bash
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

## Testing the Fix

After setting up the environment variables:

1. Restart your development server
2. Purchase a ticket
3. Check the email confirmation - the "View My Tickets" link should now work properly
4. Check the SMS confirmation - the ticket link should now work properly

## Troubleshooting

If you still see "undefined" in the links:

1. Verify the environment variable is set correctly
2. Restart the development server
3. Check the console logs for "🔗 Generating short link with domain:" messages
4. Ensure the variable name matches exactly (case-sensitive)
