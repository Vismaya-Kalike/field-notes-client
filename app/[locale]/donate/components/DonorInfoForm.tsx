import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { donorInfoSchema, type DonorInfoFormData } from '@/lib/validations/donation'
import type { Country } from '../types'

interface DonorInfoFormProps {
  country: Country
  onSubmit: (data: DonorInfoFormData) => void
  onBack: () => void
}

export function DonorInfoForm({ country, onSubmit, onBack }: DonorInfoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<DonorInfoFormData>({
    resolver: zodResolver(donorInfoSchema)
  })

  const requiresPAN = country === 'india'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="donorName">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="donorName"
            {...register('donorName')}
            aria-invalid={!!errors.donorName}
          />
          {errors.donorName && (
            <p className="text-sm text-destructive">{errors.donorName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="donorEmail">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="donorEmail"
            type="email"
            {...register('donorEmail')}
            aria-invalid={!!errors.donorEmail}
          />
          {errors.donorEmail && (
            <p className="text-sm text-destructive">{errors.donorEmail.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="donorPhone">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="donorPhone"
            type="tel"
            placeholder="+91 1234567890"
            {...register('donorPhone')}
            aria-invalid={!!errors.donorPhone}
          />
          {errors.donorPhone && (
            <p className="text-sm text-destructive">{errors.donorPhone.message}</p>
          )}
          <p className="text-xs text-muted-foreground">Include country code (e.g., +91 for India or +1 for US)</p>
        </div>

        {requiresPAN && (
          <div className="space-y-2">
            <Label htmlFor="panNumber">
              PAN Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="panNumber"
              placeholder="ABCDE1234F"
              {...register('panNumber')}
              aria-invalid={!!errors.panNumber}
              className="uppercase"
              maxLength={15}
            />
            {errors.panNumber && (
              <p className="text-sm text-destructive">{errors.panNumber.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="donorAddress">
            Address
          </Label>
          <Textarea
            id="donorAddress"
            rows={3}
            placeholder="Your mailing address"
            {...register('donorAddress')}
            aria-invalid={!!errors.donorAddress}
          />
          {errors.donorAddress && (
            <p className="text-sm text-destructive">{errors.donorAddress.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Processing...' : 'Continue to Payment'}
        </Button>
      </div>
    </form>
  )
}
