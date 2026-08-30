import type { Country } from '@/app/[locale]/donate/types'

export const US_CENTER_MONTHLY_USD = 249

export const CUSTOM_AMOUNT_MIN = 1

// Sanity ceilings, in each country's own currency. These exist to stop a typo or a
// tampered request creating an absurd charge, not to cap generosity.
export const CUSTOM_AMOUNT_MAX: Record<Country, number> = {
  us: 50_000,
  india: 5_000_000
}

export const GROUP_TIER_ID = 'adopt-with-friends'
export const CUSTOM_TIER_ID = 'custom'

export interface TierDefinition {
  id: string
  name: string
  amount: number
  description?: string
  centerCount?: number
}

export interface OneTimeAmount {
  amount: number
  label?: string
}

function centerTier(
  id: string,
  name: string,
  centerCount: number,
  description: string
): TierDefinition {
  return {
    id,
    name,
    centerCount,
    amount: centerCount * US_CENTER_MONTHLY_USD,
    description
  }
}

export const US_TIERS: TierDefinition[] = [
  centerTier(
    'adopt-center',
    'Adopt 1 Learning Center',
    1,
    'Support all costs for a complete learning center'
  ),
  centerTier(
    'adopt-3-centers',
    'Adopt 3 Learning Centers',
    3,
    'Fund three centers every month'
  ),
  centerTier(
    'adopt-5-centers',
    'Adopt 5 Learning Centers',
    5,
    'Fund five centers every month'
  ),
  centerTier(
    'adopt-10-centers',
    'Adopt 10 Learning Centers',
    10,
    'Fund ten centers every month'
  )
]

export const INDIA_TIERS: TierDefinition[] = [
  {
    id: 'adopt-center',
    name: 'Adopt a Learning Center',
    amount: 25000,
    description: 'Support all costs for a complete learning center'
  },
  {
    id: 'third-center',
    name: 'Support 1/3rd of a Center',
    amount: 8333,
    description: 'Cover one-third of monthly center operations'
  },
  {
    id: 'facilitator',
    name: 'Support Facilitator Cost',
    amount: 5000,
    description: 'Fund a facilitator\'s monthly stipend'
  },
  {
    id: 'fixed-monthly',
    name: 'Contribute Fixed Sum Monthly',
    amount: 2500,
    description: 'Regular monthly contribution'
  },
  {
    id: 'stationery',
    name: 'Stationery for a Center',
    amount: 1000,
    description: 'Provide books, materials, and supplies'
  }
]

export const INDIA_ONETIME_AMOUNTS: OneTimeAmount[] = [
  { amount: 1000 },
  { amount: 5000 },
  { amount: 10000 },
  { amount: 25000 },
  { amount: 50000 }
]

export const US_ONETIME_AMOUNTS: OneTimeAmount[] = [
  { amount: 1000 },
  { amount: 3000, label: 'Funds a center for a year' },
  { amount: 6000 },
  { amount: 15000 },
  { amount: 25000 }
]

export function getTiers(country: Country): TierDefinition[] {
  return country === 'india' ? INDIA_TIERS : US_TIERS
}

export function getOneTimeAmounts(country: Country): OneTimeAmount[] {
  return country === 'india' ? INDIA_ONETIME_AMOUNTS : US_ONETIME_AMOUNTS
}

export function getTierById(country: Country, tierId: string): TierDefinition | undefined {
  return getTiers(country).find((tier) => tier.id === tierId)
}

export function isCustomTierId(tierId: string): boolean {
  return tierId === CUSTOM_TIER_ID || tierId === GROUP_TIER_ID
}

export function isCustomAmountValid(country: Country, amount: number): boolean {
  return (
    Number.isFinite(amount) &&
    amount >= CUSTOM_AMOUNT_MIN &&
    amount <= CUSTOM_AMOUNT_MAX[country]
  )
}

export function deriveAmount(country: Country, tierId: string): number {
  const tier = getTierById(country, tierId)
  if (!tier) {
    throw new Error(`Unknown donation tier "${tierId}" for country "${country}"`)
  }
  return tier.amount
}

/**
 * Server-side authority on what a donation costs. Amounts for fixed tiers come from
 * the tier table, never from the request body; only custom tiers may name their own
 * amount, and only within bounds.
 */
export function resolveAmount(
  country: Country,
  tierId: string,
  requestedAmount: number
): number {
  if (isCustomTierId(tierId)) {
    if (!isCustomAmountValid(country, requestedAmount)) {
      throw new Error(
        `Custom amount must be between ${CUSTOM_AMOUNT_MIN} and ${CUSTOM_AMOUNT_MAX[country]}`
      )
    }
    return requestedAmount
  }
  return deriveAmount(country, tierId)
}
