import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getOneTimeAmounts } from '@/lib/donations/tiers'
import type { Country } from '../types'

interface OneTimeAmountButtonsProps {
  country: Country
  selectedAmount: number | null
  onSelectAmount: (amount: number) => void
  customAmount: number | null
  onCustomAmountChange: (amount: number | null) => void
}

const selectedCardStyles =
  'border-2 border-coral bg-coral/15 shadow-lg ring-2 ring-coral/30 dark:border-turquoise dark:bg-turquoise/10 dark:ring-turquoise/30'

export function OneTimeAmountButtons({
  country,
  selectedAmount,
  onSelectAmount,
  customAmount,
  onCustomAmountChange
}: OneTimeAmountButtonsProps) {
  const amounts = getOneTimeAmounts(country)
  const isUS = country === 'us'
  const currencySymbol = isUS ? '$' : '₹'
  const locale = isUS ? 'en-US' : 'en-IN'

  const isCustomSelected = customAmount !== null

  const handleAmountClick = (amount: number) => {
    onCustomAmountChange(null)
    onSelectAmount(amount)
  }

  const handleCustomAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      onCustomAmountChange(null)
      onSelectAmount(0)
      return
    }

    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      onCustomAmountChange(numValue)
      onSelectAmount(numValue)
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {amounts.map(({ amount, label }) => {
        const isSelected = selectedAmount === amount && !isCustomSelected
        return (
          <Card
            key={amount}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              isSelected && selectedCardStyles
            )}
            onClick={() => handleAmountClick(amount)}
          >
            <CardContent className="flex flex-col items-center justify-center gap-1 py-6">
              <p className={cn('text-lg font-semibold', isSelected && 'text-coral dark:text-turquoise')}>
                {currencySymbol}{amount.toLocaleString(locale)}
              </p>
              {label && (
                <p className={cn('text-xs text-center', isSelected ? 'text-foreground/70' : 'text-muted-foreground')}>
                  {label}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}

      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          isCustomSelected && selectedCardStyles
        )}
        onClick={() => customAmount !== null && onSelectAmount(customAmount)}
      >
        <CardContent className="py-3 space-y-2">
          <p className={cn('text-xs font-medium', isCustomSelected && 'text-coral dark:text-turquoise')}>
            Custom Amount
          </p>
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
              placeholder="2000"
              value={customAmount ?? ''}
              onChange={handleCustomAmountInput}
              onClick={(e) => e.stopPropagation()}
              className={cn('pl-8 h-9 text-sm', isCustomSelected && 'border-coral dark:border-turquoise focus-visible:ring-coral dark:focus-visible:ring-turquoise')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
