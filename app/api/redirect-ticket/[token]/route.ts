import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    console.log('🔄 Redirect request for token:', token);

    // Check if this is an old ACCESS- token
    if (token.startsWith('ACCESS-')) {
      console.log('🔍 Detected old ACCESS- token, looking up in database...');
      
      // Find the purchase with this old token
      const { data: purchase, error } = await supabase
        .from('ticket_purchases')
        .select('id, access_token, customer_name')
        .eq('access_token', token)
        .single();

      if (error || !purchase) {
        console.error('❌ Old token not found:', { token, error });
        return NextResponse.redirect(new URL('/tickets?error=token-not-found', request.url));
      }

      console.log('✅ Found purchase with old token, redirecting to my-tickets page');
      
      // Redirect to the my-tickets page with the same token
      // The my-tickets page will handle the API call
      return NextResponse.redirect(new URL(`/my-tickets/${token}`, request.url));
    }

    // For new 8-character tokens, redirect to the short link system
    console.log('🔗 Detected short token, redirecting to /t/ system');
    return NextResponse.redirect(new URL(`/t/${token}`, request.url));

  } catch (error: any) {
    console.error('❌ Redirect error:', error);
    return NextResponse.redirect(new URL('/tickets?error=redirect-failed', request.url));
  }
}
