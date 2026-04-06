import Link from 'next/link'
import { PageTitle } from '@/components/PageTitle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Book, Music, FlaskConical, BookOpen } from 'lucide-react'

const resources = [
  {
    title: 'Activities',
    description: 'Engaging activities designed for joyful learning in self-directed spaces, tagged with constraints to help find the right fit.',
    href: '/resources/activities',
    icon: Book,
  },
  {
    title: 'Songs',
    description: 'A collection of Kannada songs for joyful learning, covering topics from the alphabet to geography.',
    href: '/resources/songs',
    icon: Music,
  },
  {
    title: 'Science Experiments',
    description: 'Hands-on science experiments covering physics, chemistry, biology and earth science.',
    href: '/resources/experiments',
    icon: FlaskConical,
  },
  {
    title: 'Reading List',
    description: 'Books, articles and research papers that have shaped our approach to joyful, self-directed learning.',
    href: '/resources/reading-list',
    icon: BookOpen,
  },
]

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function ResourcesPage({ params }: PageProps) {
  const { locale } = await params

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageTitle title="Resources" />

      <div className="space-y-8">
        <section className="space-y-2">
          <h1 className="text-3xl text-foreground">Resources</h1>
          <p className="text-lg text-muted-foreground">
            Learning materials for our centres — activities, songs, science experiments and reading material.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource) => {
            const Icon = resource.icon
            return (
              <Link key={resource.href} href={`/${locale}${resource.href}`}>
                <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:bg-accent">
                  <CardHeader>
                    <Icon className="h-8 w-8 text-muted-foreground mb-2" />
                    <CardTitle className="text-xl">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
