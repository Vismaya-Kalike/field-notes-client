import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { stripeIntentSchema } from '@/lib/validations/donation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = stripeIntentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { amount, donationId, donorEmail } = validation.data

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: { donationId },
      receipt_email: donorEmail
    })

    // Update donation with payment gateway ID
    await supabase
      .from('donations')
      .update({
        payment_gateway: 'stripe',
        payment_gateway_id: paymentIntent.id
      })
      .eq('id', donationId)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    })
  } catch (error) {
    console.error('Stripe intent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create Stripe payment intent' },
      { status: 500 }
    )
  }
}
