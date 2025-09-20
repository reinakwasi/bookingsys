const { createClient } = require('@supabase/supabase-js')

// Load environment variables manually since dotenv might not be available
const fs = require('fs')
const path = require('path')

function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local')
    const envFile = fs.readFileSync(envPath, 'utf8')
    
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=')
      if (key && value) {
        process.env[key.trim()] = value.trim()
      }
    })
  } catch (error) {
    console.error('Could not load .env.local file:', error.message)
  }
}

loadEnvFile()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createTestTickets() {
  try {
    console.log('Creating test tickets...')

    // First, clean up any existing test data
    console.log('Cleaning up existing test data...')
    await supabase.from('individual_tickets').delete().like('ticket_number', 'TKT-1757889%')
    await supabase.from('ticket_purchases').delete().like('access_token', 'ACCESS-1757889%')
    await supabase.from('tickets').delete().eq('title', 'Pool Party Experience')

    // Insert a test ticket/event
    console.log('Creating test event...')
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        title: 'Pool Party Experience',
        description: 'Exclusive pool party with DJ and refreshments',
        activity_type: 'pool_party',
        event_date: '2024-12-25',
        event_time: '18:00:00',
        price: 150.00,
        total_quantity: 100,
        available_quantity: 95,
        venue: 'Hotel 734 Pool Deck',
        status: 'active'
      })
      .select()
      .single()

    if (ticketError) {
      console.error('Error creating ticket:', ticketError)
      return
    }

    console.log('Test event created:', ticket.id)

    // Create test purchase
    console.log('Creating test purchase...')
    const { data: purchase, error: purchaseError } = await supabase
      .from('ticket_purchases')
      .insert({
        ticket_id: ticket.id,
        quantity: 5,
        total_amount: 750.00,
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '+1234567890',
        payment_status: 'completed',
        access_token: 'ACCESS-1757889230'
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('Error creating purchase:', purchaseError)
      return
    }

    console.log('Test purchase created:', purchase.id)

    // Create individual test tickets
    console.log('Creating individual test tickets...')
    const individualTickets = []
    
    for (let i = 1; i <= 5; i++) {
      const ticketNumber = `TKT-175788923${i}-00${i}`
      
      const { data: individualTicket, error: individualError } = await supabase
        .from('individual_tickets')
        .insert({
          purchase_id: purchase.id,
          ticket_id: ticket.id,
          ticket_number: ticketNumber,
          qr_code: ticketNumber,
          holder_name: `Test User ${i}`,
          holder_email: `test${i}@example.com`,
          status: 'unused'
        })
        .select()
        .single()

      if (individualError) {
        console.error(`Error creating individual ticket ${i}:`, individualError)
      } else {
        individualTickets.push(individualTicket)
        console.log(`Created ticket: ${ticketNumber}`)
      }
    }

    console.log('\n=== TEST TICKETS CREATED SUCCESSFULLY ===')
    console.log('Available test ticket numbers:')
    individualTickets.forEach(ticket => {
      console.log(`- ${ticket.ticket_number}`)
    })
    console.log('\nYou can now test validation with these ticket numbers!')

  } catch (error) {
    console.error('Error creating test tickets:', error)
  }
}

createTestTickets()
