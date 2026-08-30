import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { sendConfirmationEmail } from '@/lib/donations/confirmation-email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // Atomic idempotency check: try to insert event record
    // If it already exists (duplicate webhook), the insert will fail
    const { error: insertError } = await supabase
      .from('webhook_events')
      .insert({
        id: event.id,
        type: event.type,
        event_data: event.data.object
      })

    if (insertError) {
      // Event already processed (duplicate webhook delivery)
      console.log(`Webhook event ${event.id} already processed, skipping`)
      return NextResponse.json({ received: true, status: 'already_processed' })
    }

    // Handle payment_intent.succeeded event (one-time donations ONLY)
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object

      // Only process if this is NOT a subscription payment
      // Subscription payments are handled by invoice.paid event
      // Check if invoice field exists and is null/undefined (one-time payment)
      const hasInvoice = 'invoice' in paymentIntent && paymentIntent.invoice
      if (!hasInvoice) {
        await supabase
          .from('donations')
          .update({
            payment_status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('payment_gateway_id', paymentIntent.id)
      }
    }

    // Handle invoice.paid event (subscription payments)
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object
      // Access subscription safely - it may be a string ID or Stripe.Subscription object
      let subscriptionId: string | null = null
      if ('subscription' in invoice && invoice.subscription) {
        if (typeof invoice.subscription === 'string') {
          subscriptionId = invoice.subscription
        } else if (typeof invoice.subscription === 'object' && invoice.subscription !== null) {
          subscriptionId = (invoice.subscription as { id: string }).id
        }
      }

      if (subscriptionId) {
        // Mark donation as completed on first successful subscription payment
        if (invoice.billing_reason === 'subscription_create') {
          const { data: donation } = await supabase
            .from('donations')
            .update({
              payment_status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('payment_gateway_id', subscriptionId)
            .select('donor_name, donor_email, amount, center_count, recurring_tier')
            .maybeSingle()

          // Sent here rather than at checkout so the donor is only thanked once money
          // has actually moved. Failures are logged, never thrown: this webhook is
          // already idempotent, and a rejected delivery would have Stripe retry it.
          if (donation) {
            await sendConfirmationEmail({
              donorName: donation.donor_name,
              donorEmail: donation.donor_email,
              amount: Number(donation.amount),
              centerCount: donation.center_count,
              tierName: donation.recurring_tier
            })
          }
        }
        // Note: Subsequent recurring payments (billing_reason: 'subscription_cycle')
        // are tracked automatically by Stripe but don't need to update the original donation record
      }
    }

    // Handle subscription cancellation. This is a donor choosing to stop, not a
    // payment failure, and must stay distinguishable from one in reporting.
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object

      await supabase
        .from('donations')
        .update({
          payment_status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('payment_gateway_id', subscription.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
