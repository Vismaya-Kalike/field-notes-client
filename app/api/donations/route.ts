import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { donationRequestSchema } from '@/lib/validations/donation'
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
        amount: data.amount,
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
