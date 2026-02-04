import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Country } from '../types'

interface OneTimeAmountButtonsProps {
  country: Country
  selectedAmount: number | null
  onSelectAmount: (amount: number) => void
  customAmount: number | null
  onCustomAmountChange: (amount: number | null) => void
}

const INDIA_AMOUNTS = [1000, 5000, 10000, 25000, 50000]
const US_AMOUNTS = [50, 100, 250, 500, 1000]

export function OneTimeAmountButtons({
  country,
  selectedAmount,
  onSelectAmount,
  customAmount,
  onCustomAmountChange
}: OneTimeAmountButtonsProps) {
  const [isCustomSelected, setIsCustomSelected] = useState(false)
  const amounts = country === 'india' ? INDIA_AMOUNTS : US_AMOUNTS
  const currencySymbol = country === 'india' ? '₹' : '$'

  const handleAmountClick = (amount: number) => {
    setIsCustomSelected(false)
    onCustomAmountChange(null)
    onSelectAmount(amount)
  }

  const handleCustomClick = () => {
    setIsCustomSelected(true)
    onSelectAmount(customAmount || 0)
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
      onSelectAmount(numValue)
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {amounts.map((amount) => {
        const isSelected = selectedAmount === amount && !isCustomSelected
        return (
          <Card
            key={amount}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              isSelected && 'border-2 border-coral bg-coral/15 shadow-lg ring-2 ring-coral/30 dark:border-turquoise dark:bg-turquoise/10 dark:ring-turquoise/30'
            )}
            onClick={() => handleAmountClick(amount)}
          >
            <CardContent className="flex items-center justify-center py-6">
              <p className={cn('text-lg font-semibold', isSelected && 'text-coral dark:text-turquoise')}>
                {currencySymbol}{amount.toLocaleString(country === 'india' ? 'en-IN' : 'en-US')}
              </p>
            </CardContent>
          </Card>
        )
      })}

      {/* Custom Amount Card */}
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          isCustomSelected && 'border-2 border-coral bg-coral/15 shadow-lg ring-2 ring-coral/30 dark:border-turquoise dark:bg-turquoise/10 dark:ring-turquoise/30'
        )}
        onClick={handleCustomClick}
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
              placeholder={country === 'india' ? '2000' : '75'}
              value={customAmount ?? ''}
              onChange={handleCustomAmountInput}
              onClick={(e) => {
                e.stopPropagation()
                handleCustomClick()
              }}
              className={cn('pl-8 h-9 text-sm', isCustomSelected && 'border-coral dark:border-turquoise focus-visible:ring-coral dark:focus-visible:ring-turquoise')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
