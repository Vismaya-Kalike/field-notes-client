import { DonationForm } from './components/DonationForm'

export default function DonatePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl">Support Vismaya Kalike</h1>
          <p className="text-lg leading-relaxed">
            Your contribution helps us create open, joyful, and self-determined learning spaces for children across Karnataka. Every donation makes a difference in a child's journey of discovery and growth. We value contributions, however small or big, and urge you to contribute on a regular basis.
          </p>
          <p className="text-lg leading-relaxed">
            Each centre costs us <strong>$249</strong> or <strong>₹25000</strong> each month. This includes an honorarium for the facilitator, rent for the premises, stationery, workshops, exposure visits as well as the partial cost for a coordinator.
          </p>
        </div>

        {/* Donation Form */}
        <DonationForm />

        {/* Information Section */}
        <div className="text-sm text-muted-foreground space-y-3 pt-8 border-t">
          <div className="space-y-1">
            <p className="font-medium text-foreground">India Donations</p>
            <p>Donations are made to Heera Foundation in INR (Indian Rupees)</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">United States Donations</p>
            <p>
              Donations are made to Spring Foundation in USD. Spring Foundation is a
              registered 501(c)(3) nonprofit organization (EIN: 32-0826727).
              Your donation is tax-deductible to the extent allowed by law.
            </p>
          </div>
          <div className="pt-2">
            <p className="text-xs">
              By donating, you agree to our privacy policy. Your personal information
              will only be used for donation processing and communication about Vismaya Kalike.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
