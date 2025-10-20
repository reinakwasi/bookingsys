import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Testing Supabase connection...');

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('🔧 Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlLength: supabaseUrl?.length,
      keyLength: supabaseKey?.length
    });

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      });
    }

    // Test Supabase client creation
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');

    // Test a simple query
    const { data, error } = await supabase
      .from('tickets')
      .select('count(*)', { count: 'exact', head: true });

    if (error) {
      console.log('❌ Supabase query error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: error.message,
        code: error.code
      });
    }

    console.log('✅ Supabase connection test successful');

    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      ticketCount: data || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Connection test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error.message,
      stack: error.stack
    });
  }
}
