/**
 * Quick script to check your IP multiple times in succession
 * Run with: node quick-ip-check.js
 * This will check your IP 5 times with 30-second intervals
 */

const https = require('https');

async function getPublicIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
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

async function quickIPCheck() {
  console.log('🔍 Quick IP stability check...');
  console.log('📊 Checking your IP 5 times with 30-second intervals\n');

  const results = [];
  
  for (let i = 1; i <= 5; i++) {
    try {
      const ip = await getPublicIP();
      const timestamp = new Date().toLocaleTimeString();
      
      console.log(`Check ${i}/5 at ${timestamp}: ${ip}`);
      results.push({ check: i, ip, timestamp });
      
      if (i < 5) {
        console.log('⏰ Waiting 30 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    } catch (error) {
      console.error(`❌ Check ${i} failed:`, error.message);
    }
  }

  // Analyze results
  console.log('\n' + '='.repeat(50));
  console.log('📊 QUICK IP CHECK RESULTS');
  console.log('='.repeat(50));

  const uniqueIPs = [...new Set(results.map(r => r.ip))];
  
  if (uniqueIPs.length === 1) {
    console.log('✅ RESULT: IP appears stable in short term');
    console.log(`🌐 Consistent IP: ${uniqueIPs[0]}`);
    console.log('👍 Good sign, but run the longer test to be sure');
  } else {
    console.log('⚠️  RESULT: IP changed during quick test!');
    console.log(`🌐 IPs seen: ${uniqueIPs.join(', ')}`);
    console.log('❌ Your IP is definitely dynamic!');
  }

  console.log('\n📋 All checks:');
  results.forEach(result => {
    console.log(`   ${result.timestamp}: ${result.ip}`);
  });

  console.log('\n🔧 Recommendations:');
  if (uniqueIPs.length === 1) {
    console.log('1. Run the longer stability test: node check-ip-stability.js');
    console.log('2. If stable over 30 minutes, proceed with Hubtel whitelisting');
    console.log(`3. Give Hubtel this IP: ${uniqueIPs[0]}`);
  } else {
    console.log('1. Your IP is dynamic - contact your ISP about static IP');
    console.log('2. Consider using a VPS/cloud server with static IP');
    console.log('3. Ask Hubtel if they can whitelist multiple IPs');
  }
  
  console.log('='.repeat(50));
}

quickIPCheck().catch(console.error);
