# Hubtel IP Whitelisting Instructions

## Your Server's Public IP Address

To get your server's public outbound IP address (the one Hubtel needs to whitelist):

### Method 1: Use Our Debug Endpoint
1. Make sure your development server is running (`npm run dev`)
2. Visit: `http://localhost:3000/api/debug/ip`
3. Copy the IP address shown

### Method 2: Use Our Script
1. Open terminal in your project directory
2. Run: `node get-server-ip.js`
3. Copy the IP address shown

### Method 3: Manual Check
1. Visit: https://whatismyipaddress.com
2. Note down your public IP address
3. Or run in terminal: `curl https://api.ipify.org?format=json`

## Hubtel Support Request

Once you have your IP address, contact Hubtel support with this information:

### Email Template:
```
Subject: IP Whitelisting Request for Transaction Status Check API

Dear Hubtel Support,

Please whitelist the following IP address for Transaction Status Check API:

IP Address: [YOUR_IP_ADDRESS_HERE]

Details:
- API: Transaction Status Check API
- Purpose: Payment verification for Hotel 734 booking system
- Merchant Account: [YOUR_MERCHANT_ACCOUNT_NUMBER]

Thank you for your assistance.

Best regards,
Hotel 734 Development Team
```

## What Hubtel Needs:

1. **Your Public IP Address** - The outbound IP of your server
2. **API Type** - Transaction Status Check API
3. **Merchant Account** - Your Hubtel merchant account number
4. **Purpose** - Payment verification for your application

## After Whitelisting:

Once Hubtel confirms your IP is whitelisted:

1. **Test the verification**: Try making a test payment
2. **Check logs**: Look for successful verification messages
3. **Verify tickets**: Ensure tickets are created after payment
4. **Test notifications**: Confirm emails and SMS are sent

## Current Environment Variables:

Make sure these are set in your `.env.local`:
```env
NEXT_PUBLIC_HUBTEL_API_ID=your_api_id
HUBTEL_API_KEY=your_api_key
NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT=your_merchant_account
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Development vs Production:

### Development (localhost):
- Use your home/office public IP address
- Test with development environment

### Production (deployed server):
- Use your hosting provider's IP address
- May need to contact hosting provider for the IP
- Could be different from your development IP

## Common Issues:

### Dynamic IP Address:
- If your IP changes frequently, you may need a static IP
- Contact your ISP or hosting provider about static IP options

### Multiple IP Addresses:
- Some servers use multiple outbound IPs
- You may need to whitelist multiple IPs
- Check with your hosting provider

### Behind Load Balancer/CDN:
- If using Cloudflare, AWS, etc., the outbound IP may be different
- Check your hosting provider's documentation
- May need to whitelist multiple IP ranges

## Testing After Whitelisting:

1. **Run debug endpoint**: `http://localhost:3000/api/debug/verify?reference=TEST_123`
2. **Check for success**: Should see proper JSON response instead of HTML
3. **Test real payment**: Make a test ticket purchase
4. **Verify creation**: Ensure ticket is created and notifications sent

## Support Contacts:

- **Hubtel Support**: [Contact information from your Hubtel dashboard]
- **Your Hosting Provider**: [If you need server IP information]

Remember: The IP address that needs whitelisting is your **server's outbound IP**, not your personal computer's IP address.
