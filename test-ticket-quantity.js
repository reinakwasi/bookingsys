/**
 * Test Script: Ticket Quantity Countdown System
 * 
 * This script tests the ticket quantity management system to identify potential issues:
 * 1. Race conditions during simultaneous purchases
 * 2. Overselling prevention
 * 3. Database trigger functionality
 * 4. Real-time quantity updates
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration (you'll need to add your actual credentials)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data
const testTicketId = 'test-ticket-id'; // Replace with actual ticket ID
const testCustomer = {
  name: 'Test Customer',
  email: 'test@example.com',
  phone: '+233123456789'
};

/**
 * Test 1: Check current ticket availability
 */
async function checkTicketAvailability(ticketId) {
  console.log('\n🔍 TEST 1: Checking ticket availability...');
  
  try {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();
    
    if (error) {
      console.error('❌ Error fetching ticket:', error);
      return null;
    }
    
    console.log('📊 Ticket Details:');
    console.log(`   Title: ${ticket.title}`);
    console.log(`   Total Quantity: ${ticket.total_quantity}`);
    console.log(`   Available Quantity: ${ticket.available_quantity}`);
    console.log(`   Status: ${ticket.status}`);
    
    return ticket;
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
    return null;
  }
}

/**
 * Test 2: Simulate single purchase
 */
async function simulateSinglePurchase(ticketId, quantity = 1) {
  console.log(`\n🛒 TEST 2: Simulating purchase of ${quantity} ticket(s)...`);
  
  try {
    const purchaseData = {
      ticket_id: ticketId,
      customer_name: testCustomer.name,
      customer_email: testCustomer.email,
      customer_phone: testCustomer.phone,
      quantity: quantity,
      total_amount: 50.00 * quantity, // Assuming 50 GHC per ticket
      payment_status: 'completed',
      payment_reference: `TEST-${Date.now()}`,
      payment_method: 'test'
    };
    
    const { data: purchase, error } = await supabase
      .from('ticket_purchases')
      .insert(purchaseData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Purchase failed:', error);
      return null;
    }
    
    console.log('✅ Purchase successful:', purchase.id);
    
    // Check updated availability
    const updatedTicket = await checkTicketAvailability(ticketId);
    return { purchase, updatedTicket };
    
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
    return null;
  }
}

/**
 * Test 3: Simulate race condition (multiple simultaneous purchases)
 */
async function simulateRaceCondition(ticketId, numPurchases = 3, quantityEach = 2) {
  console.log(`\n⚡ TEST 3: Simulating race condition with ${numPurchases} simultaneous purchases of ${quantityEach} tickets each...`);
  
  try {
    const purchases = [];
    
    // Create multiple purchase promises to simulate simultaneous requests
    for (let i = 0; i < numPurchases; i++) {
      const purchaseData = {
        ticket_id: ticketId,
        customer_name: `${testCustomer.name} ${i + 1}`,
        customer_email: `test${i + 1}@example.com`,
        customer_phone: testCustomer.phone,
        quantity: quantityEach,
        total_amount: 50.00 * quantityEach,
        payment_status: 'completed',
        payment_reference: `RACE-TEST-${Date.now()}-${i}`,
        payment_method: 'test'
      };
      
      purchases.push(
        supabase
          .from('ticket_purchases')
          .insert(purchaseData)
          .select()
          .single()
      );
    }
    
    // Execute all purchases simultaneously
    const results = await Promise.allSettled(purchases);
    
    console.log('📊 Race condition results:');
    let successCount = 0;
    let failCount = 0;
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && !result.value.error) {
        console.log(`   ✅ Purchase ${index + 1}: SUCCESS (${result.value.data.id})`);
        successCount++;
      } else {
        console.log(`   ❌ Purchase ${index + 1}: FAILED (${result.reason?.message || result.value?.error?.message || 'Unknown error'})`);
        failCount++;
      }
    });
    
    console.log(`\n📈 Summary: ${successCount} successful, ${failCount} failed`);
    
    // Check final availability
    const finalTicket = await checkTicketAvailability(ticketId);
    
    return { successCount, failCount, finalTicket };
    
  } catch (error) {
    console.error('❌ Test 3 failed:', error);
    return null;
  }
}

/**
 * Test 4: Test overselling prevention
 */
