'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { DonorInfoFormData } from '@/lib/validations/donation'

interface RazorpayOptions {
  key: string
  amount?: number
  currency?: string
  name: string
  description: string
  order_id?: string
  subscription_id?: string
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: { color: string }
  handler: () => void
  modal: {
    ondismiss: () => void
  }
}

interface RazorpayInstance {
  open: () => void
  on: (event: string, callback: (response: { error: { description?: string } }) => void) => void
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayCheckoutProps {
  amount: number
  donationId: string
  donorInfo: DonorInfoFormData
  donationType: 'recurring' | 'onetime'
  tierId?: string
  tierName?: string
  onSuccess: () => void
  onError: (error: string) => void
}

export function RazorpayCheckout({
  amount,
  donationId,
  donorInfo,
  donationType,
  tierId,
  tierName,
  onSuccess,
  onError
}: RazorpayCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load Razorpay SDK
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handlePayment = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      if (donationType === 'recurring') {
        // Create subscription
        const subscriptionRes = await fetch('/api/razorpay/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            donationId,
            tierId: tierId || 'custom',
            tierName: tierName || 'Custom Amount',
            donorEmail: donorInfo.donorEmail,
            donorName: donorInfo.donorName,
            donorPhone: donorInfo.donorPhone
          })
        })

        if (!subscriptionRes.ok) {
          setIsLoading(false)
          throw new Error('Failed to create subscription')
        }

        const { subscriptionId, keyId } = await subscriptionRes.json()

        // Initialize Razorpay for subscription
        const options: RazorpayOptions = {
          key: keyId,
          subscription_id: subscriptionId,
          name: 'Heera Foundation',
          description: `Monthly donation - ${tierName || 'Custom Amount'}`,
          prefill: {
            name: donorInfo.donorName,
            email: donorInfo.donorEmail,
            contact: donorInfo.donorPhone
          },
          theme: { color: '#1BAB9B' },
          handler: () => {
            setIsLoading(false)
            onSuccess()
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false)
              onError('Payment cancelled')
            }
          }
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', (response) => {
          setIsLoading(false)
          onError(response.error.description || 'Payment failed')
        })
        rzp.open()
      } else {
        // Create one-time order
        const orderRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, donationId })
        })

        if (!orderRes.ok) {
          setIsLoading(false)
          throw new Error('Failed to create order')
        }

        const { orderId, keyId } = await orderRes.json()

        // Initialize Razorpay for one-time payment
        const options: RazorpayOptions = {
          key: keyId,
          amount: amount * 100,
          currency: 'INR',
          name: 'Heera Foundation',
          description: tierName || 'One-time donation',
          order_id: orderId,
          prefill: {
            name: donorInfo.donorName,
            email: donorInfo.donorEmail,
            contact: donorInfo.donorPhone
          },
          theme: { color: '#1BAB9B' },
          handler: () => {
            setIsLoading(false)
            onSuccess()
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false)
              onError('Payment cancelled')
            }
          }
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', (response) => {
          setIsLoading(false)
          onError(response.error.description || 'Payment failed')
        })
        rzp.open()
      }
    } catch {
      setIsLoading(false)
      onError('Payment initialization failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm">
          You will be redirected to Razorpay to complete your{' '}
          {donationType === 'recurring' ? 'monthly subscription' : 'payment'} of{' '}
          <span className="font-medium">₹{amount.toLocaleString('en-IN')}</span>
          {donationType === 'recurring' && '/month'}
        </p>
        <p className="text-xs text-muted-foreground">
          Razorpay accepts credit cards, debit cards, net banking, UPI, and wallets.
        </p>
        {donationType === 'recurring' && (
          <p className="text-xs text-muted-foreground">
            This will create a recurring monthly subscription. You can cancel anytime.
          </p>
        )}
      </div>
      <Button onClick={handlePayment} disabled={isLoading} className="w-full">
        {isLoading
          ? 'Loading...'
          : donationType === 'recurring'
            ? 'Set Up Monthly Subscription'
            : 'Proceed to Payment'}
      </Button>
    </div>
  )
}
