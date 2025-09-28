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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    console.log('🗑️ Deleting booking with ID:', id);

    // Update booking status to 'cancelled' instead of hard delete
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Booking delete error:', error);
      return NextResponse.json({
        error: 'Failed to delete booking',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Booking deleted successfully:', data?.id);

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
      data
    });

  } catch (error: any) {
    console.error('❌ Booking delete API error:', error);
    
    return NextResponse.json({
      error: 'Failed to delete booking',
      details: error.message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updateData = await request.json();

    console.log('🔄 Updating booking with ID:', id, 'Data:', updateData);

    const { data, error } = await supabase
      .from('bookings')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Booking update error:', error);
      return NextResponse.json({
        error: 'Failed to update booking',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Booking updated successfully:', data?.id);

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      data
    });

  } catch (error: any) {
    console.error('❌ Booking update API error:', error);
    
    return NextResponse.json({
      error: 'Failed to update booking',
      details: error.message
    }, { status: 500 });
  }
}
