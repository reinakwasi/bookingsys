import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Get query parameters to check if we should include inactive tickets
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';

    let query = supabase
      .from('tickets')
      .select('*');

    // By default, exclude inactive tickets (for admin dashboard)
    // Only include inactive if explicitly requested
    if (!includeInactive) {
      query = query.neq('status', 'inactive');
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Tickets fetch error:', error);
      return NextResponse.json({
        error: 'Failed to fetch tickets',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json(data || []);

  } catch (error: any) {
    console.error('❌ Tickets API error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch tickets',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ticketData = await request.json();
    console.log('🎫 Creating new ticket:', ticketData);

    // Ensure available_quantity is set to total_quantity for new tickets
    const ticketWithAvailability = {
      ...ticketData,
      available_quantity: ticketData.total_quantity,
      status: 'active'
    };

    console.log('🎫 Ticket data with availability:', ticketWithAvailability);

    const { data, error } = await supabase
      .from('tickets')
      .insert([ticketWithAvailability])
      .select()
      .single();

    if (error) {
      console.error('❌ Ticket creation error:', error);
      return NextResponse.json({
        error: 'Failed to create ticket',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Ticket created successfully:', data?.id);

    return NextResponse.json({
      success: true,
      message: 'Ticket created successfully',
      data
    });

  } catch (error: any) {
    console.error('❌ Ticket creation API error:', error);
    
    return NextResponse.json({
      error: 'Failed to create ticket',
      details: error.message
    }, { status: 500 });
  }
}
