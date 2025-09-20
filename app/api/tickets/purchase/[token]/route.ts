import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Debug logging
    console.log('Looking for purchase with access_token:', token)

    // Fetch the purchase by access token
    const { data: purchase, error: purchaseError } = await supabase
      .from('ticket_purchases')
      .select(`
        *,
        tickets (
          id,
          title,
          description,
          event_date,
          event_time,
          price,
          venue,
          image_url,
          activity_type
        )
      `)
      .eq('access_token', token)
      .single()

    console.log('Purchase query result:', { purchase, purchaseError })

    if (purchaseError || !purchase) {
      console.error('Purchase not found:', { token, purchaseError })
      return NextResponse.json(
        { error: 'Purchase not found', token, details: purchaseError },
        { status: 404 }
      )
    }

    // Fetch individual tickets for this purchase
    const { data: individualTickets, error: ticketsError } = await supabase
      .from('individual_tickets')
      .select('*')
      .eq('purchase_id', purchase.id)
      .order('created_at', { ascending: true })

    if (ticketsError) {
      console.error('Error fetching individual tickets:', ticketsError)
      return NextResponse.json(
        { error: 'Failed to fetch tickets' },
        { status: 500 }
      )
    }

    // Combine the data and map title to name for frontend compatibility
    const response = {
      ...purchase,
      ticket: {
        ...purchase.tickets,
        name: purchase.tickets.title // Map title to name for frontend compatibility
      },
      individual_tickets: individualTickets || []
    }

    // Remove the nested tickets object to avoid duplication
    delete response.tickets

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching purchase:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
