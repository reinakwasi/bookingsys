import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('🎫 Fetching all tickets');

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });
      
      // Return mock data if Supabase is not configured
      return NextResponse.json([
        {
          id: 'mock-1',
          title: 'Sample Event',
          description: 'This is a sample event',
          activity_type: 'Concert',
          event_date: '2024-12-25',
          event_time: '19:00',
          price: 50,
          total_quantity: 100,
          available_quantity: 75,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    }

    // Create Supabase client with error handling
    let supabase;
    try {
      supabase = createClient(supabaseUrl, supabaseKey);
    } catch (clientError: any) {
      console.error('❌ Failed to create Supabase client:', clientError);
      return NextResponse.json({
        error: 'Database connection failed',
        details: clientError.message
      }, { status: 500 });
    }

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
      console.log('🎫 Excluding inactive tickets from results');
    } else {
      console.log('🎫 Including inactive tickets in results');
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Tickets fetch error:', error);
      
      // Check if it's a table not found error
      if (error.code === 'PGRST116') {
        console.log('🎫 Tickets table not found, returning empty array');
        return NextResponse.json([]);
      }
      
      return NextResponse.json({
        error: 'Failed to fetch tickets',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    console.log(`✅ Fetched ${data?.length || 0} tickets (includeInactive: ${includeInactive})`);

    return NextResponse.json(data || []);

  } catch (error: any) {
    console.error('❌ Tickets API error:', error);
    
    // Provide detailed error information
    const errorResponse = {
      error: 'Failed to fetch tickets',
      details: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    console.error('❌ Full error details:', errorResponse);
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ticketData = await request.json();
    console.log('🎫 Creating new ticket:', ticketData);

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables for ticket creation');
      return NextResponse.json({
        error: 'Database not configured',
        details: 'Missing Supabase configuration'
      }, { status: 500 });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

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
        details: error.message,
        code: error.code
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
      details: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
