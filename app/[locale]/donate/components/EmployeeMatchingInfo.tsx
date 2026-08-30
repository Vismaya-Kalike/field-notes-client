import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

export function EmployeeMatchingInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Matching Programs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          We accept donations through corporate employee matching programs. Many companies
          will match your charitable donation, doubling or even tripling your impact!
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground pl-4">
              <li>Log into your company's giving portal</li>
              <li>Search for "Spring Foundation" and look for this logo
                <Image src="/spring_foundation_logo.png" width={200} height={200} alt={'Spring Foundation Logo'}/>
              </li>
              <li>Complete the donation process</li>
            </ol>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Processing time:</span> Corporate matching donations
            typically take a little longer to process. You will receive confirmation once the
            donation is received.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
