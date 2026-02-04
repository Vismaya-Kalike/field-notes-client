import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Country } from '../types'

interface CustomAmountInputProps {
  country: Country
  value: number | null
  onChange: (value: number | null) => void
}

export function CustomAmountInput({ country, value, onChange }: CustomAmountInputProps) {
  const currencySymbol = country === 'india' ? '₹' : '$'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (inputValue === '') {
      onChange(null)
      return
    }
    const numValue = parseFloat(inputValue)
    if (!isNaN(numValue) && numValue > 0) {
      onChange(numValue)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="custom-amount">Enter custom amount</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {currencySymbol}
        </span>
        <Input
          id="custom-amount"
          type="number"
          min="1"
          step="1"
          placeholder={country === 'india' ? '2500' : '75'}
          value={value ?? ''}
          onChange={handleChange}
          className="pl-8"
        />
      </div>
    </div>
  )
}
