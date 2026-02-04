import type { Country } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChequeInfoProps {
  country: Country
}

export function ChequeInfo({ country }: ChequeInfoProps) {
  if (country === 'india') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cheque Payment Details - India</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="font-medium text-sm">Mail your cheque to:</p>
            <div className="pl-4 space-y-1 text-sm text-muted-foreground">
              <p>Heera Foundation</p>
              <p>842, Second Cross, HAL Second Stage, Bangalore 560008</p>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <p className="font-medium text-sm">Cheque Details:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
              <li>Payable to: "Heera Foundation"</li>
              <li>Note: "Vismaya Kalike Donation"</li>
              <li>Include your contact details with the cheque</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cheque Payment Details - United States</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="font-medium text-sm">Mail your check to:</p>
          <div className="pl-4 space-y-1 text-sm text-muted-foreground">
            <p>Spring Foundation</p>
            <p>1177 Valencia St, Apt 4</p>
            <p>San Francisco, CA 94110</p>
          </div>
        </div>

        <div className="pt-4 border-t space-y-2">
          <p className="font-medium text-sm">Check Details:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
            <li>Payable to: "Spring Foundation"</li>
            <li>Note: Tax-deductible under 501(c)(3)</li>
            <li>EIN: 32-0826727</li>
            <li>Include your contact details for tax receipt</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
