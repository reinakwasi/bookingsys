# Paystack Quick Start Guide 🚀

Get your Hotel 734 payment system running with Paystack in 5 minutes!

## Step 1: Get Paystack Keys (2 minutes)

1. Go to https://paystack.com/ and sign up/login
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Copy your keys:
   - **Public Key**: `pk_test_xxxxxxxxxxxx`
   - **Secret Key**: `sk_test_xxxxxxxxxxxx`

## Step 2: Configure Environment (1 minute)

Create or update `.env.local` in your project root:

```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important**: Replace `your_actual_public_key_here` and `your_actual_secret_key_here` with your real keys!

## Step 3: Install Dependencies (1 minute)

```bash
npm install
```

## Step 4: Start Server (30 seconds)

```bash
npm run dev
```

## Step 5: Test Payment (30 seconds)

1. Open http://localhost:3000/tickets
2. Click "Purchase Ticket" on any event
3. Fill in details:
   - Name: Test User
   - Email: test@example.com
   - Phone: 0241234567
4. Click "Pay Now"
5. Use test card:
   ```
   Card: 4084084084084081
   CVV: 408
   Expiry: 12/25
   PIN: 0000
   OTP: 123456
   ```
6. Complete payment ✅

## That's It! 🎉

Your payment system is now running with Paystack!

## Next Steps

- **Read full setup**: Check `PAYSTACK_SETUP.md`
- **Migration details**: See `HUBTEL_TO_PAYSTACK_MIGRATION.md`
- **Production**: Switch to live keys when ready

## Troubleshooting

### "Paystack not configured" error?
- Check `.env.local` file exists
- Verify keys are correct (no extra spaces)
- Restart server: `npm run dev`

### Popup doesn't open?
- Check browser console for errors
- Verify public key starts with `pk_test_`
- Clear browser cache

### Payment verification fails?
- Check server logs
- Verify secret key starts with `sk_test_`
- Ensure both keys are from same Paystack account

## Support

- **Paystack Docs**: https://paystack.com/docs
- **Test Cards**: See `PAYSTACK_SETUP.md`
- **Full Guide**: Read `PAYSTACK_SETUP.md`

---

**Ready to go live?** Switch to live keys (`pk_live_` and `sk_live_`) in production!
