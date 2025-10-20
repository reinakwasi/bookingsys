import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateUniqueShortHash } from '@/lib/shortLinkGenerator';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting access token migration...');

    // Get all ticket purchases without access_token
    const { data: purchases, error: fetchError } = await supabase
      .from('ticket_purchases')
      .select('id, customer_name, access_token')
      .or('access_token.is.null,access_token.eq.')

    if (fetchError) {
      console.error('❌ Error fetching purchases:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch purchases'
      }, { status: 500 });
    }

    if (!purchases || purchases.length === 0) {
      console.log('✅ No purchases need access token migration');
      return NextResponse.json({
        success: true,
        message: 'No purchases need migration',
        updated: 0
      });
    }

    console.log(`📊 Found ${purchases.length} purchases without access tokens`);

    // Update each purchase with a unique access token
    const updatePromises = purchases.map(async (purchase) => {
      try {
        const shortHash = await generateUniqueShortHash();
        
        const { error: updateError } = await supabase
          .from('ticket_purchases')
          .update({ 
            access_token: shortHash,
            qr_code: `QR-${shortHash.toUpperCase()}`
          })
          .eq('id', purchase.id);

        if (updateError) {
          console.error(`❌ Failed to update purchase ${purchase.id}:`, updateError);
          return { id: purchase.id, success: false, error: updateError.message };
        }

        console.log(`✅ Updated purchase ${purchase.id} with token ${shortHash}`);
        return { id: purchase.id, success: true, token: shortHash };
      } catch (error: any) {
        console.error(`❌ Error updating purchase ${purchase.id}:`, error);
        return { id: purchase.id, success: false, error: error.message };
      }
    });

    const results = await Promise.all(updatePromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`🎯 Migration completed: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      message: `Access token migration completed`,
      stats: {
        total: purchases.length,
        successful,
        failed
      },
      results
    });

  } catch (error: any) {
    console.error('❌ Access token migration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error.message
    }, { status: 500 });
  }
}
