import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching ticket purchases with short links...');

    const { data: purchases, error } = await supabase
      .from('ticket_purchases')
      .select(`
        id,
        customer_name,
        customer_phone,
        access_token,
        payment_status,
        created_at,
        ticket:tickets(title, event_date)
      `)
      .not('access_token', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch short links'
      }, { status: 500 });
    }

    // Format data for admin view
    const formattedData = purchases?.map(purchase => ({
      id: purchase.id,
      customer_name: purchase.customer_name,
      customer_phone: purchase.customer_phone,
      event_name: purchase.ticket?.title || 'Unknown Event',
      event_date: purchase.ticket?.event_date,
      short_hash: purchase.access_token,
      short_link: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://hotel734.com'}/t/${purchase.access_token}`,
      payment_status: purchase.payment_status,
      created_at: purchase.created_at
    })) || [];

    console.log(`✅ Found ${formattedData.length} ticket purchases with short links`);

    return NextResponse.json({
      success: true,
      data: formattedData,
      total: formattedData.length
    });

  } catch (error: any) {
    console.error('❌ Short links API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Short links API error',
      details: error.message
    }, { status: 500 });
  }
}
