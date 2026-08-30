import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { newsletterSubscriptionSchema } from '@/lib/validations/newsletter'

export async function POST(request: NextRequest): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const body = await request.json()

    const validation = newsletterSubscriptionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email } = validation.data

    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        { name, email, subscribed_at: new Date().toISOString() },
        { onConflict: 'email' }
      )

    if (error) {
      console.error('Newsletter subscription error:', error)
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Successfully subscribed!' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
