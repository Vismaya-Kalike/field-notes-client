import { PageTitle } from '@/components/PageTitle'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'


interface LearningCentre {
  id: string
  centre_name: string
  area: string
  city: string
  district: string
  state: string
}

export default async function HomePage() {
  const { data: partners } = await supabase
    .from('partner_organisations')
    .select('id, name, logo_url, type, contact, url')
    .order('name')

  const { data: learningCentres } = await supabase
    .rpc('get_random_learning_centres', { limit_count: 6 })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageTitle title="Vismaya Kalike" />

      <div className="space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Image
              src="/logo_with_text.png"
              alt="Vismaya Kalike"
              width={450}
              height={200}
              priority
              className="dark:invert"
            />
          </div>
          <p className="text-lg md:text-2xl text-muted-foreground">
            Learning for the Naturally Curious
          </p>
        </div>

        {/* What is Vismaya Kalike */}
        <section className="space-y-4">
          <h2 className="text-3xl">What is Vismaya Kalike?</h2>
            <p className="text-lg leading-relaxed">
              Vismaya Kalike is an after school program run by a collective of organisations in Karnataka. We create{' '}
              <Link href="/open" className="underline underline-offset-4 hover:opacity-70 transition-opacity">open</Link>,{' '}
              <Link href="/joyful" className="underline underline-offset-4 hover:opacity-70 transition-opacity">joyful</Link>,{' '}
              <Link href="/self-determined" className="underline underline-offset-4 hover:opacity-70 transition-opacity">self determined</Link>,{' '}
              <Link href="/community-run" className="underline underline-offset-4 hover:opacity-70 transition-opacity">community run</Link>,{' '}
              learning spaces so children can develop{' '}
              <Link href="/agency" className="underline underline-offset-4 hover:opacity-70 transition-opacity">agency</Link>.
            </p>
            <Link href="/what-is-vismaya-kalike" className="inline-block text-lg hover:opacity-70 transition-opacity text-black">Learn more about Vismaya Kalike →</Link>
        </section>

        {/* How does it work practically */}
        <section className="space-y-4">
          <h2 className="text-3xl">How does it work practically?</h2>
          <p className="text-lg leading-relaxed">
            Each learning centre is situated within the community and is stocked with plenty of <Link href="/suggested-material-list" className="underline underline-offset-4 hover:opacity-70 transition-opacity">games,
            books and learning material</Link>. The children come to the centre in the evening and choose what
            they want to work on. The centres are supported by facilitators and children reach out to
            them when they need support.
          </p>
        </section>

        {/* What is the progress so far */}
        <section className="space-y-4">
          <h2 className="text-3xl">What is the progress so far?</h2>
          <p className="text-lg leading-relaxed">
            We started as one organisation with one space in 2017 and today we are currently a <Link href="/partners" className="underline underline-offset-4 hover:opacity-70 transition-opacity">collective</Link> of five organisations
            and with 75 centers across Karnataka. We are also currently running facilitator workshops for organisations in Andhra Pradesh.
          </p>
        </section>

        {/* Where are the learning centers */}
        <section className="space-y-6">
          <h2 className="text-3xl">Where are the learning centers?</h2>
          <p className="text-lg leading-relaxed">
            Currently our learning centers are located in Hosapete, Koppala, Tumakuru and Bangalore districts of Karnataka. We are shortly opening centers in Bagalkot and Raichur districts as well. Further, we are supporting organisations in Andhra Pradesh in the form of workshops and learning material to set up their own learning centers in Guntur, Vijayawada, Eluru and Vishakhapatnam districts. Here are a few of our centers:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(learningCentres as LearningCentre[] | null)?.map((centre) => (
              <Card key={centre.id} className="py-3 gap-2">
                <CardHeader className="px-4 gap-1">
                  <CardTitle className="text-base">{centre.centre_name}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 space-y-0.5">
                  <p className="text-xs text-muted-foreground">
                    {centre.area}, {centre.city}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {centre.district}, {centre.state}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href="/learning-centers"
              className="inline-block text-lg hover:underline text-black no-underline"
            >
              View all learning centers →
            </Link>
          </div>
        </section>

        {/* How can I help */}
        <section className="space-y-4">
          <h2 className="text-3xl">How can I help?</h2>
          <p className="text-lg leading-relaxed">
            At Vismaya Kalike we're always looking for collaborations and we believe that everyone has
            something to offer our initiative. Our spaces are open and inclusive. Anyone is welcome to
            volunteer at our spaces and spend time with the children playing and learning along with
            them. We're also looking to grow our program and we are seeking donations for our learning
            centre and scholarship program.
          </p>
        </section>

        {/* Who do you partner with */}
        <section className="space-y-6">
          <h2 className="text-3xl">Who do you partner with?</h2>
          <p className="text-lg leading-relaxed mb-6">
            We believe that it's important not to operate in silos and to collaborate with other
            organisations. We don't want to reinvent the wheel and feel that our work is a lot more
            effective when partnering with community based organisations who are already working on
            the ground. Further, we think there's a lot to learn from other organisations and we have
            partnered with many of them for workshops and visits.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {partners?.map((partner) => {
              const cardContent = (
                <>
                  <CardHeader className="px-3 gap-0.5">
                    <div className="h-14 flex items-center justify-center mb-0.5">
                      {partner.logo_url ? (
                        <Image
                          src={partner.logo_url}
                          alt={partner.name}
                          width={90}
                          height={50}
                          className="object-contain max-h-14"
                        />
                      ) : (
                        <div className="h-14" />
                      )}
                    </div>
                    <CardTitle className="text-sm text-center min-h-8 flex items-center justify-center">
                      {partner.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 space-y-0">
                    <p className="text-xs text-center min-h-3 leading-tight">
                      {partner.type || '\u00A0'}
                    </p>
                    <p className="text-xs text-muted-foreground text-center min-h-3 leading-tight">
                      {partner.contact || '\u00A0'}
                    </p>
                  </CardContent>
                </>
              )

              return partner.url ? (
                <Link
                  key={partner.id}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="py-2 gap-1 h-full hover:shadow-md transition-shadow">
                    {cardContent}
                  </Card>
                </Link>
              ) : (
                <Card key={partner.id} className="py-2 gap-1 h-full">
                  {cardContent}
                </Card>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
