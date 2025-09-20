import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: 'Paystack secret key not configured' },
        { status: 500 }
      )
    }

    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Paystack verification error:', data)
      return NextResponse.json(
        { error: data.message || 'Payment verification failed' },
        { status: response.status }
      )
    }

    const transaction = data.data

    // Check if payment was successful
    if (transaction.status !== 'success') {
      return NextResponse.json({
        success: false,
        status: transaction.status,
        message: 'Payment was not successful'
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        reference: transaction.reference,
        amount: transaction.amount / 100, // Convert from kobo back to cedis
        currency: transaction.currency,
        status: transaction.status,
        paid_at: transaction.paid_at,
        channel: transaction.channel,
        customer: transaction.customer,
        metadata: transaction.metadata
      }
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
