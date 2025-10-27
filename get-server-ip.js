/**
 * Script to get server's public IP address for Hubtel whitelisting
 * Run with: node get-server-ip.js
 */

const https = require('https');

async function getPublicIP() {
  console.log('🌐 Getting your server\'s public IP address...');
  console.log('📝 This is the IP that Hubtel needs to whitelist\n');

  // Method 1: ipify.org
  try {
    console.log('🔍 Checking ipify.org...');
    const ip = await fetchIP('https://api.ipify.org?format=json');
    if (ip) {
      console.log('✅ Success! Your public IP address is:', ip);
      printHubtelInstructions(ip);
      return;
    }
  } catch (error) {
    console.log('⚠️ ipify.org failed:', error.message);
  }

  // Method 2: httpbin.org
  try {
    console.log('🔍 Checking httpbin.org...');
    const response = await fetchJSON('https://httpbin.org/ip');
    if (response && response.origin) {
      const ip = response.origin;
      console.log('✅ Success! Your public IP address is:', ip);
      printHubtelInstructions(ip);
      return;
    }
  } catch (error) {
    console.log('⚠️ httpbin.org failed:', error.message);
  }

  // Method 3: icanhazip.com
  try {
    console.log('🔍 Checking icanhazip.com...');
    const ip = await fetchText('https://icanhazip.com');
    if (ip) {
      const cleanIP = ip.trim();
      console.log('✅ Success! Your public IP address is:', cleanIP);
      printHubtelInstructions(cleanIP);
      return;
    }
  } catch (error) {
    console.log('⚠️ icanhazip.com failed:', error.message);
  }

  // All methods failed
  console.log('❌ Could not determine your public IP address');
  console.log('\n📋 Manual methods to get your IP:');
  console.log('1. Visit https://whatismyipaddress.com in your browser');
  console.log('2. Run: curl https://api.ipify.org?format=json');
  console.log('3. Contact your hosting provider');
  console.log('4. Check your router/firewall configuration');
}

function fetchIP(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.ip);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function printHubtelInstructions(ip) {
  console.log('\n' + '='.repeat(60));
  console.log('📧 HUBTEL SUPPORT REQUEST');
  console.log('='.repeat(60));
  console.log('Subject: IP Whitelisting Request for Transaction Status Check API');
  console.log('');
  console.log('Dear Hubtel Support,');
  console.log('');
  console.log('Please whitelist the following IP address for Transaction Status Check API:');
  console.log('');
  console.log(`🌐 IP Address: ${ip}`);
  console.log('');
  console.log('Details:');
  console.log('- API: Transaction Status Check API');
  console.log('- Purpose: Payment verification for Hotel 734 booking system');
  console.log('- Merchant Account: [YOUR_MERCHANT_ACCOUNT_NUMBER]');
  console.log('');
  console.log('Thank you for your assistance.');
  console.log('');
  console.log('Best regards,');
  console.log('Hotel 734 Development Team');
  console.log('='.repeat(60));
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Copy the IP address above');
  console.log('2. Contact Hubtel support with this information');
  console.log('3. Wait for confirmation');
  console.log('4. Test payment verification after whitelisting');
}

// Run the script
getPublicIP().catch(console.error);
