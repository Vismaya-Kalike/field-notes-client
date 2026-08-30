import type Stripe from 'stripe'
import {
  CUSTOM_AMOUNT_MAX,
  CUSTOM_AMOUNT_MIN,
  US_CENTER_MONTHLY_USD,
  getTierById,
  isCustomAmountValid,
  isCustomTierId
} from './tiers'

export interface SubscriptionItemInput {
  tierId: string
  amount: number
  donationProductId: string
  centerPriceId?: string
}

function inlinePrice(
  unitAmountUsd: number,
  donationProductId: string
): Stripe.SubscriptionCreateParams.Item.PriceData {
  return {
    currency: 'usd',
    product: donationProductId,
    recurring: { interval: 'month' },
    unit_amount: Math.round(unitAmountUsd * 100)
  }
}

/**
 * Builds the Stripe subscription item for a US recurring donation.
 *
 * Center tiers bill as `quantity` units of a single per-center price, so Stripe can
 * aggregate total centers sponsored across all subscriptions. When no shared price is
 * configured the item falls back to an inline price at the same per-center rate, which
 * bills an identical total and only forgoes that aggregation.
 */
export function buildSubscriptionItem({
  tierId,
  amount,
  donationProductId,
  centerPriceId
}: SubscriptionItemInput): Stripe.SubscriptionCreateParams.Item {
  if (isCustomTierId(tierId)) {
    if (!isCustomAmountValid('us', amount)) {
      throw new Error(
        `Custom amount must be between ${CUSTOM_AMOUNT_MIN} and ${CUSTOM_AMOUNT_MAX.us}`
      )
    }
    return {
      price_data: inlinePrice(amount, donationProductId),
      quantity: 1
    }
  }

  const tier = getTierById('us', tierId)
  if (!tier?.centerCount) {
    throw new Error(`Unknown US recurring tier "${tierId}"`)
  }

  if (centerPriceId) {
    return { price: centerPriceId, quantity: tier.centerCount }
  }

  return {
    price_data: inlinePrice(US_CENTER_MONTHLY_USD, donationProductId),
    quantity: tier.centerCount
  }
}
