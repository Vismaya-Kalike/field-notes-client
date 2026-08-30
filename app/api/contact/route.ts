import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { contactFormSchema } from '@/lib/validations/contact'

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }
  return new Resend(apiKey)
}

const RECIPIENTS = [
  'srilakshmi@vismayakalike.org',
  'venkatesh@vismayakalike.org',
  'vig9295@gmail.com',
]

export async function POST(request: NextRequest): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const body = await request.json()

    const validation = contactFormSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, message } = validation.data

    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert({ name, email, message })

    if (dbError) {
      console.error('Contact submission DB error:', dbError)
      return NextResponse.json(
        { error: 'Failed to submit. Please try again.' },
        { status: 500 }
      )
    }

    const resend = getResendClient()
    const { error: emailError } = await resend.emails.send({
      from: 'Vismaya Kalike <contact@vismayakalike.org>',
      to: RECIPIENTS,
      replyTo: email,
      subject: `New contact form submission from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        '',
        'Message:',
        message,
      ].join('\n'),
    })

    if (emailError) {
      console.error('Resend email error:', emailError)
    }

    return NextResponse.json({ message: 'Message sent successfully!' })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
