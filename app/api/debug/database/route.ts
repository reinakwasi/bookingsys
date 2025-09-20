import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check ticket_purchases table
    const { data: purchases, error: purchaseError } = await supabase
      .from('ticket_purchases')
      .select('*')
      .limit(5)

    // Check individual_tickets table
    const { data: individualTickets, error: individualError } = await supabase
      .from('individual_tickets')
      .select('*')
      .limit(5)

    // Check tickets table
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .limit(5)

    // Check for the specific access token
    const { data: specificPurchase, error: specificError } = await supabase
      .from('ticket_purchases')
      .select('*')
      .eq('access_token', 'ACCESS-1757863218-dcbf57b3')
      .single()

    return NextResponse.json({
      ticket_purchases: {
        data: purchases,
        error: purchaseError,
        count: purchases?.length || 0
      },
      individual_tickets: {
        data: individualTickets,
        error: individualError,
        count: individualTickets?.length || 0
      },
      tickets: {
        data: tickets,
        error: ticketsError,
        count: tickets?.length || 0
      },
      specific_purchase: {
        data: specificPurchase,
        error: specificError,
        found: !!specificPurchase
      }
    })
  } catch (error) {
    console.error('Database debug error:', error)
    return NextResponse.json(
      { error: 'Database debug failed', details: error },
      { status: 500 }
    )
  }
}