async function testOversellingPrevention(ticketId) {
  console.log('\n🚫 TEST 4: Testing overselling prevention...');
  
  try {
    // First, get current availability
    const ticket = await checkTicketAvailability(ticketId);
    if (!ticket) return null;
    
    const availableQuantity = ticket.available_quantity;
    const oversellQuantity = availableQuantity + 5; // Try to buy more than available
    
    console.log(`   Attempting to purchase ${oversellQuantity} tickets when only ${availableQuantity} are available...`);
    
    const purchaseData = {
      ticket_id: ticketId,
      customer_name: 'Oversell Test Customer',
      customer_email: 'oversell@example.com',
      customer_phone: testCustomer.phone,
      quantity: oversellQuantity,
      total_amount: 50.00 * oversellQuantity,
      payment_status: 'completed',
      payment_reference: `OVERSELL-TEST-${Date.now()}`,
      payment_method: 'test'
    };
    
    const { data: purchase, error } = await supabase
      .from('ticket_purchases')
      .insert(purchaseData)
      .select()
      .single();
    
    if (error) {
      console.log('✅ Overselling prevented by database constraint:', error.message);
      return { prevented: true, error: error.message };
    } else {
      console.log('❌ WARNING: Overselling was NOT prevented! Purchase succeeded:', purchase.id);
      
      // Check if available_quantity went negative
      const updatedTicket = await checkTicketAvailability(ticketId);
      if (updatedTicket && updatedTicket.available_quantity < 0) {
        console.log('🚨 CRITICAL: Available quantity is now NEGATIVE:', updatedTicket.available_quantity);
      }
      
      return { prevented: false, purchase, updatedTicket };
    }
    
  } catch (error) {
    console.error('❌ Test 4 failed:', error);
    return null;
  }
}

/**
 * Test 5: Check database trigger functionality
 */
async function testDatabaseTriggers(ticketId) {
  console.log('\n⚙️ TEST 5: Testing database triggers...');
  
  try {
    // Get initial state
    const initialTicket = await checkTicketAvailability(ticketId);
    if (!initialTicket) return null;
    
    console.log(`   Initial available_quantity: ${initialTicket.available_quantity}`);
    console.log(`   Initial status: ${initialTicket.status}`);
    
    // Make a small purchase to test trigger
    const result = await simulateSinglePurchase(ticketId, 1);
    if (!result) return null;
    
    const { updatedTicket } = result;
    
    // Check if trigger updated the quantities correctly
    const expectedQuantity = initialTicket.available_quantity - 1;
    const actualQuantity = updatedTicket.available_quantity;
    
    console.log(`   Expected available_quantity after purchase: ${expectedQuantity}`);
    console.log(`   Actual available_quantity after purchase: ${actualQuantity}`);
    
    if (actualQuantity === expectedQuantity) {
      console.log('✅ Database trigger working correctly');
    } else {
      console.log('❌ Database trigger NOT working correctly');
    }
    
    // Check if status changed to sold_out when quantity reaches 0
    if (actualQuantity <= 0 && updatedTicket.status === 'sold_out') {
      console.log('✅ Status correctly changed to "sold_out"');
    } else if (actualQuantity <= 0 && updatedTicket.status !== 'sold_out') {
      console.log('❌ Status should be "sold_out" but is:', updatedTicket.status);
    }
    
    return { 
      triggerWorking: actualQuantity === expectedQuantity,
      statusCorrect: actualQuantity > 0 || updatedTicket.status === 'sold_out'
    };
    
  } catch (error) {
    console.error('❌ Test 5 failed:', error);
    return null;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🧪 TICKET QUANTITY COUNTDOWN SYSTEM TESTS');
  console.log('==========================================');
  
  // You need to replace this with an actual ticket ID from your database
  const ticketId = process.argv[2];
  
  if (!ticketId) {
    console.error('❌ Please provide a ticket ID as argument:');
    console.error('   node test-ticket-quantity.js <ticket-id>');
    process.exit(1);
  }
  
  console.log(`🎫 Testing ticket ID: ${ticketId}`);
  
  try {
    // Run all tests
    await checkTicketAvailability(ticketId);
    await simulateSinglePurchase(ticketId, 1);
    await simulateRaceCondition(ticketId, 3, 1);
    await testOversellingPrevention(ticketId);
    await testDatabaseTriggers(ticketId);
    
    console.log('\n✅ All tests completed!');
    console.log('\n📋 RECOMMENDATIONS:');
    console.log('1. Add server-side validation to prevent overselling');
    console.log('2. Implement atomic transactions for quantity checks');
    console.log('3. Add real-time quantity updates on the frontend');
    console.log('4. Consider implementing a reservation system for high-demand tickets');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  checkTicketAvailability,
  simulateSinglePurchase,
  simulateRaceCondition,
  testOversellingPrevention,
  testDatabaseTriggers
};
