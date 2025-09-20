import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check if individual_tickets table exists and has data
    const { data: individualTickets, error: individualError } = await supabase
      .from('individual_tickets')
      .select('*')
      .limit(10)

    // Check if ticket_purchases table exists and has data
    const { data: purchases, error: purchaseError } = await supabase
      .from('ticket_purchases')
      .select('*')
      .limit(10)

    // Check if tickets table exists and has data
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .limit(10)

    return NextResponse.json({
      individual_tickets: {
        data: individualTickets,
        error: individualError,
        count: individualTickets?.length || 0
      },
      ticket_purchases: {
        data: purchases,
        error: purchaseError,
        count: purchases?.length || 0
      },
      tickets: {
        data: tickets,
        error: ticketsError,
        count: tickets?.length || 0
      }
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Debug failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
