'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import type { DonorInfoFormData } from '@/lib/validations/donation'

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
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
  tierName?: string
  onSuccess: () => void
  onError: (error: string) => void
}

export function RazorpayCheckout({
  amount,
  donationId,
  donorInfo,
  tierName,
  onSuccess,
  onError
}: RazorpayCheckoutProps) {
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
    try {
      // Create order
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, donationId })
      })

      if (!orderRes.ok) throw new Error('Failed to create order')

      const { orderId, keyId } = await orderRes.json()

      // Initialize Razorpay
      const options = {
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
        handler: () => onSuccess(),
        modal: {
          ondismiss: () => {
            onError('Payment cancelled')
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        onError(response.error.description || 'Payment failed')
      })
      rzp.open()
    } catch {
      onError('Payment initialization failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm">
          You will be redirected to Razorpay to complete your payment of{' '}
          <span className="font-medium">₹{amount.toLocaleString('en-IN')}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Razorpay accepts credit cards, debit cards, net banking, UPI, and wallets.
        </p>
      </div>
      <Button onClick={handlePayment} className="w-full">
        Proceed to Payment
      </Button>
    </div>
  )
}
