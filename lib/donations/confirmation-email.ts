import { Resend } from 'resend'
import { siteUrl } from '@/lib/site-url'
import { STRIPE_PORTAL_URL } from './portal'

const FROM = 'Vismaya Kalike <donate@vismayakalike.org>'

export interface ConfirmationEmailInput {
  donorName: string
  donorEmail: string
  amount: number
  centerCount: number | null
  tierName: string | null
}

function describeGift(centerCount: number | null, tierName: string | null): string {
  if (centerCount === 1) return 'a learning centre'
  if (centerCount && centerCount > 1) return `${centerCount} learning centres`
  return tierName ? tierName.toLowerCase() : 'our learning centres'
}

export function renderConfirmationEmail({
  donorName,
  amount,
  centerCount,
  tierName
}: ConfirmationEmailInput): { subject: string; html: string; text: string } {
  const formattedAmount = `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`
  const gift = describeGift(centerCount, tierName)

  const subject = `Thank you for supporting ${gift}`

  const manageHtml = `<p style="margin:24px 0 0;font-size:14px;color:#555">
         You can update your card or cancel this monthly donation at any time from the
         <a href="${STRIPE_PORTAL_URL}" style="color:#0a7d7d">donor billing portal</a>.
         Enter this email address and Stripe will send you a secure link.
       </p>`

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1a1a">
      <h1 style="font-size:20px;margin:0 0 16px">Thank you, ${donorName}</h1>
      <p style="margin:0 0 16px;line-height:1.6">
        Your monthly donation of <strong>${formattedAmount}</strong> supports ${gift},
        helping create joyful learning spaces for children.
      </p>
      <p style="margin:0;line-height:1.6">
        You'll be charged ${formattedAmount} each month. We'll email you if anything changes.
      </p>
      ${manageHtml}
      <p style="margin:32px 0 0;font-size:12px;color:#888">
        Vismaya Kalike &middot; <a href="${siteUrl()}" style="color:#888">vismayakalike.org</a>
      </p>
    </div>
  `.trim()

  const text = [
    `Thank you, ${donorName}`,
    '',
    `Your monthly donation of ${formattedAmount} supports ${gift}, helping create joyful learning spaces for children.`,
    '',
    `You'll be charged ${formattedAmount} each month. We'll email you if anything changes.`,
    '',
    'Update your card or cancel this monthly donation at any time:',
    STRIPE_PORTAL_URL,
    'Enter this email address and Stripe will send you a secure link.',
    '',
    'Vismaya Kalike'
  ].join('\n')

  return { subject, html, text }
}

/**
 * Sends the donor's confirmation. Never throws: a failed email must not fail the
 * webhook, or Stripe retries it and the donor is thanked repeatedly for one donation.
 */
export async function sendConfirmationEmail(
  input: ConfirmationEmailInput
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set; skipping donation confirmation email')
    return { sent: false, reason: 'missing_api_key' }
  }

  try {
    const { subject, html, text } = renderConfirmationEmail(input)
    const { error } = await new Resend(apiKey).emails.send({
      from: FROM,
      to: input.donorEmail,
      subject,
      html,
      text
    })

    if (error) {
      console.error('Donation confirmation email failed:', error)
      return { sent: false, reason: 'send_failed' }
    }
    return { sent: true }
  } catch (err) {
    console.error('Donation confirmation email threw:', err)
    return { sent: false, reason: 'exception' }
  }
}
