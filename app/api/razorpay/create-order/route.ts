import { NextRequest, NextResponse } from 'next/server'
import { razorpay } from '@/lib/razorpay'
import { supabase } from '@/lib/supabase'
import { razorpayOrderSchema } from '@/lib/validations/donation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = razorpayOrderSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { amount, donationId } = validation.data

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: donationId,
      notes: { donationId }
    })

    // Update donation with payment gateway ID
    await supabase
      .from('donations')
      .update({
        payment_gateway: 'razorpay',
        payment_gateway_id: order.id
      })
      .eq('id', donationId)

    return NextResponse.json({
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID
    })
  } catch (error) {
    console.error('Razorpay order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create Razorpay order' },
      { status: 500 }
    )
  }
}
