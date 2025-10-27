# ⚡ Hubtel Integration - Quick Start

## 🚀 Get Started in 3 Steps

### **Step 1: Get Your Hubtel Credentials** (5 min)

1. Login to https://hubtel.com/
2. Go to **Settings → API Keys** → Create New API Key
3. Go to **Settings → Business** → Find your POS Sales ID

### **Step 2: Add to .env.local** (1 min)

```env
NEXT_PUBLIC_HUBTEL_API_ID=your_api_id
HUBTEL_API_KEY=your_api_key
NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=your_pos_sales_id
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### **Step 3: Restart & Test** (1 min)

```bash
# Restart server
npm run dev

# Test at: http://localhost:3000/tickets
```

---

## ✅ That's It!

Your payment system is now using Hubtel!

**For detailed docs, see:**
- `HUBTEL_SETUP_GUIDE.md` - Complete setup instructions
- `HUBTEL_INTEGRATION_COMPLETE.md` - Full integration details

---

## 💡 Quick Tips

- **Test with small amounts** (GHS 0.10 - 1.00) first
- **Contact Hubtel support** to whitelist your IP for status checks
- **Check console logs** if something goes wrong
- **Email/SMS still work** - no changes needed there

---

## 🆘 Need Help?

**Common Issues:**
- "Hubtel not configured" → Check `.env.local` and restart server
- "403 Forbidden" → Contact Hubtel to whitelist your IP
- Payment works but no ticket → Check console logs

**Support:**
- Hubtel: support@hubtel.com
- Docs: https://developers.hubtel.com/

---

**Status**: 🟢 Ready to go!
