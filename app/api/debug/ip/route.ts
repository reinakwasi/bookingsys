import { NextRequest, NextResponse } from 'next/server'

/**
 * Debug endpoint to get server's public IP address
 * This is the IP that Hubtel needs to whitelist
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🌐 Getting server public IP address...');

    // Method 1: Using ipify.org
    let publicIP = null;
    let method = '';
    
    try {
      console.log('🔍 Trying ipify.org...');
      const ipifyResponse = await fetch('https://api.ipify.org?format=json', {
        method: 'GET',
        headers: {
          'User-Agent': 'Hotel734-Server/1.0'
        }
      });
      
      if (ipifyResponse.ok) {
        const ipifyData = await ipifyResponse.json();
        publicIP = ipifyData.ip;
        method = 'ipify.org';
        console.log('✅ Got IP from ipify.org:', publicIP);
      }
    } catch (error) {
      console.log('⚠️ ipify.org failed:', error);
    }

    // Method 2: Using httpbin.org as fallback
    if (!publicIP) {
      try {
        console.log('🔍 Trying httpbin.org...');
        const httpbinResponse = await fetch('https://httpbin.org/ip', {
          method: 'GET',
          headers: {
            'User-Agent': 'Hotel734-Server/1.0'
          }
        });
        
        if (httpbinResponse.ok) {
          const httpbinData = await httpbinResponse.json();
          publicIP = httpbinData.origin;
          method = 'httpbin.org';
          console.log('✅ Got IP from httpbin.org:', publicIP);
        }
      } catch (error) {
        console.log('⚠️ httpbin.org failed:', error);
      }
    }

    // Method 3: Using icanhazip.com as second fallback
    if (!publicIP) {
      try {
        console.log('🔍 Trying icanhazip.com...');
        const icanhazipResponse = await fetch('https://icanhazip.com', {
          method: 'GET',
          headers: {
            'User-Agent': 'Hotel734-Server/1.0'
          }
        });
        
        if (icanhazipResponse.ok) {
          const icanhazipText = await icanhazipResponse.text();
          publicIP = icanhazipText.trim();
          method = 'icanhazip.com';
          console.log('✅ Got IP from icanhazip.com:', publicIP);
        }
      } catch (error) {
        console.log('⚠️ icanhazip.com failed:', error);
      }
    }

    if (!publicIP) {
      return NextResponse.json({
        success: false,
        error: 'Could not determine public IP address',
        message: 'All IP detection services failed. Please check your internet connection.',
        troubleshooting: [
          'Check if your server can access external websites',
          'Verify firewall settings allow outbound HTTPS requests',
          'Try running: curl https://api.ipify.org?format=json',
          'Contact your hosting provider for your public IP address'
        ]
      }, { status: 500 });
    }

    // Additional server information
    const serverInfo = {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      host: request.headers.get('host'),
      forwardedFor: request.headers.get('x-forwarded-for'),
      realIP: request.headers.get('x-real-ip'),
      cloudflareIP: request.headers.get('cf-connecting-ip')
    };

    console.log('📋 Server info:', serverInfo);

    return NextResponse.json({
      success: true,
      publicIP: publicIP,
      detectionMethod: method,
      message: `Your server's public outbound IP address is: ${publicIP}`,
      hubtelInstructions: {
        step1: 'Contact Hubtel Support',
        step2: `Request IP whitelisting for: ${publicIP}`,
        step3: 'Specify: Transaction Status Check API',
        step4: `Provide your merchant account: ${process.env.NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT || 'YOUR_MERCHANT_ACCOUNT'}`,
        step5: 'Wait for confirmation from Hubtel'
      },
      serverInfo: serverInfo,
      note: 'This is the IP address that Hubtel needs to whitelist for payment verification to work.'
    });

  } catch (error) {
    console.error('❌ Error getting public IP:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to get public IP address',
      manualMethod: [
        'Visit https://whatismyipaddress.com from your server',
        'Or run: curl https://api.ipify.org?format=json',
        'Or contact your hosting provider'
      ]
    }, { status: 500 });
  }
}
