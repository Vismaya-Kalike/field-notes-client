import { describe, expect, it } from 'vitest'
import {
  CUSTOM_AMOUNT_MAX,
  GROUP_TIER_ID,
  INDIA_TIERS,
  US_CENTER_MONTHLY_USD,
  US_ONETIME_AMOUNTS,
  US_TIERS,
  deriveAmount,
  getTierById,
  isCustomAmountValid,
  isCustomTierId,
  resolveAmount
} from './tiers'

describe('US centre tiers', () => {
  it('bills 10 centres at ten times the per-centre rate', () => {
    expect(deriveAmount('us', 'adopt-10-centers')).toBe(2490)
  })

  it('derives every tier amount from its centre count', () => {
    for (const tier of US_TIERS) {
      expect(tier.centerCount).toBeGreaterThan(0)
      expect(tier.amount).toBe(tier.centerCount! * US_CENTER_MONTHLY_USD)
    }
  })

  it('offers exactly the 1, 3, 5 and 10 centre tiers', () => {
    expect(US_TIERS.map((tier) => tier.centerCount)).toEqual([1, 3, 5, 10])
    expect(US_TIERS.map((tier) => tier.amount)).toEqual([249, 747, 1245, 2490])
  })

  it('keeps the existing tier id for a single centre', () => {
    expect(getTierById('us', 'adopt-center')?.centerCount).toBe(1)
  })
})

describe('India tiers', () => {
  it('are unchanged by the US restructure', () => {
    expect(INDIA_TIERS.map((tier) => tier.id)).toEqual([
      'adopt-center',
      'third-center',
      'facilitator',
      'fixed-monthly',
      'stationery'
    ])
    expect(INDIA_TIERS.map((tier) => tier.amount)).toEqual([25000, 8333, 5000, 2500, 1000])
  })

  it('carry no centre count, so they never bill by quantity', () => {
    for (const tier of INDIA_TIERS) {
      expect(tier.centerCount).toBeUndefined()
    }
  })
})

describe('deriveAmount', () => {
  it('throws on an unknown tier rather than silently returning zero', () => {
    expect(() => deriveAmount('us', 'not-a-tier')).toThrow(/Unknown donation tier/)
  })

  it('throws when a US tier id is requested for India', () => {
    expect(() => deriveAmount('india', 'adopt-10-centers')).toThrow(/Unknown donation tier/)
  })
})

describe('custom amounts', () => {
  it('recognises both the plain custom and group tier ids', () => {
    expect(isCustomTierId('custom')).toBe(true)
    expect(isCustomTierId(GROUP_TIER_ID)).toBe(true)
    expect(isCustomTierId('adopt-5-centers')).toBe(false)
  })

  it('bounds US amounts to the US ceiling', () => {
    expect(isCustomAmountValid('us', 249)).toBe(true)
    expect(isCustomAmountValid('us', 0)).toBe(false)
    expect(isCustomAmountValid('us', CUSTOM_AMOUNT_MAX.us + 1)).toBe(false)
  })

  it('allows rupee amounts that would exceed the US ceiling', () => {
    expect(isCustomAmountValid('india', 100_000)).toBe(true)
    expect(isCustomAmountValid('india', CUSTOM_AMOUNT_MAX.india + 1)).toBe(false)
  })

  it('rejects NaN', () => {
    expect(isCustomAmountValid('us', Number.NaN)).toBe(false)
  })
})

describe('resolveAmount', () => {
  it('ignores the requested amount for a fixed tier', () => {
    expect(resolveAmount('us', 'adopt-10-centers', 1)).toBe(2490)
  })

  it('honours the requested amount for the group tier', () => {
    expect(resolveAmount('us', GROUP_TIER_ID, 400)).toBe(400)
  })

  it('rejects an out-of-bounds group amount', () => {
    expect(() => resolveAmount('us', GROUP_TIER_ID, 500_000)).toThrow(/Custom amount/)
  })
})

describe('US one-time ladder', () => {
  it('runs from $1,000 to $25,000', () => {
    expect(US_ONETIME_AMOUNTS.map((rung) => rung.amount)).toEqual([
      1000, 3000, 6000, 15000, 25000
    ])
  })

  it('labels only the rung that funds a centre for a year', () => {
    const labelled = US_ONETIME_AMOUNTS.filter((rung) => rung.label)
    expect(labelled).toHaveLength(1)
    expect(labelled[0].amount).toBe(3000)
  })

  it('covers a full year of one centre at the labelled rung', () => {
    const labelled = US_ONETIME_AMOUNTS.find((rung) => rung.label)!
    expect(labelled.amount).toBeGreaterThanOrEqual(US_CENTER_MONTHLY_USD * 12)
  })
})
