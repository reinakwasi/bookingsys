import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('email, status')
      .eq('email', email.toLowerCase())
      .single()

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return NextResponse.json(
          { error: 'This email is already subscribed to our newsletter' },
          { status: 400 }
        )
      } else {
        // Reactivate unsubscribed user
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({ 
            status: 'active', 
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null 
          })
          .eq('email', email.toLowerCase())

        if (updateError) {
          console.error('Error reactivating subscription:', updateError)
          return NextResponse.json(
            { error: 'Failed to reactivate subscription' },
            { status: 500 }
          )
        }

        console.log('Reactivated newsletter subscription:', email)
        return NextResponse.json(
          { message: 'Successfully reactivated your newsletter subscription!' },
          { status: 200 }
        )
      }
    }

    // Add new subscriber
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email: email.toLowerCase(),
          subscribed_at: new Date().toISOString(),
          status: 'active'
        }
      ])
      .select()

    if (error) {
      console.error('Newsletter subscription error:', error)
      
      // If table doesn't exist, create a fallback response
      if (error.code === 'PGRST116') {
        console.log('Newsletter table does not exist, logging subscription:', email)
        return NextResponse.json(
          { message: 'Subscription received' },
          { status: 200 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      )
    }

    console.log('New newsletter subscription:', email)

    // Send welcome email
    let emailSent = false
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-email-working`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Welcome to Hotel 734 Newsletter! 🏨',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #D97706; margin: 0; font-size: 28px;">🏨 Hotel 734</h1>
                  <p style="color: #666; margin: 5px 0 0 0;">Luxury & Comfort</p>
                </div>
                
                <h2 style="color: #333; margin-bottom: 20px;">Welcome to Our Newsletter!</h2>
                <p style="color: #555; line-height: 1.6;">Thank you for subscribing to Hotel 734's newsletter. We're thrilled to have you join our community!</p>
                
                <div style="background-color: #FFF7ED; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D97706;">
                  <h3 style="color: #D97706; margin-top: 0;">What you'll receive:</h3>
                  <ul style="color: #555; line-height: 1.8;">
                    <li>🎉 Exclusive special offers and discounts</li>
                    <li>🏨 Updates on new services and amenities</li>
                    <li>📅 Information about upcoming events</li>
                    <li>📰 Latest hotel news and announcements</li>
                    <li>🌟 VIP access to limited-time promotions</li>
                  </ul>
                </div>
                
                <p style="color: #555; line-height: 1.6;">We promise to only send you valuable content and never spam your inbox. You can unsubscribe at any time.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://www.facebook.com/hotel734?mibextid=ZbWKwL" style="display: inline-block; margin: 0 10px; color: #D97706; text-decoration: none;">Facebook</a>
                  <a href="https://www.instagram.com/hotel.734?igsh=MWw2NXBxZ3R5a3V3YQ==" style="display: inline-block; margin: 0 10px; color: #D97706; text-decoration: none;">Instagram</a>
                  <a href="https://www.tiktok.com/@hotel.734" style="display: inline-block; margin: 0 10px; color: #D97706; text-decoration: none;">TikTok</a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <div style="text-align: center; color: #888; font-size: 14px;">
                  <p><strong>Hotel 734</strong><br>
                  Bronikrom, New Edubiase<br>
                  Ashanti Region, Ghana<br>
                  📞 +233 24 409 3821<br>
                  ✉️ info@hotel734@gmail.com</p>
                </div>
              </div>
            </div>
          `
        }),
      })

      if (emailResponse.ok) {
        emailSent = true
        console.log('Welcome email sent successfully to:', email)
      } else {
        console.error('Welcome email failed with status:', emailResponse.status)
      }
    } catch (emailError) {
      console.error('Welcome email error:', emailError)
    }

    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
