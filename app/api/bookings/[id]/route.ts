import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    console.log('📋 Fetching booking details for ID:', id);

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Booking fetch error:', error);
      return NextResponse.json({
        error: 'Booking not found',
        details: error.message
      }, { status: 404 });
    }

    console.log('✅ Booking details fetched:', data?.id);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ Booking API error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch booking details',
      details: error.message
    }, { status: 500 });
  }
}
