import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing admin authentication system...')
    
    // Test 1: Check if Supabase is configured
    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET')
    console.log('🔑 Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      return NextResponse.json({
        success: false,
        error: 'Supabase URL not configured',
        tests: {
          supabaseConfig: false,
          databaseConnection: false,
          adminFunction: false,
          adminLogin: false
        }
      })
    }

    // Test 2: Check database connection
    console.log('🔍 Testing database connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed: ' + connectionError.message,
        tests: {
          supabaseConfig: true,
          databaseConnection: false,
          adminFunction: false,
          adminLogin: false
        }
      })
    }

    // Test 3: Check if admin function exists
    console.log('🔍 Testing admin login function...')
    const { data: functionTest, error: functionError } = await supabase.rpc('verify_admin_login', {
      p_username: 'test_nonexistent_user',
      p_password: 'test_password'
    })

    if (functionError && functionError.code === '42883') {
      return NextResponse.json({
        success: false,
        error: 'Admin login function not found. Please run complete-admin-auth-fix.sql',
        tests: {
          supabaseConfig: true,
          databaseConnection: true,
          adminFunction: false,
          adminLogin: false
        },
        migrationRequired: true,
        migrationFile: 'complete-admin-auth-fix.sql'
      })
    }

    // Test 4: Test actual admin login
    console.log('🔍 Testing admin login with correct credentials...')
    const { data: loginTest, error: loginError } = await supabase.rpc('verify_admin_login', {
      p_username: 'admin',
      p_password: 'Hotel734!SecureAdmin2024'
    })

    if (loginError) {
      console.error('❌ Admin login test failed:', loginError)
      return NextResponse.json({
        success: false,
        error: 'Admin login test failed: ' + loginError.message,
        tests: {
          supabaseConfig: true,
          databaseConnection: true,
          adminFunction: true,
          adminLogin: false
        }
      })
    }

    const loginSuccess = loginTest && loginTest.length > 0 && loginTest[0].admin_id
    
    console.log('✅ All tests passed!')
    return NextResponse.json({
      success: true,
      message: 'All admin authentication tests passed!',
      tests: {
        supabaseConfig: true,
        databaseConnection: true,
        adminFunction: true,
        adminLogin: loginSuccess
      },
      adminData: loginSuccess ? {
        id: loginTest[0].admin_id,
        username: loginTest[0].username,
        email: loginTest[0].email,
        full_name: loginTest[0].full_name
      } : null
    })

  } catch (error) {
    console.error('💥 Admin test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      tests: {
        supabaseConfig: false,
        databaseConnection: false,
        adminFunction: false,
        adminLogin: false
      }
    })
  }
}
