import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching all bookings');

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables for bookings');
      return NextResponse.json([]);
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, let's try a simple query without joins
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Bookings fetch error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // If the bookings table doesn't exist, return empty array
      if (error.code === 'PGRST116' || error.message?.includes('relation "bookings" does not exist')) {
        console.log('⚠️ Bookings table does not exist, returning empty array');
        return NextResponse.json([]);
      }
      
      return NextResponse.json({
        error: 'Failed to fetch bookings',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    console.log(`✅ Fetched ${data?.length || 0} bookings`);
    
    // Filter out deleted bookings on the server side
    const activeBookings = data?.filter((booking: any) => booking.status !== 'deleted') || [];
    console.log(`✅ Returning ${activeBookings.length} active bookings`);

    return NextResponse.json(activeBookings);

  } catch (error: any) {
    console.error('❌ Bookings API error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch bookings',
      details: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();
    console.log('📝 Creating new booking:', bookingData);

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables for booking creation');
      return NextResponse.json({
        error: 'Database not configured',
        details: 'Missing Supabase configuration'
      }, { status: 500 });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) {
      console.error('❌ Booking creation error:', error);
      return NextResponse.json({
        error: 'Failed to create booking',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    console.log('✅ Booking created successfully:', data?.id);

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      data
    });

  } catch (error: any) {
    console.error('❌ Booking creation API error:', error);
    
    return NextResponse.json({
      error: 'Failed to create booking',
      details: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
