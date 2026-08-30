import { NextRequest, NextResponse } from 'next/server'
import { razorpay } from '@/lib/razorpay'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { z } from 'zod'

const razorpaySubscriptionSchema = z.object({
  amount: z.number().positive(),
  donationId: z.string().uuid(),
  tierId: z.string(),
  tierName: z.string(),
  donorEmail: z.string().email(),
  donorName: z.string(),
  donorPhone: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = razorpaySubscriptionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { amount, donationId, tierId, tierName } = validation.data

    // Create a plan for this subscription
    // Note: In production, you might want to create these plans once and reuse them
    const planId = `plan_${tierId}_${Math.round(amount)}`

    let plan
    try {
      // Try to fetch existing plan
      plan = await razorpay.plans.fetch(planId)
    } catch {
      // Plan doesn't exist, create it
      plan = await razorpay.plans.create({
        period: 'monthly',
        interval: 1,
        item: {
          name: tierName,
          amount: Math.round(amount * 100), // Convert to paise
          currency: 'INR',
          description: `Monthly donation - ${tierName}`
        }
      })
    }

    // Create subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: plan.id,
      customer_notify: 1,
      quantity: 1,
      total_count: 12, // 12 months
      notes: {
        donationId,
        tierName
      }
    })

    // Update donation with payment gateway ID
    await supabase
      .from('donations')
      .update({
        payment_gateway: 'razorpay',
        payment_gateway_id: subscription.id
      })
      .eq('id', donationId)

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID
    })
  } catch (error) {
    console.error('Razorpay subscription creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create Razorpay subscription' },
      { status: 500 }
    )
  }
}
