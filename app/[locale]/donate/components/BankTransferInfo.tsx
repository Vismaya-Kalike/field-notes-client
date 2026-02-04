import type { Country } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BankTransferInfoProps {
  country: Country
}

export function BankTransferInfo({ country }: BankTransferInfoProps) {
  if (country === 'india') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bank Transfer Details - India</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Bank Name:</span> State Bank of India
            </p>
            <p className="text-sm">
              <span className="font-medium">Account Name:</span> Heera Foundation
            </p>
            <p className="text-sm">
              <span className="font-medium">Account Number:</span> 32832625000
            </p>
            <p className="text-sm">
              <span className="font-medium">IFSC Code:</span> SBIN0004409
            </p>
            <p className="text-sm">
              <span className="font-medium">Branch:</span> HSR Layout
            </p>
          </div>

          <div className="pt-4 border-t space-y-2">
            <p className="font-medium text-sm">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Transfer to the above account</li>
              <li>Email receipt to: venkatesh@vismayakalike.org</li>
              <li>Include your name and contact in the email</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Transfer Details - United States</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">Bank Name:</span> Choice Financial Group
          </p>
          <p className="text-sm">
            <span className="font-medium">Account Name:</span> Spring Foundation
          </p>
          <p className="text-sm">
            <span className="font-medium">Routing Number:</span> 091311229
          </p>
          <p className="text-sm">
            <span className="font-medium">Account Number:</span> 202532961407
          </p>
          <p className="text-sm">
            <span className="font-medium">Bank Address:</span> 4501 23rd Avenue S, Fargo, ND 58104
          </p>

        </div>

        <div className="pt-4 border-t space-y-2">
          <p className="font-medium text-sm">Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Transfer to the above account</li>
            <li>Email confirmation to: info@springfnd.org</li>
            <li>Include name for tax receipt</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
