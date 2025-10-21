import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration')
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Get all newsletter subscribers
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false })

    if (error) {
      console.error('Error fetching newsletter subscribers:', error)
      
      // If table doesn't exist, return empty array
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          subscribers: [],
          stats: {
            total: 0,
            active: 0,
            unsubscribed: 0
          }
        })
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }

    // Calculate statistics
    const stats = {
      total: subscribers?.length || 0,
      active: subscribers?.filter((s: any) => s.status === 'active').length || 0,
      unsubscribed: subscribers?.filter((s: any) => s.status === 'unsubscribed').length || 0
    }

    return NextResponse.json({
      subscribers: subscribers || [],
      stats
    })

  } catch (error) {
    console.error('Newsletter subscribers fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // Delete subscriber
    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('email', email)

    if (error) {
      console.error('Error deleting subscriber:', error)
      return NextResponse.json(
        { error: 'Failed to delete subscriber' },
        { status: 500 }
      )
    }

    console.log('Deleted newsletter subscriber:', email)

    return NextResponse.json({
      message: 'Subscriber deleted successfully'
    })

  } catch (error) {
    console.error('Newsletter subscriber delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
