// Type definitions for donation page

export type Country = 'india' | 'us'
export type DonationType = 'recurring' | 'onetime'
export type PaymentMethod = 'card' | 'upi' | 'bank_transfer' | 'cheque' | 'employee_matching'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
export type Currency = 'INR' | 'USD'
export type FlowStep = 'amount' | 'payment' | 'donor_info' | 'checkout'

export interface RecurringTier {
  id: string
  name: string
  amount: number
  description?: string
  centerCount?: number
}

export interface GroupMember {
  name: string
  email: string
}

export interface DonationFormData {
  donorName: string
  donorEmail: string
  donorPhone: string
  donorAddress?: string
  panNumber?: string
}

export interface DonationRequest {
  donorName: string
  donorEmail: string
  donorPhone: string
  donorAddress?: string
  panNumber?: string
  country: Country
  donationType: DonationType
  amount: number
  paymentMethod: PaymentMethod
  recurringTier?: string
  friends?: GroupMember[]
}

export interface DonationResponse {
  donationId: string
  amount: number
  currency: Currency
}

export interface RazorpayOrderRequest {
  amount: number
  donationId: string
}

export interface RazorpayOrderResponse {
  orderId: string
  keyId: string
}

export interface StripeIntentRequest {
  amount: number
  donationId: string
  donorEmail: string
}

export interface StripeIntentResponse {
  clientSecret: string
  publishableKey: string
}

export interface Donation {
  id: string
  donor_name: string
  donor_email: string
  donor_phone: string | null
  donor_address: string | null
  pan_number: string | null
  country: Country
  organization: string
  donation_type: DonationType
  recurring_tier: string | null
  center_count: number | null
  group_members: GroupMember[] | null
  amount: number
  currency: Currency
  payment_method: PaymentMethod
  payment_gateway: string | null
  payment_gateway_id: string | null
  payment_status: PaymentStatus
  created_at: string
  completed_at: string | null
  cancelled_at: string | null
}
