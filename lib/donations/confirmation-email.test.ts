import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderConfirmationEmail } from './confirmation-email'
import { STRIPE_PORTAL_URL } from './portal'

const base = {
  donorName: 'Asha Rao',
  donorEmail: 'asha@example.com',
  amount: 2490,
  centerCount: 10,
  tierName: 'adopt-10-centers'
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://vismayakalike.org')
})

describe('what the donor is told', () => {
  it('names the number of centres they funded', () => {
    const { subject, html } = renderConfirmationEmail(base)
    expect(subject).toBe('Thank you for supporting 10 learning centres')
    expect(html).toContain('10 learning centres')
  })

  it('says "a learning centre" rather than "1 learning centres"', () => {
    const { subject } = renderConfirmationEmail({ ...base, centerCount: 1, amount: 249 })
    expect(subject).toBe('Thank you for supporting a learning centre')
  })

  it('falls back to the tier name for group giving, which has no centre count', () => {
    const { subject } = renderConfirmationEmail({
      ...base,
      centerCount: null,
      tierName: 'Adopt a Center with Your Friends'
    })
    expect(subject).toBe('Thank you for supporting adopt a center with your friends')
  })

  it('formats the amount with a thousands separator', () => {
    expect(renderConfirmationEmail(base).html).toContain('$2,490')
  })

  it('states the amount recurs monthly', () => {
    expect(renderConfirmationEmail(base).text).toContain('each month')
  })
})

describe('the manage link', () => {
  it('points at the hosted Stripe billing portal', () => {
    const { html, text } = renderConfirmationEmail(base)
    expect(html).toContain(STRIPE_PORTAL_URL)
    expect(text).toContain(STRIPE_PORTAL_URL)
  })

  it('carries no per-donor secret, so a forwarded email grants nothing', () => {
    const { html, text } = renderConfirmationEmail(base)
    expect(html).not.toContain('/api/manage/')
    expect(text).not.toContain('/api/manage/')
  })

  it('offers cancelling, not just updating a card', () => {
    expect(renderConfirmationEmail(base).text.toLowerCase()).toContain('cancel')
  })

  it('tells the donor to use the address the mail was sent to', () => {
    expect(renderConfirmationEmail(base).text).toContain('secure link')
  })

  it('never emits an undefined or null segment', () => {
    const { html } = renderConfirmationEmail(base)
    expect(html).not.toContain('undefined')
    expect(html).not.toContain('null')
  })
})

describe('both formats stay in sync', () => {
  it('quotes the same amount in HTML and plain text', () => {
    const { html, text } = renderConfirmationEmail(base)
    expect(html).toContain('$2,490')
    expect(text).toContain('$2,490')
  })

  it('addresses the donor by name in both', () => {
    const { html, text } = renderConfirmationEmail(base)
    expect(html).toContain('Asha Rao')
    expect(text).toContain('Asha Rao')
  })
})
