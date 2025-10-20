import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateTicketNumber } from '@/lib/ticketUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: { shortHash: string } }
) {
  try {
    const { shortHash } = params;

    console.log('🎫 Ticket access request for hash:', shortHash);

    // Query ticket purchases by access_token (short hash)
    const { data: purchase, error } = await supabase
      .from('ticket_purchases')
      .select(`
        *,
        ticket:tickets(*)
      `)
      .eq('access_token', shortHash)
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Ticket not found'
      }, { status: 404 });
    }

    if (!purchase) {
      console.log('❌ No ticket found for hash:', shortHash);
      return NextResponse.json({
        success: false,
        error: 'Invalid ticket access link'
      }, { status: 404 });
    }

    // Format ticket data for the frontend
    const ticketData = {
      id: purchase.id,
      ticket_number: generateTicketNumber(purchase.id),
      event_name: purchase.ticket?.title || 'Event',
      event_date: purchase.ticket?.event_date || new Date().toISOString(),
      event_time: purchase.ticket?.event_time || '00:00',
      venue: purchase.ticket?.venue || 'Hotel 734',
      price: purchase.ticket?.price || 0,
      quantity: purchase.quantity,
      customer_name: purchase.customer_name,
      customer_email: purchase.customer_email,
      customer_phone: purchase.customer_phone,
      qr_code: purchase.qr_code || `QR-${purchase.access_token || purchase.id.slice(0, 8).toUpperCase()}`,
      status: purchase.payment_status === 'completed' ? 'active' : 'pending',
      created_at: purchase.created_at,
      image_url: purchase.ticket?.image_url
    };

    console.log('✅ Ticket found:', {
      id: ticketData.id,
      event: ticketData.event_name,
      customer: ticketData.customer_name
    });

    return NextResponse.json({
      success: true,
      ticket: ticketData
    });

  } catch (error: any) {
    console.error('❌ Ticket access API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load ticket information'
    }, { status: 500 });
  }
}
