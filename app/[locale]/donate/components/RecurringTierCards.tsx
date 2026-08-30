import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { Country, RecurringTier } from '../types'
import { cn } from '@/lib/utils'

interface RecurringTierCardsProps {
  country: Country
  selectedTier: RecurringTier | null
  onSelectTier: (tier: RecurringTier) => void
  customAmount: number | null
  onCustomAmountChange: (amount: number | null) => void
}

const TIERS = [
  {
    id: 'adopt-center',
    name: 'Adopt a Learning Center',
    amountINR: 25000,
    amountUSD: 249,
    description: 'Support all costs for a complete learning center'
  },
  {
    id: 'third-center',
    name: 'Support 1/3rd of a Center',
    amountINR: 8333,
    amountUSD: 83,
    description: 'Cover one-third of monthly center operations'
  },
  {
    id: 'facilitator',
    name: 'Support Facilitator Cost',
    amountINR: 5000,
    amountUSD: 60,
    description: 'Fund a facilitator\'s monthly stipend'
  },
  {
    id: 'fixed-monthly',
    name: 'Contribute Fixed Sum Monthly',
    amountINR: 2500,
    amountUSD: 30,
    description: 'Regular monthly contribution'
  },
  {
    id: 'stationery',
    name: 'Stationery for a Center',
    amountINR: 1000,
    amountUSD: 12,
    description: 'Provide books, materials, and supplies'
  }
]

export function RecurringTierCards({
  country,
  selectedTier,
  onSelectTier,
  customAmount,
  onCustomAmountChange
}: RecurringTierCardsProps) {
  const [isCustomSelected, setIsCustomSelected] = useState(false)
  const currencySymbol = country === 'india' ? '₹' : '$'

  const formatAmount = (tier: typeof TIERS[0]): string => {
    if (country === 'india') {
      return `₹${tier.amountINR.toLocaleString('en-IN')}`
    }
    return `$${tier.amountUSD.toLocaleString('en-US')}`
  }

  const handleTierClick = (tier: typeof TIERS[0]) => {
    setIsCustomSelected(false)
    onCustomAmountChange(null)
    // Pass the tier with the correct amount for the country
    onSelectTier({
      id: tier.id,
      name: tier.name,
      amount: country === 'india' ? tier.amountINR : tier.amountUSD,
      description: tier.description
    })
  }

  const handleCustomClick = () => {
    setIsCustomSelected(true)
    onSelectTier({
      id: 'custom',
      name: 'Custom Amount',
      amount: customAmount || 0
    })
  }

  const handleCustomAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      onCustomAmountChange(null)
      return
    }
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      onCustomAmountChange(numValue)
      onSelectTier({
        id: 'custom',
        name: 'Custom Amount',
        amount: numValue
      })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {TIERS.map((tier) => {
        const isSelected = selectedTier?.id === tier.id && !isCustomSelected
        return (
          <Card
            key={tier.id}
            className={cn(
              'py-3 gap-2 cursor-pointer transition-all hover:shadow-md',
              isSelected && 'border-2 border-coral bg-coral/15 shadow-lg ring-2 ring-coral/30 dark:border-turquoise dark:bg-turquoise/10 dark:ring-turquoise/30'
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
                {formatAmount(tier)} / month
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

      {/* Custom Amount Card */}
      <Card
        className={cn(
          'py-3 gap-2 cursor-pointer transition-all hover:shadow-md',
          isCustomSelected && 'border-2 border-coral bg-coral/15 shadow-lg ring-2 ring-coral/30 dark:border-turquoise dark:bg-turquoise/10 dark:ring-turquoise/30'
        )}
        onClick={handleCustomClick}
      >
        <CardHeader className="px-4 gap-1">
          <CardTitle className={cn('text-base', isCustomSelected && 'text-coral dark:text-turquoise')}>
            Custom Amount
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
              placeholder={country === 'india' ? '2500' : '75'}
              value={customAmount ?? ''}
              onChange={handleCustomAmountInput}
              onClick={(e) => {
                e.stopPropagation()
                handleCustomClick()
              }}
              className={cn('pl-8', isCustomSelected && 'border-coral dark:border-turquoise focus-visible:ring-coral dark:focus-visible:ring-turquoise')}
            />
          </div>
          <p className={cn('text-xs', isCustomSelected ? 'text-foreground/70' : 'text-muted-foreground')}>
            Enter your preferred monthly amount
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
