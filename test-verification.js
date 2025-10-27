/**
 * Test script to debug payment verification issues
 * Run this with: node test-verification.js
 */

async function testVerification() {
  const baseUrl = 'http://localhost:3000'; // Adjust if different
  const testReference = 'HTL734_TEST_123';

  console.log('🔧 Testing payment verification...');
  console.log('🔧 Base URL:', baseUrl);
  console.log('🔧 Test Reference:', testReference);

  try {
    // Test 1: Debug endpoint (GET)
    console.log('\n📋 Test 1: Debug endpoint (GET)');
    const debugResponse = await fetch(`${baseUrl}/api/debug/verify?reference=${testReference}`);
    console.log('Status:', debugResponse.status, debugResponse.statusText);
    
    const debugResult = await debugResponse.json();
    console.log('Debug Result:', JSON.stringify(debugResult, null, 2));

    // Test 2: Debug endpoint (POST)
    console.log('\n📋 Test 2: Debug endpoint (POST)');
    const debugPostResponse = await fetch(`${baseUrl}/api/debug/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference: testReference
      })
    });
    console.log('Status:', debugPostResponse.status, debugPostResponse.statusText);
    
    const debugPostResult = await debugPostResponse.json();
    console.log('Debug POST Result:', JSON.stringify(debugPostResult, null, 2));

    // Test 3: Real verification endpoint
    console.log('\n📋 Test 3: Real verification endpoint');
    const realResponse = await fetch(`${baseUrl}/api/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference: testReference
      })
    });
    console.log('Status:', realResponse.status, realResponse.statusText);
    
    let realResult;
    try {
      realResult = await realResponse.json();
      console.log('Real Result:', JSON.stringify(realResult, null, 2));
    } catch (jsonError) {
      console.error('❌ Failed to parse real response as JSON:', jsonError);
      const responseText = await realResponse.text();
      console.error('❌ Raw response:', responseText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testVerification().catch(console.error);
