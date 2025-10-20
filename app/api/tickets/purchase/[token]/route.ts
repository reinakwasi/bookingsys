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

    // First, check if access_token column exists and has data
    const { data: allPurchases, error: debugError } = await supabase
      .from('ticket_purchases')
      .select('id, access_token, customer_name')
      .limit(5)

    console.log('Sample purchases for debugging:', { allPurchases, debugError })

    // Fetch the purchase by access token
    let { data: purchase, error: purchaseError } = await supabase
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
      // If not found by access_token, try to find by ID as fallback
      console.log('Trying fallback search by ID...')
      
      const { data: fallbackPurchase, error: fallbackError } = await supabase
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
        .eq('id', token)
        .single()

      if (fallbackError || !fallbackPurchase) {
        console.error('Purchase not found even with fallback:', { token, purchaseError, fallbackError })
        return NextResponse.json(
          { error: 'Purchase not found', token, details: { purchaseError, fallbackError } },
          { status: 404 }
        )
      }

      // Use fallback purchase
      purchase = fallbackPurchase
      console.log('Found purchase using fallback ID search')
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
