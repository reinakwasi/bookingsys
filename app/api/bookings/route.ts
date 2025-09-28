import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching all bookings');

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Bookings fetch error:', error);
      return NextResponse.json({
        error: 'Failed to fetch bookings',
        details: error.message
      }, { status: 500 });
    }

    console.log(`✅ Fetched ${data?.length || 0} bookings`);

    return NextResponse.json(data || []);

  } catch (error: any) {
    console.error('❌ Bookings API error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch bookings',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();
    console.log('📝 Creating new booking:', bookingData);

    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) {
      console.error('❌ Booking creation error:', error);
      return NextResponse.json({
        error: 'Failed to create booking',
        details: error.message
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
      details: error.message
    }, { status: 500 });
  }
}
