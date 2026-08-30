import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { donationRequestSchema } from '@/lib/validations/donation'
import { getTierById, isCustomAmountValid, resolveAmount } from '@/lib/donations/tiers'
import type { DonationResponse } from '@/app/[locale]/donate/types'

export async function POST(request: NextRequest): Promise<NextResponse<DonationResponse | { error: string }>> {
  try {
    const body = await request.json()

    // Validate request body
    const validation = donationRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = validation.data

    // Determine organization and currency based on country
    const organization = data.country === 'india' ? 'Heera Foundation' : 'Spring Foundation'
    const currency = data.country === 'india' ? 'INR' : 'USD'

    // The amount is never taken from the request. Fixed tiers are priced from the tier
    // table; only one-time and custom-tier donations may name their own amount, and only
    // within bounds.
    let amount: number
    try {
      amount = data.donationType === 'recurring' && data.recurringTier
        ? resolveAmount(data.country, data.recurringTier, data.amount)
        : data.amount
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Invalid donation amount' },
        { status: 400 }
      )
    }

    if (data.donationType === 'onetime' && !isCustomAmountValid(data.country, amount)) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400 }
      )
    }

    const centerCount = data.donationType === 'recurring' && data.recurringTier
      ? getTierById(data.country, data.recurringTier)?.centerCount ?? null
      : null

    // Insert donation record
    const { data: donation, error } = await supabase
      .from('donations')
      .insert({
        donor_name: data.donorName,
        donor_email: data.donorEmail,
        donor_phone: data.donorPhone,
        donor_address: data.donorAddress || null,
        pan_number: data.panNumber || null,
        country: data.country,
        organization,
        donation_type: data.donationType,
        recurring_tier: data.recurringTier || null,
        center_count: centerCount,
        group_members: data.friends.length > 0 ? data.friends : null,
        amount,
        currency,
        payment_method: data.paymentMethod,
        payment_status: 'pending'
      })
      .select('id, amount, currency')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create donation record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      donationId: donation.id,
      amount: Number(donation.amount),
      currency: donation.currency as 'INR' | 'USD'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
