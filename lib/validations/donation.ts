import { z } from 'zod'
import { parsePhoneNumber } from 'libphonenumber-js'

// Phone number validation helper
const phoneSchema = z.string().refine(
  (value) => {
    try {
      const phoneNumber = parsePhoneNumber(value)
      return phoneNumber.isValid()
    } catch {
      return false
    }
  },
  { message: 'Invalid phone number format' }
)

// PAN number validation (India only): 5 letters + 4 digits + 1 letter
const panSchema = z.string().transform((val) => val.trim().replace(/\s/g, '')).pipe(
  z.string().regex(
    /^[A-Z]{5}[0-9]{4}[A-Z]$/,
    'PAN must be in format: ABCDE1234F (5 letters + 4 digits + 1 letter)'
  )
)

// A friend row as the form holds it, before empty rows are discarded
const friendRowInputSchema = z.object({
  name: z.string(),
  email: z.string(),
})

// A friend row that survived stripping, and so must be complete
const friendRowSchema = z.object({
  name: z.string().trim().min(1, 'Friend name is required'),
  email: z.string().trim().email('Invalid email address'),
})

export type FriendRow = z.infer<typeof friendRowInputSchema>

export function isEmptyFriendRow(row: FriendRow): boolean {
  return row.name.trim() === '' && row.email.trim() === ''
}

export function stripEmptyFriends(rows: FriendRow[] | undefined): FriendRow[] {
  return (rows ?? []).filter((row) => !isEmptyFriendRow(row))
}

// Form variant: no transform, so react-hook-form's input and output types match and
// useFieldArray can keep rendering blank rows. Untouched rows are ignored; a row with
// only one side filled in reports against that specific field.
const friendsFormSchema = z
  .array(friendRowInputSchema)
  .optional()
  .superRefine((rows, ctx) => {
    rows?.forEach((row, index) => {
      if (isEmptyFriendRow(row)) return

      if (row.name.trim() === '') {
        ctx.addIssue({
          code: 'custom',
          message: 'Friend name is required',
          path: [index, 'name'],
        })
      }
      if (!friendRowSchema.shape.email.safeParse(row.email).success) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid email address',
          path: [index, 'email'],
        })
      }
    })
  })

// Request variant: discards empty rows outright, then holds the rest to the full rules
const friendsRequestSchema = z
  .array(friendRowInputSchema)
  .optional()
  .transform(stripEmptyFriends)
  .pipe(z.array(friendRowSchema))

// Donor information form schema
export const donorInfoSchema = z.object({
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorEmail: z.string().email('Invalid email address'),
  donorPhone: phoneSchema,
  donorAddress: z.string().optional(),
  panNumber: z.string().transform((val) => val ? val.trim().replace(/\s/g, '').toUpperCase() : val).optional(),
  friends: friendsFormSchema,
})

// Full donation request schema
export const donationRequestSchema = z.object({
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorEmail: z.string().email('Invalid email address'),
  donorPhone: phoneSchema,
  donorAddress: z.string().optional(),
  panNumber: z.string().transform((val) => val ? val.trim().replace(/\s/g, '').toUpperCase() : val).optional(),
  country: z.enum(['india', 'us']),
  donationType: z.enum(['recurring', 'onetime']),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['card', 'upi', 'bank_transfer', 'cheque', 'employee_matching']),
  recurringTier: z.string().optional(),
  friends: friendsRequestSchema,
}).refine(
  (data) => {
    // If donation type is recurring, recurringTier is required
    if (data.donationType === 'recurring') {
      return data.recurringTier !== undefined && data.recurringTier !== ''
    }
    return true
  },
  {
    message: 'Recurring tier is required for recurring donations',
    path: ['recurringTier'],
  }
).refine(
  (data) => {
    // Cheque payments require address
    if (data.paymentMethod === 'cheque') {
      return data.donorAddress !== undefined && data.donorAddress !== ''
    }
    return true
  },
  {
    message: 'Address is required for cheque payments',
    path: ['donorAddress'],
  }
).refine(
  (data) => {
    // India donations require PAN number
    if (data.country === 'india') {
      if (!data.panNumber) return false
      const trimmedPan = data.panNumber.trim().replace(/\s/g, '')
      return panSchema.safeParse(trimmedPan).success
    }
    return true
  },
  {
    message: 'PAN number is required for India donations and must be in format: ABCDE1234F',
    path: ['panNumber'],
  }
)

// Razorpay order creation schema
export const razorpayOrderSchema = z.object({
  amount: z.number().positive(),
  donationId: z.string().uuid(),
})

// Stripe intent creation schema
export const stripeIntentSchema = z.object({
  amount: z.number().positive(),
  donationId: z.string().uuid(),
  donorEmail: z.string().email(),
})

// Type exports for TypeScript
export type DonorInfoFormData = z.infer<typeof donorInfoSchema>
export type DonationRequestData = z.infer<typeof donationRequestSchema>
export type RazorpayOrderData = z.infer<typeof razorpayOrderSchema>
export type StripeIntentData = z.infer<typeof stripeIntentSchema>
