import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const purchaseId = searchParams.get('purchase_id');
    const email = searchParams.get('email');

    if (!purchaseId && !email) {
      return NextResponse.json({
        success: false,
        error: 'Purchase ID or email is required'
      }, { status: 400 });
    }

    let query = supabase
      .from('ticket_purchases')
      .select('id, customer_email, customer_phone, created_at, payment_status');

    if (purchaseId) {
      query = query.eq('id', purchaseId);
    } else if (email) {
      query = query.eq('customer_email', email);
    }

    const { data: purchases, error } = await query;

    if (error) {
      console.error('Error fetching purchase data:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch purchase data'
      }, { status: 500 });
    }

    if (!purchases || purchases.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No purchases found'
      }, { status: 404 });
    }

    // For each purchase, determine notification status
    const notificationStatus = purchases.map(purchase => {
      const hasEmail = purchase.customer_email && purchase.customer_email.trim();
      const hasPhone = purchase.customer_phone && purchase.customer_phone.trim();
      
      return {
        purchase_id: purchase.id,
        customer_email: purchase.customer_email,
        customer_phone: purchase.customer_phone ? purchase.customer_phone.substring(0, 6) + '***' : null,
        payment_status: purchase.payment_status,
        created_at: purchase.created_at,
        notifications: {
          email: {
            enabled: !!hasEmail,
            status: hasEmail ? 'should_be_sent' : 'disabled',
            reason: hasEmail ? 'Email provided' : 'No email address provided'
          },
          sms: {
            enabled: !!hasPhone,
            status: hasPhone ? 'should_be_sent' : 'disabled', 
            reason: hasPhone ? 'Phone number provided' : 'No phone number provided'
          }
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: notificationStatus,
      message: 'Notification status retrieved successfully'
    });

  } catch (error: any) {
    console.error('Notification status API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
