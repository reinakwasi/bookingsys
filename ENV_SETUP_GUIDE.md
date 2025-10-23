# Environment Variables Setup Guide

## 🔧 Required Environment Variables

Add these to your `.env.local` file in the root of your project:

```env
# ============================================
# HUBTEL PAYMENT CONFIGURATION
# ============================================

# Hubtel API ID (username) - PUBLIC (accessible from client)
NEXT_PUBLIC_HUBTEL_API_ID=wpxJW1

# Hubtel API Key (password) - PRIVATE (server-side only)
HUBTEL_API_KEY=c7e83f5a4cd6451a90515f7e14a61ca8

# Hubtel Merchant Account / POS Sales ID - PUBLIC
NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=3740971

# ============================================
# SITE CONFIGURATION
# ============================================

# Your website URL (used for callbacks and return URLs)
# Development:
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Production (update when deploying):
# NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 📝 Important Notes

### Environment Variable Prefixes

**`NEXT_PUBLIC_` prefix**:
- Variables with this prefix are **accessible from both client and server**
- They are embedded in the browser JavaScript bundle
- Safe to use in client components
- Examples: `NEXT_PUBLIC_HUBTEL_API_ID`, `NEXT_PUBLIC_SITE_URL`

**No prefix**:
- Variables without prefix are **server-side only**
- Only accessible in API routes and server components
- Never exposed to the browser
- Examples: `HUBTEL_API_KEY`

### Security Best Practices

1. **Never expose API keys in client code**:
   - `HUBTEL_API_KEY` has no `NEXT_PUBLIC_` prefix
   - It's only used in server-side API routes
   - Never accessible from browser

2. **Public variables are safe**:
   - `NEXT_PUBLIC_HUBTEL_API_ID` is the username (safe to expose)
   - `NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT` is your POS ID (safe to expose)

3. **Keep `.env.local` private**:
   - Never commit `.env.local` to git
   - It's already in `.gitignore`
   - Share credentials securely with team members

## 🚀 Setup Steps

### 1. Create `.env.local` file

If it doesn't exist, create it in the root directory:

```bash
# Windows
type nul > .env.local

# Mac/Linux
touch .env.local
```

### 2. Add the variables

Copy the configuration above and paste into `.env.local`

### 3. Restart development server

After adding environment variables, restart your dev server:

```bash
# Stop the server (Ctrl+C)
# Then start again
npm run dev
```

## ✅ Verification

### Check if variables are loaded:

1. Open your browser console
2. Navigate to `/tickets` page
3. Look for these messages:

**Success**:
```
💳 Checking Hubtel configuration...
✅ Hubtel client configuration is properly set
```

**Error**:
```
💳 Checking Hubtel configuration...
❌ Hubtel configuration issues: ["NEXT_PUBLIC_HUBTEL_API_ID is not configured"]
⚠️ Note: API key validation happens server-side
```

### Server-side validation:

The full validation (including API key) happens when you try to make a payment. Check your terminal/server logs for:

```
💳 Payment initialization request received
✅ Hubtel payment initialized successfully
```

## 🔍 Troubleshooting

### Issue: "HUBTEL_API_KEY is not configured" in browser console

**This is normal!** The API key is server-side only and won't be accessible from the browser. The error you saw was because we were trying to validate it from client-side code.

**Solution**: We've fixed this by creating two validation methods:
- `validateClientConfiguration()` - For client-side (checks public vars only)
- `validateConfiguration()` - For server-side (checks all vars including API key)

### Issue: Variables not loading

1. **Check file name**: Must be `.env.local` (with the dot)
2. **Check location**: Must be in project root (same level as `package.json`)
3. **Restart server**: Environment variables are loaded on server start
4. **Check syntax**: No spaces around `=` sign

### Issue: Still getting configuration errors

1. Open `.env.local` and verify all three Hubtel variables are present
2. Make sure there are no extra spaces or quotes
3. Restart your development server
4. Clear browser cache and reload

## 📦 Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. **Add environment variables in your hosting platform**:
   - Go to your project settings
   - Find "Environment Variables" section
   - Add all the variables from `.env.local`

2. **Update `NEXT_PUBLIC_SITE_URL`**:
   ```env
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

3. **Configure Hubtel Dashboard**:
   - Update callback URL: `https://yourdomain.com/api/payments/hubtel/callback`
   - Update return URL: `https://yourdomain.com/tickets?payment=success`
   - Update cancellation URL: `https://yourdomain.com/tickets?payment=cancelled`

## 🔐 Your Credentials

**Hubtel API Credentials**:
- **API ID (username)**: `wpxJW1`
- **API Key (password)**: `c7e83f5a4cd6451a90515f7e14a61ca8`
- **Merchant Account**: `3740971`

**Keep these secure!** Don't share them publicly or commit them to version control.

## 📞 Need Help?

If you're still having issues:
1. Check the console for specific error messages
2. Check server logs for API route errors
3. Verify all environment variables are set correctly
4. Ensure development server was restarted after adding variables

---

**Last Updated**: October 23, 2025
