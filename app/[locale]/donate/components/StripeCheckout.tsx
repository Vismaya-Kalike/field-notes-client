'use client'

import { useState, useEffect, useRef } from 'react'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import type { DonorInfoFormData } from '@/lib/validations/donation'

interface CheckoutFormProps {
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
}

function CheckoutForm({ amount, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/donate/success`
      },
      redirect: 'if_required'
    })

    setProcessing(false)

    if (error) {
      onError(error.message || 'Payment failed')
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || processing} className="w-full">
        {processing ? 'Processing...' : `Donate $${amount.toLocaleString('en-US')}`}
      </Button>
    </form>
  )
}

interface StripeCheckoutProps {
  amount: number
  donationId: string
  donorInfo: DonorInfoFormData
  donationType: 'recurring' | 'onetime'
  tierName?: string
  onSuccess: () => void
  onError: (error: string) => void
}

export function StripeCheckout({
  amount,
  donationId,
  donorInfo,
  donationType,
  tierName,
  onSuccess,
  onError
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)
  const [loading, setLoading] = useState(true)
  const initializingRef = useRef(false)
  const initializedRef = useRef(false)

  useEffect(() => {
    // Prevent multiple simultaneous calls
    if (initializedRef.current || initializingRef.current) return

    initializingRef.current = true

    const initStripe = async () => {
      try {
        // Use subscription endpoint for recurring, payment intent for one-time
        const endpoint = donationType === 'recurring'
          ? '/api/stripe/create-subscription'
          : '/api/stripe/create-intent'

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            donationId,
            donorEmail: donorInfo.donorEmail,
            donorName: donorInfo.donorName,
            tierName
          })
        })

        if (!res.ok) {
          const errorData = await res.json()
          console.error('Stripe API error:', errorData)
          throw new Error(errorData.error || 'Failed to create payment')
        }

        const { clientSecret, publishableKey } = await res.json()
        setClientSecret(clientSecret)
        setStripePromise(loadStripe(publishableKey))
        initializedRef.current = true
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to initialize payment'
        console.error('Stripe initialization error:', errorMsg)
        onError(errorMsg)
        initializingRef.current = false
      } finally {
        setLoading(false)
      }
    }

    initStripe()
  }, [amount, donationId, donorInfo.donorEmail, donorInfo.donorName, donationType, tierName, onError])

  if (!clientSecret || !stripePromise) {
    if (loading) {
      return (
        <div className="space-y-4">
          {/* Order summary skeleton */}
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm text-muted-foreground">
              {donationType === 'recurring' ? 'Monthly donation' : 'One-time donation'}
            </span>
            <span className="font-medium">${amount.toLocaleString('en-US')}</span>
          </div>

          {/* Loading placeholder for payment form */}
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="text-sm text-muted-foreground mt-4">Preparing secure payment...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="py-8 text-center">
        <p className="text-sm text-destructive">Failed to load payment form</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Order summary */}
      <div className="flex justify-between items-center py-3 border-b">
        <span className="text-sm text-muted-foreground">
          {donationType === 'recurring' ? 'Monthly donation' : 'One-time donation'}
        </span>
        <span className="font-medium">${amount.toLocaleString('en-US')}</span>
      </div>

      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm amount={amount} onSuccess={onSuccess} onError={onError} />
      </Elements>
    </div>
  )
}
