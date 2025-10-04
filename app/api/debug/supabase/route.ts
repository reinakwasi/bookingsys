import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Supabase connection...');

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (connectionError) {
      console.error('❌ Supabase connection error:', connectionError);
      return NextResponse.json({
        error: 'Supabase connection failed',
        details: connectionError.message,
        connected: false
      }, { status: 500 });
    }

    console.log('✅ Supabase connection successful');

    // Test if bookings table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'bookings')
      .eq('table_schema', 'public');

    const bookingsTableExists = tableCheck && tableCheck.length > 0;
    console.log('📋 Bookings table exists:', bookingsTableExists);

    // If bookings table exists, try to query it
    let bookingsData = null;
    let bookingsError = null;
    if (bookingsTableExists) {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, status, created_at')
        .limit(5);
      
      bookingsData = data;
      bookingsError = error;
    }

    return NextResponse.json({
      connected: true,
      bookingsTableExists,
      bookingsCount: bookingsData?.length || 0,
      bookingsError: bookingsError?.message || null,
      sampleBookings: bookingsData || [],
      message: 'Supabase connection test completed'
    });

  } catch (error: any) {
    console.error('❌ Supabase test error:', error);
    
    return NextResponse.json({
      error: 'Supabase test failed',
      details: error.message,
      connected: false
    }, { status: 500 });
  }
}
