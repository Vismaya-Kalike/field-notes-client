import { NextRequest, NextResponse } from 'next/server'
import { Razorpay } from '@/lib/razorpay'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!
    const isValid = Razorpay.validateWebhookSignature(body, signature, webhookSecret)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)

    // Handle payment.captured event (one-time payments)
    if (event.event === 'payment.captured') {
      const orderId = event.payload.payment.entity.order_id

      await supabase
        .from('donations')
        .update({
          payment_status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('payment_gateway_id', orderId)
    }

    // Handle subscription.activated event (recurring payments)
    if (event.event === 'subscription.activated') {
      const subscriptionId = event.payload.subscription.entity.id

      await supabase
        .from('donations')
        .update({
          payment_status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('payment_gateway_id', subscriptionId)
    }

    // Handle subscription.charged event (recurring payment successful)
    if (event.event === 'subscription.charged') {
      const subscriptionId = event.payload.subscription.entity.id

      await supabase
        .from('donations')
        .update({
          payment_status: 'completed'
        })
        .eq('payment_gateway_id', subscriptionId)
    }

    // Handle subscription.cancelled event (donor stopped giving)
    if (event.event === 'subscription.cancelled') {
      const subscriptionId = event.payload.subscription.entity.id

      await supabase
        .from('donations')
        .update({
          payment_status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('payment_gateway_id', subscriptionId)
    }

    // Handle subscription.halted event (Razorpay stopped retrying failed charges)
    if (event.event === 'subscription.halted') {
      const subscriptionId = event.payload.subscription.entity.id

      await supabase
        .from('donations')
        .update({
          payment_status: 'failed'
        })
        .eq('payment_gateway_id', subscriptionId)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
