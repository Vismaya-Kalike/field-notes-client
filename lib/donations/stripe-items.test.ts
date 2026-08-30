import { describe, expect, it } from 'vitest'
import { buildSubscriptionItem } from './stripe-items'
import { GROUP_TIER_ID, US_CENTER_MONTHLY_USD } from './tiers'

const PRODUCT = 'prod_test'
const CENTER_PRICE = 'price_center_249'

const build = (tierId: string, amount: number, centerPriceId?: string) =>
  buildSubscriptionItem({
    tierId,
    amount,
    donationProductId: PRODUCT,
    centerPriceId
  })

describe('centre tiers with a shared price', () => {
  it('bills 10 centres as quantity 10 of the per-centre price', () => {
    expect(build('adopt-10-centers', 2490, CENTER_PRICE)).toEqual({
      price: CENTER_PRICE,
      quantity: 10
    })
  })

  it('maps each tier to its centre count', () => {
    const quantities = ['adopt-center', 'adopt-3-centers', 'adopt-5-centers', 'adopt-10-centers']
      .map((tierId) => build(tierId, 0, CENTER_PRICE).quantity)

    expect(quantities).toEqual([1, 3, 5, 10])
  })
})

describe('centre tiers without a shared price', () => {
  it('falls back to an inline price at the same per-centre rate', () => {
    expect(build('adopt-10-centers', 2490)).toEqual({
      price_data: {
        currency: 'usd',
        product: PRODUCT,
        recurring: { interval: 'month' },
        unit_amount: 24900
      },
      quantity: 10
    })
  })

  it('bills the same total either way', () => {
    const withPrice = build('adopt-10-centers', 2490, CENTER_PRICE)
    const withoutPrice = build('adopt-10-centers', 2490)

    const fallbackTotal =
      (withoutPrice.price_data!.unit_amount! * withoutPrice.quantity!) / 100

    expect(withPrice.quantity).toBe(withoutPrice.quantity)
    expect(fallbackTotal).toBe(US_CENTER_MONTHLY_USD * 10)
  })
})

describe('group giving', () => {
  it('uses an inline price at quantity 1 for a custom amount', () => {
    expect(build(GROUP_TIER_ID, 400, CENTER_PRICE)).toEqual({
      price_data: {
        currency: 'usd',
        product: PRODUCT,
        recurring: { interval: 'month' },
        unit_amount: 40000
      },
      quantity: 1
    })
  })

  it('rejects an amount below the minimum', () => {
    expect(() => build(GROUP_TIER_ID, 0)).toThrow(/Custom amount/)
  })

  it('rejects an amount above the ceiling', () => {
    expect(() => build(GROUP_TIER_ID, 50_001)).toThrow(/Custom amount/)
  })
})

describe('unknown tiers', () => {
  it('throws rather than billing an arbitrary amount', () => {
    expect(() => build('not-a-tier', 999, CENTER_PRICE)).toThrow(/Unknown US recurring tier/)
  })

  it('refuses an India-only tier, which Stripe never bills', () => {
    expect(() => build('stationery', 1000, CENTER_PRICE)).toThrow(/Unknown US recurring tier/)
  })
})
