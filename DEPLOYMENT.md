# Hotel 734 - Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Supabase account (for database)
- Paystack account (for payments)
- Gmail account (for email notifications)

### Step 1: Push to GitHub
1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit - Hotel 734 Booking System"
git branch -M main
git remote add origin https://github.com/yourusername/hotel-734.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Configure environment variables (see below)
6. Click "Deploy"

### Step 3: Environment Variables Setup

In your Vercel project dashboard, go to Settings → Environment Variables and add:

#### Required Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
SMTP_USER=info.hotel734@gmail.com
SMTP_PASS=your_gmail_app_password
FROM_EMAIL=info.hotel734@gmail.com
FROM_NAME=Hotel 734
BULKSMS_API_KEY=your_bulksms_api_key
BULKSMS_SENDER_ID=HOTEL 734
```

#### Optional Variables:
```
NEXT_PUBLIC_SITE_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

### Step 4: Database Setup (Supabase)
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migrations from the `/database` folder
3. Copy your project URL and anon key to Vercel environment variables

### Step 5: Payment Setup (Paystack)
1. Create a Paystack account at [paystack.com](https://paystack.com)
2. Get your test API keys from the dashboard
3. Add them to Vercel environment variables
4. For production, switch to live keys

### Step 6: Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this app password as `SMTP_PASS`

## 🔧 Features Included

### Customer Features:
- ✅ Room booking system with availability checking
- ✅ Event booking and management
- ✅ Ticket purchasing system
- ✅ Payment integration (Paystack)
- ✅ Email confirmations
- ✅ Mobile-responsive design
- ✅ Gallery and facilities showcase

### Admin Features:
- ✅ Comprehensive admin dashboard
- ✅ Booking management (rooms, events, tickets)
- ✅ Real-time statistics
- ✅ Status updates and tracking
- ✅ Event creation and management
- ✅ Secure authentication

### Technical Features:
- ✅ Next.js 15 with TypeScript
- ✅ Supabase database integration
- ✅ Real-time inventory management
- ✅ Email notifications (nodemailer)
- ✅ QR code generation
- ✅ PDF ticket downloads
- ✅ Modern UI with Tailwind CSS

## 🌐 Live Demo
Once deployed, your Hotel 734 booking system will be available at:
`https://your-project-name.vercel.app`

## 📱 Testing
- Test all booking flows
- Verify payment integration
- Check email notifications
- Test admin dashboard functionality
- Verify mobile responsiveness

## 🔒 Security Notes
- All sensitive data is stored in environment variables
- Database uses Row Level Security (RLS)
- Admin authentication with bcrypt encryption
- HTTPS enforced in production

## 📞 Support
For deployment issues or questions, check:
- Vercel deployment logs
- Supabase logs
- Browser console for client-side errors

---
**Hotel 734 Booking System** - Ready for production deployment! 🏨✨
