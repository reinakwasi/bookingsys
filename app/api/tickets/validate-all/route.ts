import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { purchase_id, admin_user } = await request.json()

    if (!purchase_id) {
      return NextResponse.json(
        { error: 'Purchase ID is required' },
        { status: 400 }
      )
    }

    // Find all individual tickets for this purchase
    const { data: tickets, error: ticketsError } = await supabase
      .from('individual_tickets')
      .select(`
        *,
        ticket_purchases!inner (
          *,
          tickets (
            id,
            name,
            event_date,
            event_time,
            venue
          )
        )
      `)
      .eq('purchase_id', purchase_id)
      .order('created_at', { ascending: true })

    if (ticketsError || !tickets || tickets.length === 0) {
      return NextResponse.json(
        { error: 'No tickets found for this purchase ID' },
        { status: 404 }
      )
    }

    const results = []
    let validatedCount = 0
    let alreadyUsedCount = 0

    // Process each ticket
    for (const ticket of tickets) {
      if (ticket.status === 'used') {
        alreadyUsedCount++
        results.push({
          ticket_id: ticket.id,
          ticket_number: ticket.ticket_number,
          status: 'already_used',
          used_at: ticket.used_at,
          used_by: ticket.used_by
        })
      } else if (ticket.status === 'unused') {
        // Mark ticket as used
        const { error: updateError } = await supabase
          .from('individual_tickets')
          .update({
            status: 'used',
            used_at: new Date().toISOString(),
            used_by: admin_user || 'Admin'
          })
          .eq('id', ticket.id)

        if (!updateError) {
          validatedCount++
          results.push({
            ticket_id: ticket.id,
            ticket_number: ticket.ticket_number,
            status: 'validated',
            used_at: new Date().toISOString(),
            used_by: admin_user || 'Admin'
          })
        }
      } else {
        results.push({
          ticket_id: ticket.id,
          ticket_number: ticket.ticket_number,
          status: ticket.status
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Validated ${validatedCount} tickets. ${alreadyUsedCount} were already used.`,
      purchase: tickets[0].ticket_purchases,
      event: tickets[0].ticket_purchases.tickets,
      total_tickets: tickets.length,
      validated_count: validatedCount,
      already_used_count: alreadyUsedCount,
      results
    })

  } catch (error) {
    console.error('Error validating tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
