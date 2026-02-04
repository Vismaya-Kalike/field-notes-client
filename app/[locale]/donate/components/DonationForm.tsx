'use client'

import { useState } from 'react'
import type {
  Country,
  DonationType,
  PaymentMethod,
  RecurringTier,
  FlowStep
} from '../types'
import { CountryTabs } from './CountryTabs'
import { DonationTypeToggle } from './DonationTypeToggle'
import { RecurringTierCards } from './RecurringTierCards'
import { OneTimeAmountButtons } from './OneTimeAmountButtons'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { DonorInfoForm } from './DonorInfoForm'
import { RazorpayCheckout } from './RazorpayCheckout'
import { StripeCheckout } from './StripeCheckout'
import { BankTransferInfo } from './BankTransferInfo'
import { ChequeInfo } from './ChequeInfo'
import { EmployeeMatchingInfo } from './EmployeeMatchingInfo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { DonorInfoFormData } from '@/lib/validations/donation'

export function DonationForm() {
  const [country, setCountry] = useState<Country>('india')
  const [donationType, setDonationType] = useState<DonationType>('recurring')
  const [selectedTier, setSelectedTier] = useState<RecurringTier | null>(null)
  const [recurringCustomAmount, setRecurringCustomAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState<number | null>(null)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [step, setStep] = useState<FlowStep>('amount')
  const [donorInfo, setDonorInfo] = useState<DonorInfoFormData | null>(null)
  const [donationId, setDonationId] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get the amount (tiers already have correct currency amounts)
  const amount = donationType === 'recurring'
    ? (selectedTier?.amount || recurringCustomAmount || 0)
    : (customAmount || selectedAmount || 0)

  const canProceedFromAmount = amount > 0

  const handleCountryChange = (newCountry: Country) => {
    setCountry(newCountry)
    // Reset all form state when switching countries
    setDonationType('recurring')
    setSelectedTier(null)
    setRecurringCustomAmount(null)
    setSelectedAmount(null)
    setCustomAmount(null)
    setPaymentMethod('card')
    setStep('amount')
    setDonorInfo(null)
    setDonationId(null)
    setSuccess(false)
    setError(null)
  }

  const handleDonationTypeChange = (newType: DonationType) => {
    setDonationType(newType)
    setSelectedTier(null)
    setRecurringCustomAmount(null)
    setSelectedAmount(null)
    setCustomAmount(null)
  }

  const handleTierSelect = (tier: RecurringTier) => {
    setSelectedTier(tier)
  }

  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt)
  }

  const handleCustomAmountChange = (amt: number | null) => {
    setCustomAmount(amt)
  }

  const handleProceedToPayment = () => {
    if (canProceedFromAmount) {
      setStep('payment')
    }
  }

  const handleProceedToDonorInfo = () => {
    setStep('donor_info')
  }

  const handleDonorInfoSubmit = async (data: DonorInfoFormData) => {
    setDonorInfo(data)
    setError(null)

    try {
      // Create donation record
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: data.donorName,
          donorEmail: data.donorEmail,
          donorPhone: data.donorPhone,
          donorAddress: data.donorAddress,
          panNumber: data.panNumber,
          country,
          donationType,
          amount,
          paymentMethod,
          recurringTier: selectedTier?.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create donation')
      }

      const { donationId: id } = await response.json()
      setDonationId(id)

      // Move to checkout step for card/UPI, or show info for other methods
      setStep('checkout')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process donation')
    }
  }

  const handlePaymentSuccess = () => {
    setSuccess(true)
    setError(null)
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const renderCheckout = () => {
    if (!donorInfo || !donationId) return null

    // Success state
    if (success) {
      return (
        <Card>
          <CardContent className="py-8 text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl">Thank you for your donation!</h2>
            <p>
              Your contribution will help create joyful learning spaces for children.
            </p>
            <p>
              You will receive a confirmation email at {donorInfo.donorEmail}
            </p>
          </CardContent>
        </Card>
      )
    }

    // Card/UPI payment gateways
    if (paymentMethod === 'card' || paymentMethod === 'upi') {
      if (country === 'india') {
        return (
          <RazorpayCheckout
            amount={amount}
            donationId={donationId}
            donorInfo={donorInfo}
            tierName={selectedTier?.name}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )
      } else {
        return (
          <StripeCheckout
            amount={amount}
            donationId={donationId}
            donorInfo={donorInfo}
            donationType={donationType}
            tierName={selectedTier?.name}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )
      }
    }

    // Static payment info for other methods
    if (paymentMethod === 'bank_transfer') {
      return (
        <div className="space-y-4">
          <BankTransferInfo country={country} />
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground">
                Your donation record has been created. Please complete the bank transfer
                and email the receipt to confirm your donation.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (paymentMethod === 'cheque') {
      return (
        <div className="space-y-4">
          <ChequeInfo country={country} />
        </div>
      )
    }

    if (paymentMethod === 'employee_matching') {
      return (
        <div className="space-y-4">
          <EmployeeMatchingInfo />
        </div>
      )
    }

    return null
  }

  const currencySymbol = country === 'india' ? '₹' : '$'
  const formattedAmount = amount > 0
    ? `${currencySymbol}${amount.toLocaleString(country === 'india' ? 'en-IN' : 'en-US')}`
    : null

  return (
    <div className="space-y-6">
      {/* Country selection - always visible */}
      <div>
        <h3 className="text-sm font-medium mb-2">Select Country</h3>
        <CountryTabs value={country} onValueChange={handleCountryChange} />
      </div>

      {/* Amount summary - show only on payment and donor_info steps */}
      {formattedAmount && (step === 'payment' || step === 'donor_info') && (
        <div className="flex justify-between items-center py-3 border-b">
          <span className="text-sm text-muted-foreground">
            {donationType === 'recurring' ? 'Monthly donation' : 'One-time donation'}
          </span>
          <span className="font-semibold">{formattedAmount}</span>
        </div>
      )}

      {/* Error display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Amount Selection */}
      {step === 'amount' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Donation Type</h3>
            <DonationTypeToggle value={donationType} onValueChange={handleDonationTypeChange} />
          </div>

          {donationType === 'recurring' && (
            <div>
              <h3 className="text-sm font-medium mb-2">Select Monthly Contribution</h3>
              <RecurringTierCards
                country={country}
                selectedTier={selectedTier}
                onSelectTier={handleTierSelect}
                customAmount={recurringCustomAmount}
                onCustomAmountChange={setRecurringCustomAmount}
              />
            </div>
          )}

          {donationType === 'onetime' && (
            <div>
              <h3 className="text-sm font-medium mb-2">Select Amount</h3>
              <OneTimeAmountButtons
                country={country}
                selectedAmount={selectedAmount}
                onSelectAmount={handleAmountSelect}
                customAmount={customAmount}
                onCustomAmountChange={handleCustomAmountChange}
              />
            </div>
          )}

          {canProceedFromAmount && (
            <Button onClick={handleProceedToPayment} className="w-full">
              Continue to Payment Method
            </Button>
          )}
        </div>
      )}

      {/* Step 2: Payment Method */}
      {step === 'payment' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Payment Method</h3>
            <PaymentMethodSelector
              country={country}
              value={paymentMethod}
              onValueChange={setPaymentMethod}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('amount')} className="flex-1">
              Back
            </Button>
            <Button onClick={handleProceedToDonorInfo} className="flex-1">
              Continue to Donor Information
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Donor Info */}
      {step === 'donor_info' && (
        <div>
          <h3 className="text-sm font-medium mb-4">Donor Information</h3>
          <DonorInfoForm
            country={country}
            onSubmit={handleDonorInfoSubmit}
            onBack={() => setStep('payment')}
          />
        </div>
      )}

      {/* Step 4: Checkout */}
      {step === 'checkout' && (
        <div>
          <h3 className="text-sm font-medium mb-4">
            {success ? 'Donation Complete' : 'Complete Your Donation'}
          </h3>
          {renderCheckout()}
        </div>
      )}
    </div>
  )
}
