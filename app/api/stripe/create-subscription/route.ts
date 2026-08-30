import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'
import type Stripe from 'stripe'
import { buildSubscriptionItem } from '@/lib/donations/stripe-items'
import { getTierById } from '@/lib/donations/tiers'

const subscriptionSchema = z.object({
  donationId: z.string().uuid(),
  donorEmail: z.string().email(),
  donorName: z.string(),
  tierName: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = subscriptionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { donationId, donorEmail, donorName, tierName } = validation.data

    // The tier and amount come from the donation record written by /api/donations,
    // never from this request body, so the browser cannot name its own price.
    const existingDonation = await supabase
      .from('donations')
      .select('payment_gateway_id, payment_status, recurring_tier, amount')
      .eq('id', donationId)
      .single()

    if (!existingDonation.data) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
    }

    const { recurring_tier: tierId, amount: storedAmount } = existingDonation.data
    const amount = Number(storedAmount)

    if (!tierId) {
      return NextResponse.json(
        { error: 'Donation has no recurring tier' },
        { status: 400 }
      )
    }

    if (existingDonation.data?.payment_gateway_id &&
        existingDonation.data.payment_status !== 'failed') {
      // Subscription already created, retrieve and return existing data
      try {
        const existingSubscription = await stripe.subscriptions.retrieve(
          existingDonation.data.payment_gateway_id,
          { expand: ['latest_invoice.confirmation_secret'] }
        )

        const invoice = existingSubscription.latest_invoice as Stripe.Invoice
        const clientSecret = typeof invoice === 'object' && invoice && 'confirmation_secret' in invoice
          ? (invoice.confirmation_secret as { client_secret?: string })?.client_secret
          : undefined

        if (clientSecret) {
          return NextResponse.json({
            clientSecret,
            subscriptionId: existingSubscription.id,
            publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
          })
        }
      } catch (err) {
        console.error('Failed to retrieve existing subscription:', err)
        // Fall through to create new subscription
      }
    }

    // Find or create customer (simple approach)
    let customer
    try {
      const customers = await stripe.customers.list({ email: donorEmail, limit: 1 })
      if (customers.data.length > 0) {
        customer = customers.data[0]
      } else {
        customer = await stripe.customers.create({
          email: donorEmail,
          name: donorName,
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      throw new Error(`Failed to create or retrieve customer: ${errorMessage}`)
    }

    // Use single product for all donations with dynamic pricing
    // Create this product once in Stripe Dashboard or set STRIPE_DONATION_PRODUCT_ID env var
    const DONATION_PRODUCT_ID = process.env.STRIPE_DONATION_PRODUCT_ID || 'prod_donation_default'
    const centerPriceId = process.env.STRIPE_CENTER_PRICE_ID

    if (!centerPriceId) {
      console.warn(
        'STRIPE_CENTER_PRICE_ID is not set. Centre subscriptions will bill the correct ' +
        'total via an inline price, but Stripe cannot aggregate centres sponsored.'
      )
    }

    let subscriptionItem: Stripe.SubscriptionCreateParams.Item
    try {
      subscriptionItem = buildSubscriptionItem({
        tierId,
        amount,
        donationProductId: DONATION_PRODUCT_ID,
        centerPriceId
      })
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Invalid donation tier' },
        { status: 400 }
      )
    }

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [subscriptionItem],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic'
          }
        },
        payment_method_types: ['card']
      },
      expand: ['latest_invoice.confirmation_secret'],
      metadata: {
        donationId,
        tierId,
        tierName: tierName || 'Custom',
        centerCount: getTierById('us', tierId)?.centerCount?.toString() ?? '',
        amount: amount.toString()
      }
    })

    // Update donation with subscription ID
    await supabase
      .from('donations')
      .update({
        payment_gateway: 'stripe',
        payment_gateway_id: subscription.id
      })
      .eq('id', donationId)

    // Extract client_secret - Stripe returns it in confirmation_secret
    const invoice = subscription.latest_invoice as Stripe.Invoice
    const clientSecret = typeof invoice === 'object' && invoice && 'confirmation_secret' in invoice
      ? (invoice.confirmation_secret as { client_secret?: string })?.client_secret
      : undefined

    if (!clientSecret) {
      throw new Error('Failed to get client secret from subscription')
    }

    return NextResponse.json({
      clientSecret,
      subscriptionId: subscription.id,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    })
  } catch (error) {
    console.error('Stripe subscription creation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to create Stripe subscription: ${errorMessage}` },
      { status: 500 }
    )
  }
}
