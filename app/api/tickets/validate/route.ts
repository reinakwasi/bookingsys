import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { qr_code, purchase_id, admin_user } = await request.json()
    
    console.log('=== TICKET VALIDATION REQUEST ===')
    console.log('QR Code:', qr_code)
    console.log('Purchase ID:', purchase_id)
    console.log('Admin User:', admin_user)

    if (!qr_code && !purchase_id) {
      console.log('ERROR: No QR code or Purchase ID provided')
      return NextResponse.json(
        { error: 'QR code or Purchase ID is required' },
        { status: 400 }
      )
    }

    let ticket, ticketError;

    if (qr_code) {
      console.log('Searching by QR code:', qr_code)
      
      // Try searching by ticket_number first (since QR code might be same as ticket number)
      const ticketNumberResult = await supabase
        .from('individual_tickets')
        .select(`
          *,
          ticket_purchases!inner (
            *,
            tickets (
              id,
              title,
              event_date,
              event_time,
              venue
            )
          )
        `)
        .eq('ticket_number', qr_code)
        .single()
      
      if (ticketNumberResult.data) {
        ticket = ticketNumberResult.data
        ticketError = ticketNumberResult.error
        console.log('Found ticket by ticket_number:', qr_code)
      } else {
        // If not found by ticket_number, try by qr_code
        const qrResult = await supabase
          .from('individual_tickets')
          .select(`
            *,
            ticket_purchases!inner (
              *,
              tickets (
                id,
                title,
                event_date,
                event_time,
                venue
              )
            )
          `)
          .eq('qr_code', qr_code)
          .single()
        
        ticket = qrResult.data
        ticketError = qrResult.error
        console.log('Searched by qr_code:', qr_code)
      }
    } else if (purchase_id) {
      // Find tickets by purchase ID
      const result = await supabase
        .from('individual_tickets')
        .select(`
          *,
          ticket_purchases!inner (
            *,
            tickets (
              id,
              title,
              event_date,
              event_time,
              venue
            )
          )
        `)
        .eq('purchase_id', purchase_id)
        .limit(1)
        .single()
      
      ticket = result.data
      ticketError = result.error
      console.log('Purchase ID search:', purchase_id)
    }

    console.log('Ticket found:', ticket)
    console.log('Error:', ticketError)

    if (ticketError || !ticket) {
      console.log('TICKET NOT FOUND - Error details:', ticketError)
      
      // Let's also check what tickets exist for debugging
      const debugResult = await supabase
        .from('individual_tickets')
        .select('ticket_number, qr_code, status')
        .limit(5)
      
      console.log('Available tickets (first 5):', debugResult.data)
      
      return NextResponse.json(
        { 
          error: 'Invalid QR code or ticket not found',
          debug: {
            searchedFor: qr_code || purchase_id,
            availableTickets: debugResult.data?.map(t => t.ticket_number) || []
          }
        },
        { status: 404 }
      )
    }

    // Check if ticket is already used
    if (ticket.status === 'used') {
      return NextResponse.json({
        success: false,
        message: 'Ticket already used',
        ticket: {
          ...ticket,
          event: ticket.ticket_purchases.tickets
        },
        used_at: ticket.used_at,
        used_by: ticket.used_by
      })
    }

    // Check if ticket is expired
    if (ticket.status === 'expired') {
      return NextResponse.json({
        success: false,
        message: 'Ticket has expired',
        ticket: {
          ...ticket,
          event: ticket.ticket_purchases.tickets
        }
      })
    }

    // Check if event date has passed (optional validation)
    const eventDate = new Date(ticket.ticket_purchases.tickets.event_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (eventDate < today) {
      return NextResponse.json({
        success: false,
        message: 'Event date has passed',
        ticket: {
          ...ticket,
          event: ticket.ticket_purchases.tickets
        }
      })
    }

    // Mark ticket as used
    const { error: updateError } = await supabase
      .from('individual_tickets')
      .update({
        status: 'used',
        used_at: new Date().toISOString(),
        used_by: admin_user || 'Admin'
      })
      .eq('id', ticket.id)

    if (updateError) {
      console.error('Error updating ticket status:', updateError)
      return NextResponse.json(
        { error: 'Failed to validate ticket' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket validated successfully',
      ticket: {
        ...ticket,
        event: ticket.ticket_purchases.tickets,
        status: 'used',
        used_at: new Date().toISOString(),
        used_by: admin_user || 'Admin'
      }
    })

  } catch (error) {
    console.error('Error validating ticket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const qr_code = searchParams.get('qr_code')

    if (!qr_code) {
      return NextResponse.json(
        { error: 'QR code is required' },
        { status: 400 }
      )
    }

    // Find the individual ticket by QR code (for preview/info only)
    const { data: ticket, error: ticketError } = await supabase
      .from('individual_tickets')
      .select(`
        *,
        ticket_purchases!inner (
          *,
          tickets (
            id,
            title,
            event_date,
            event_time,
            venue,
            image_url
          )
        )
      `)
      .eq('qr_code', qr_code)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Invalid QR code or ticket not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ticket: {
        ...ticket,
        event: ticket.ticket_purchases.tickets
      }
    })

  } catch (error) {
    console.error('Error fetching ticket info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
