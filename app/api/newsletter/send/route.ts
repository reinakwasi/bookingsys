import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  // Create Supabase client inside the function to avoid build-time errors
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  try {
    const { subject, content, htmlContent, images } = await request.json()

    // Validate required fields
    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      )
    }

    // Get all active subscribers
    const { data: subscribers, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('status', 'active')

    if (fetchError) {
      console.error('Error fetching subscribers:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { message: 'No active subscribers found' },
        { status: 200 }
      )
    }

    console.log(`Sending newsletter to ${subscribers.length} subscribers`)

    // Send emails to all subscribers
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-email-working`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: subscriber.email,
            subject: subject,
            html: htmlContent || `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #D97706; margin: 0; font-size: 28px;">🏨 Hotel 734</h1>
                    <p style="color: #666; margin: 5px 0 0 0;">Luxury & Comfort</p>
                  </div>
                  
                  <div style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                    ${content.replace(/\n/g, '<br>')}
                  </div>
                  
                  ${images && images.length > 0 ? `
                    <div style="margin: 30px 0;">
                      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        ${images.map((img: any) => `
                          <div style="text-align: center;">
                            <img src="${img.base64}" alt="Newsletter Image" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                  
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
                    <p style="margin-top: 20px; font-size: 12px;">
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}" style="color: #999; text-decoration: none;">Unsubscribe</a>
                    </p>
                  </div>
                </div>
              </div>
            `
          }),
        })

        if (response.ok) {
          console.log(`Newsletter sent successfully to: ${subscriber.email}`)
          return { email: subscriber.email, status: 'sent' }
        } else {
          console.error(`Failed to send newsletter to: ${subscriber.email}`)
          return { email: subscriber.email, status: 'failed' }
        }
      } catch (error) {
        console.error(`Error sending to ${subscriber.email}:`, error)
        return { email: subscriber.email, status: 'error' }
      }
    })

    // Wait for all emails to be processed
    const results = await Promise.all(emailPromises)
    
    const successful = results.filter(r => r.status === 'sent').length
    const failed = results.filter(r => r.status !== 'sent').length

    console.log(`Newsletter campaign completed: ${successful} sent, ${failed} failed`)

    return NextResponse.json({
      message: `Newsletter sent successfully`,
      stats: {
        total: subscribers.length,
        sent: successful,
        failed: failed
      },
      results: results
    }, { status: 200 })

  } catch (error) {
    console.error('Newsletter send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
