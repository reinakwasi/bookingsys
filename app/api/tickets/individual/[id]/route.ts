import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params

    // Fetch the individual ticket by ID
    const { data: ticket, error: ticketError } = await supabase
      .from('individual_tickets')
      .select(`
        *,
        ticket_purchases!inner (
          *,
          tickets (
            id,
            name,
            description,
            event_date,
            event_time,
            venue,
            image_url
          )
        )
      `)
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error fetching individual ticket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
