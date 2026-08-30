import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { Country, RecurringTier } from '../types'
import {
  CUSTOM_TIER_ID,
  GROUP_TIER_ID,
  US_CENTER_MONTHLY_USD,
  getTiers,
  type TierDefinition
} from '@/lib/donations/tiers'
import { cn } from '@/lib/utils'

interface RecurringTierCardsProps {
  country: Country
  selectedTier: RecurringTier | null
  onSelectTier: (tier: RecurringTier) => void
  customAmount: number | null
  onCustomAmountChange: (amount: number | null) => void
}

const selectedCardStyles =
  'border-2 border-coral bg-coral/15 shadow-lg ring-2 ring-coral/30 dark:border-turquoise dark:bg-turquoise/10 dark:ring-turquoise/30'

export function RecurringTierCards({
  country,
  selectedTier,
  onSelectTier,
  customAmount,
  onCustomAmountChange
}: RecurringTierCardsProps) {
  const tiers = getTiers(country)
  const isUS = country === 'us'
  const currencySymbol = isUS ? '$' : '₹'
  const locale = isUS ? 'en-US' : 'en-IN'

  const customTierId = isUS ? GROUP_TIER_ID : CUSTOM_TIER_ID
  const isCustomSelected = selectedTier?.id === customTierId

  const selectCustomTier = (amount: number | null) => {
    onSelectTier({
      id: customTierId,
      name: isUS ? 'Adopt a Center with Your Friends' : 'Custom Amount',
      amount: amount ?? 0
    })
  }

  const handleTierClick = (tier: TierDefinition) => {
    onCustomAmountChange(null)
    onSelectTier(tier)
  }

  const handleCustomAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      onCustomAmountChange(null)
      selectCustomTier(null)
      return
    }

    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      onCustomAmountChange(numValue)
      selectCustomTier(numValue)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tiers.map((tier) => {
        const isSelected = selectedTier?.id === tier.id
        return (
          <Card
            key={tier.id}
            className={cn(
              'py-3 gap-2 cursor-pointer transition-all hover:shadow-md',
              isSelected && selectedCardStyles
            )}
            onClick={() => handleTierClick(tier)}
          >
            <CardHeader className="px-4 gap-1">
              <CardTitle className={cn('text-base', isSelected && 'text-coral dark:text-turquoise')}>
                {tier.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 space-y-1">
              <p className={cn('text-sm font-medium', isSelected && 'text-coral dark:text-turquoise')}>
                {currencySymbol}{tier.amount.toLocaleString(locale)} / month
              </p>
              {tier.description && (
                <p className={cn('text-xs', isSelected ? 'text-foreground/70' : 'text-muted-foreground')}>
                  {tier.description}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}

      <Card
        className={cn(
          'py-3 gap-2 cursor-pointer transition-all hover:shadow-md',
          isCustomSelected && selectedCardStyles
        )}
        onClick={() => selectCustomTier(customAmount)}
      >
        <CardHeader className="px-4 gap-1">
          <CardTitle className={cn('text-base', isCustomSelected && 'text-coral dark:text-turquoise')}>
            {isUS ? 'Adopt a Center with Your Friends' : 'Custom Amount'}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 space-y-2">
          <div className="relative">
            <span className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 text-sm',
              isCustomSelected ? 'text-coral dark:text-turquoise' : 'text-muted-foreground'
            )}>
              {currencySymbol}
            </span>
            <Input
              type="number"
              min="1"
              step="1"
              placeholder={isUS ? String(US_CENTER_MONTHLY_USD) : '2500'}
              value={customAmount ?? ''}
              onChange={handleCustomAmountInput}
              onClick={(e) => {
                e.stopPropagation()
                selectCustomTier(customAmount)
              }}
              className={cn('pl-8', isCustomSelected && 'border-coral dark:border-turquoise focus-visible:ring-coral dark:focus-visible:ring-turquoise')}
            />
          </div>
          <p className={cn('text-xs', isCustomSelected ? 'text-foreground/70' : 'text-muted-foreground')}>
            {isUS
              ? 'Split the cost of a center with friends. Add their details at the next step — or leave it to us and we\'ll match you with other donors.'
              : 'Enter your preferred monthly amount'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
