import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { donorInfoSchema, type DonorInfoFormData } from '@/lib/validations/donation'
import { GROUP_TIER_ID } from '@/lib/donations/tiers'
import type { Country } from '../types'

interface DonorInfoFormProps {
  country: Country
  tierId?: string
  onSubmit: (data: DonorInfoFormData) => void
  onBack: () => void
}

const emptyFriendRow = { name: '', email: '' }

export function DonorInfoForm({ country, tierId, onSubmit, onBack }: DonorInfoFormProps) {
  const collectsFriends = country === 'us' && tierId === GROUP_TIER_ID

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<DonorInfoFormData>({
    resolver: zodResolver(donorInfoSchema),
    defaultValues: {
      friends: collectsFriends ? [emptyFriendRow, emptyFriendRow] : []
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'friends' })

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

        {collectsFriends && (
          <div className="space-y-3 rounded-lg border p-4">
            <div className="space-y-1">
              <Label>Friends joining you</Label>
              <p className="text-xs text-muted-foreground">
                Don&apos;t have a group yet? Leave this blank and we&apos;ll match you with
                other donors adopting a center.
              </p>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder="Name"
                      aria-label={`Friend ${index + 1} name`}
                      {...register(`friends.${index}.name`)}
                      aria-invalid={!!errors.friends?.[index]?.name}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Input
                      type="email"
                      placeholder="Email"
                      aria-label={`Friend ${index + 1} email`}
                      {...register(`friends.${index}.email`)}
                      aria-invalid={!!errors.friends?.[index]?.email}
                    />
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove friend ${index + 1}`}
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {(errors.friends?.[index]?.name || errors.friends?.[index]?.email) && (
                  <p className="text-sm text-destructive">
                    {errors.friends[index]?.name?.message ??
                      errors.friends[index]?.email?.message}
                  </p>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(emptyFriendRow)}
            >
              + Add another
            </Button>
          </div>
        )}
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
