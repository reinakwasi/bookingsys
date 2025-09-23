import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    console.log('🔐 Admin login attempt for username:', username)
    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET')
    console.log('🔑 Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')
    
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      console.error('❌ Supabase URL not configured properly')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL in Vercel environment variables.',
          debug: {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          }
        },
        { status: 500 }
      )
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'placeholder-key') {
      console.error('❌ Supabase key not configured properly')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database key not configured. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables.',
          debug: {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          }
        },
        { status: 500 }
      )
    }

    // Try to call the admin login function
    console.log('🔍 Calling verify_admin_login RPC...')
    const { data, error } = await supabase.rpc('verify_admin_login', {
      p_username: username,
      p_password: password
    })

    console.log('📊 RPC Response:', { data, error })

    if (error) {
      console.error('❌ Supabase RPC error:', error)
      
      // Check if the function doesn't exist (error code 42883)
      if (error.code === '42883' || error.message?.includes('function') || error.message?.includes('does not exist')) {
        console.log('⚠️ Database function not found, using fallback authentication')
        
        // Temporary fallback authentication
        if (username === 'admin' && password === 'Hotel734!SecureAdmin2024') {
          console.log('✅ Fallback authentication successful')
          return NextResponse.json({
            success: true,
            user: {
              id: 'fallback-admin',
              username: 'admin',
              email: 'admin@hotel734.com',
              full_name: 'Hotel 734 Administrator',
              last_login: new Date().toISOString()
            }
          })
        }
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid credentials. Use admin/Hotel734!SecureAdmin2024 or run database migration.',
            debug: {
              errorCode: error.code,
              errorMessage: error.message,
              migrationRequired: true,
              migrationFile: 'migration-admin-users.sql',
              fallbackCredentials: 'admin / Hotel734!SecureAdmin2024'
            }
          },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed: ' + error.message,
          debug: {
            errorCode: error.code,
            errorMessage: error.message,
            errorDetails: error.details
          }
        },
        { status: 500 }
      )
    }

    // Check if we got a result
    if (!data || data.length === 0) {
      console.log('❌ No admin user found or invalid credentials')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid username or password.' 
        },
        { status: 401 }
      )
    }

    const adminData = data[0]
    console.log('✅ Admin login successful for:', adminData.username)

    // Check if account is locked
    if (adminData.is_locked) {
      console.log('🔒 Account is locked')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Account is locked due to too many failed login attempts. Please contact support.',
          isLocked: true 
        },
        { status: 423 }
      )
    }

    // Return success with user data
    return NextResponse.json({
      success: true,
      user: {
        id: adminData.admin_id,
        username: adminData.username,
        email: adminData.email,
        full_name: adminData.full_name,
        last_login: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('💥 Admin login error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Login failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
        debug: {
          errorType: typeof error,
          errorString: String(error)
        }
      },
      { status: 500 }
    )
  }
}
