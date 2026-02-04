import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import type { Country, PaymentMethod } from '../types'

interface PaymentMethodSelectorProps {
  country: Country
  value: PaymentMethod
  onValueChange: (value: PaymentMethod) => void
}

export function PaymentMethodSelector({ country, value, onValueChange }: PaymentMethodSelectorProps) {
  const paymentMethods: { value: PaymentMethod; label: string; description?: string }[] = [
    {
      value: 'card',
      label: 'Credit/Debit Card',
      description: 'Secure online payment'
    },
    ...(country === 'india' ? [{
      value: 'upi' as PaymentMethod,
      label: 'UPI',
      description: 'Pay using UPI apps'
    }] : []),
    {
      value: 'bank_transfer',
      label: 'Bank Transfer',
      description: 'Direct bank account transfer'
    },
    {
      value: 'cheque',
      label: 'Cheque',
      description: 'Mail a cheque'
    },
    {
      value: 'employee_matching',
      label: 'Employee Matching',
      description: 'Through JoinDeed or Benevity'
    }
  ]

  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onValueChange(v as PaymentMethod)}
      className="space-y-3"
    >
      {paymentMethods.map((method) => (
        <div key={method.value} className="flex items-start space-x-3">
          <RadioGroupItem value={method.value} id={method.value} className="mt-1" />
          <div className="flex-1">
            <Label htmlFor={method.value} className="cursor-pointer font-medium">
              {method.label}
            </Label>
            {method.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
            )}
          </div>
        </div>
      ))}
    </RadioGroup>
  )
}
