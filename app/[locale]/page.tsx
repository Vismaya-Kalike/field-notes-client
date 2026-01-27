import { PageTitle } from '@/components/PageTitle'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle title="Home - Vismaya Kalike" />

      <div className="space-y-12">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-foreground">Home</h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed">
              Vismaya Kalike is an after school program run by a collective of organisations in Karnataka. We create{' '}
              <Link href="/open" className="underline decoration-1 underline-offset-4 hover:text-foreground/80">open</Link>,{' '}
              <Link href="/joyful" className="underline decoration-1 underline-offset-4 hover:text-foreground/80">joyful</Link>,{' '}
              <Link href="/self-determined" className="underline decoration-1 underline-offset-4 hover:text-foreground/80">self determined</Link>,{' '}
              <Link href="/community-run" className="underline decoration-1 underline-offset-4 hover:text-foreground/80">community run</Link>,{' '}
              learning spaces so children can develop{' '}
              <Link href="/agency" className="underline decoration-1 underline-offset-4 hover:text-foreground/80">agency</Link>.
            </p>
            < br />

            <p className="text-lg leading-relaxed">
              Each learning centre is situated within the community and is stocked with plenty of games, books and learning
              material. The children come to the centre in the evening and choose what they want to do. The centres are
              supported by a facilitator from the community and children reach out to them when they need support.
            </p>

            < br />

            <p className="text-lg leading-relaxed">
              Currently there are fifty Vismaya Kalike{' '}
              <Link href="/learning-centers" className="underline decoration-1 underline-offset-4 hover:text-foreground/80">
                learning centers
              </Link>{' '}
              running across five districts of Karnataka.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/learning-centers">
              <Card className="cursor-pointer transition-colors hover:bg-accent h-full">
                <CardHeader>
                  <CardTitle>Learning Centers</CardTitle>
                  <CardDescription>
                    Browse learning centers across different states and districts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View detailed information about facilitators, partner organizations, and activities at each center.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/resources/activities">
              <Card className="cursor-pointer transition-colors hover:bg-accent h-full">
                <CardHeader>
                  <CardTitle>Activities</CardTitle>
                  <CardDescription>
                    Explore educational activities and resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Discover activities designed for different learning contexts, with materials and instructions.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
