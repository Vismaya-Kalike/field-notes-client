import { cn } from '@/lib/utils'

export interface PageContent {
  title: string
  subtitle?: string
  sections: {
    heading?: string
    content: string
  }[]
}

interface ContentPageProps {
  content: PageContent
  className?: string
}

export function ContentPage({ content, className }: ContentPageProps) {
  return (
    <div className={cn("max-w-4xl mx-auto px-6 py-12", className)}>
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {content.title}
        </h1>
        {content.subtitle && (
          <p className="text-xl text-muted-foreground">
            {content.subtitle}
          </p>
        )}
      </header>

      <div className="space-y-12">
        {content.sections.map((section, index) => (
          <section key={index}>
            {section.heading && (
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {section.heading}
              </h2>
            )}
            <div
              className="prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </section>
        ))}
      </div>
    </div>
  )
}

export default ContentPage
