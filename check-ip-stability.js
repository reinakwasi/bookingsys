/**
 * Script to monitor IP address stability over time
 * Run with: node check-ip-stability.js
 * This will check your IP every 5 minutes for 30 minutes to see if it changes
 */

const https = require('https');
const fs = require('fs');

let checkCount = 0;
const maxChecks = 6; // Check 6 times over 30 minutes
const interval = 5 * 60 * 1000; // 5 minutes in milliseconds
const ipHistory = [];

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

async function checkIPStability() {
  try {
    const currentIP = await getPublicIP();
    const timestamp = new Date().toISOString();
    checkCount++;

    console.log(`\n📊 Check ${checkCount}/${maxChecks} at ${timestamp}`);
    console.log(`🌐 Current IP: ${currentIP}`);

    // Add to history
    ipHistory.push({
      check: checkCount,
      timestamp: timestamp,
      ip: currentIP
    });

    // Check if IP has changed
    if (ipHistory.length > 1) {
      const previousIP = ipHistory[ipHistory.length - 2].ip;
      if (currentIP !== previousIP) {
        console.log(`⚠️  IP CHANGED! Previous: ${previousIP}, Current: ${currentIP}`);
        console.log(`🚨 WARNING: Your IP is DYNAMIC and changes over time!`);
      } else {
        console.log(`✅ IP unchanged since last check`);
      }
    }

    // Show all unique IPs seen so far
    const uniqueIPs = [...new Set(ipHistory.map(h => h.ip))];
    console.log(`📋 Unique IPs seen: ${uniqueIPs.join(', ')}`);

    // Save history to file
    fs.writeFileSync('ip-history.json', JSON.stringify(ipHistory, null, 2));

    if (checkCount >= maxChecks) {
      console.log('\n' + '='.repeat(60));
      console.log('📊 IP STABILITY REPORT');
      console.log('='.repeat(60));
      
      if (uniqueIPs.length === 1) {
        console.log('✅ RESULT: Your IP appears to be STATIC');
        console.log(`🌐 Consistent IP: ${uniqueIPs[0]}`);
        console.log('👍 This is good for Hubtel whitelisting!');
        console.log('\n📧 You can safely give Hubtel this IP address:');
        console.log(`   ${uniqueIPs[0]}`);
      } else {
        console.log('⚠️  RESULT: Your IP is DYNAMIC (changes over time)');
        console.log(`🌐 IPs seen: ${uniqueIPs.join(', ')}`);
        console.log('❌ This could cause issues with Hubtel whitelisting!');
        console.log('\n🔧 Solutions:');
        console.log('1. Contact your ISP about getting a static IP');
        console.log('2. Use a VPS/cloud server with static IP');
        console.log('3. Ask Hubtel to whitelist multiple IPs');
        console.log('4. Consider using a proxy service with static IP');
      }

      console.log('\n📋 Full History:');
      ipHistory.forEach((entry, index) => {
        const changed = index > 0 && entry.ip !== ipHistory[index - 1].ip ? ' (CHANGED)' : '';
        console.log(`   ${entry.timestamp}: ${entry.ip}${changed}`);
      });

      console.log('\n📁 Detailed history saved to: ip-history.json');
      console.log('='.repeat(60));
      return;
    }

    // Schedule next check
    console.log(`⏰ Next check in 5 minutes...`);
    setTimeout(checkIPStability, interval);

  } catch (error) {
    console.error('❌ Error checking IP:', error);
    if (checkCount < maxChecks) {
      console.log('🔄 Retrying in 1 minute...');
      setTimeout(checkIPStability, 60000); // Retry in 1 minute
    }
  }
}

console.log('🔍 Starting IP stability check...');
console.log('📊 Will check your IP every 5 minutes for 30 minutes');
console.log('🎯 This will help determine if your IP is static or dynamic');
console.log('⏰ Please keep this running for the full 30 minutes...\n');

// Start the monitoring
checkIPStability();
