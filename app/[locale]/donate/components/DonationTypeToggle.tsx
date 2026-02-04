import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import type { DonationType } from '../types'

interface DonationTypeToggleProps {
  value: DonationType
  onValueChange: (value: DonationType) => void
}

export function DonationTypeToggle({ value, onValueChange }: DonationTypeToggleProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onValueChange(v as DonationType)}
      className="flex gap-4"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="recurring" id="recurring" />
        <Label htmlFor="recurring" className="cursor-pointer">
          Recurring (Monthly)
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="onetime" id="onetime" />
        <Label htmlFor="onetime" className="cursor-pointer">
          One-time
        </Label>
      </div>
    </RadioGroup>
  )
}
