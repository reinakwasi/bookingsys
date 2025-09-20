# Gmail SMTP Setup for Hotel 734 Ticket System

## Quick Fix for Current Error

The error `Missing credentials for "PLAIN"` occurs because Gmail SMTP credentials are not configured. Follow these steps:

### 1. Set up Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account (required for app passwords)
2. Go to [Google Account Settings](https://myaccount.google.com/)
3. Navigate to **Security** → **2-Step Verification**
4. Scroll down to **App passwords**
5. Generate a new app password for "Mail"
6. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### 2. Configure Environment Variables

Add these variables to your `.env.local` file:

```env
# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-16-character-app-password

# Optional: App URL for ticket links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Example:**
```env
GMAIL_USER=hotel734@gmail.com
GMAIL_PASS=abcdefghijklmnop
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Restart Development Server

After updating `.env.local`:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Alternative: Use Different Email Provider

If you prefer not to use Gmail, update the transporter in `/app/api/send-ticket-email/route.ts`:

```javascript
const transporter = nodemailer.createTransporter({
  host: 'your-smtp-host.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})
```

## Security Notes

- **Never commit** `.env.local` to version control
- Use **App Passwords**, not your regular Gmail password
- App passwords are safer and can be revoked independently
- Consider using a dedicated email account for the application

## Testing Email Functionality

1. Purchase a ticket through the system
2. Check the server console for email sending logs
3. Verify the customer receives the ticket email
4. Test the ticket access link in the email

## Troubleshooting

**Common Issues:**
- `EAUTH` error → Check app password is correct
- `ENOTFOUND` error → Check internet connection
- `535 Authentication failed` → Regenerate app password

**Debug Steps:**
1. Verify environment variables are loaded: `console.log(process.env.GMAIL_USER)`
2. Check Gmail account has 2FA enabled
3. Ensure app password is 16 characters without spaces
4. Try generating a new app password

## Production Deployment

For production, consider:
- Using a professional email service (SendGrid, AWS SES, etc.)
- Setting up proper DNS records (SPF, DKIM, DMARC)
- Using environment variables through your hosting platform
- Monitoring email delivery rates and bounce handling
