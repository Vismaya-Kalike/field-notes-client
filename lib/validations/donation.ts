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

// Donor information form schema
export const donorInfoSchema = z.object({
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorEmail: z.string().email('Invalid email address'),
  donorPhone: phoneSchema,
  donorAddress: z.string().optional(),
  panNumber: z.string().transform((val) => val ? val.trim().replace(/\s/g, '').toUpperCase() : val).optional(),
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
