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
      
      // Normalize the search term (remove QR- prefix if present)
      const searchTerm = qr_code.startsWith('QR-') ? qr_code.substring(3) : qr_code;
      const ticketSearchTerm = qr_code.startsWith('TKT-') ? qr_code : `TKT-${searchTerm}`;
      const qrSearchTerm = qr_code.startsWith('QR-') ? qr_code : `QR-${searchTerm}`;
      
      console.log('Search terms:', { original: qr_code, ticket: ticketSearchTerm, qr: qrSearchTerm });
      
      // Try multiple search strategies
      let searchResults = [];
      
      // 1. Search by exact match (ticket_number)
      const exactTicketResult = await supabase
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
        .eq('ticket_number', qr_code);
      
      if (exactTicketResult.data && exactTicketResult.data.length > 0) {
        ticket = exactTicketResult.data[0];
        console.log('Found ticket by exact ticket_number match:', qr_code);
      } else {
        // 2. Search by formatted ticket number
        const formattedTicketResult = await supabase
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
          .eq('ticket_number', ticketSearchTerm);
        
        if (formattedTicketResult.data && formattedTicketResult.data.length > 0) {
          ticket = formattedTicketResult.data[0];
          console.log('Found ticket by formatted ticket_number:', ticketSearchTerm);
        } else {
          // 3. Search by QR code field
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
            .eq('qr_code', qr_code);
          
          if (qrResult.data && qrResult.data.length > 0) {
            ticket = qrResult.data[0];
            console.log('Found ticket by qr_code field:', qr_code);
          } else {
            // 4. Search by formatted QR code
            const formattedQrResult = await supabase
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
              .eq('qr_code', qrSearchTerm);
            
            if (formattedQrResult.data && formattedQrResult.data.length > 0) {
              ticket = formattedQrResult.data[0];
              console.log('Found ticket by formatted qr_code:', qrSearchTerm);
            } else {
              // 5. Partial match search for old format tickets
              const partialResult = await supabase
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
                .or(`ticket_number.ilike.%${searchTerm}%,qr_code.ilike.%${searchTerm}%`);
              
              if (partialResult.data && partialResult.data.length > 0) {
                ticket = partialResult.data[0];
                console.log('Found ticket by partial match:', searchTerm);
              }
            }
          }
        }
      }
      
      if (!ticket) {
        ticketError = { message: 'Ticket not found with any search method' };
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
      
      // Enhanced debugging - show more ticket info
      const debugResult = await supabase
        .from('individual_tickets')
        .select('ticket_number, qr_code, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      
      console.log('Available tickets (last 10):', debugResult.data)
      console.log('Search attempted for:', { qr_code, purchase_id })
      
      // Also check if there are tickets with similar patterns
      const similarResult = await supabase
        .from('individual_tickets')
        .select('ticket_number, qr_code')
        .or(`ticket_number.ilike.%${qr_code?.slice(-4) || ''}%,qr_code.ilike.%${qr_code?.slice(-4) || ''}%`)
        .limit(5)
      
      console.log('Similar tickets found:', similarResult.data)
      
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
