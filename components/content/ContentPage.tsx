import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'

interface Section {
  heading?: string
  content: PortableTextBlock[]
}

interface ContentPageProps {
  content: {
    title: string
    subtitle?: string
    sections?: Section[]
  }
}

export function ContentPage({ content }: ContentPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
      {content.subtitle && (
        <p className="text-xl text-muted-foreground mb-12">{content.subtitle}</p>
      )}

      {content.sections?.map((section, idx) => (
        <section key={idx} className="mb-12">
          {section.heading && (
            <h2 className="text-2xl font-semibold mb-4">{section.heading}</h2>
          )}
          <PortableText
            value={section.content}
            components={{
              block: {
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold mt-8 mb-4">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold mt-6 mb-3">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-base font-semibold mt-4 mb-2">{children}</h4>
                ),
                normal: ({ children }) => <p className="mb-4">{children}</p>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic my-6">
                    {children}
                  </blockquote>
                ),
              },
              list: {
                bullet: ({ children }) => (
                  <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>
                ),
                number: ({ children }) => (
                  <ol className="list-decimal ml-6 mb-4 space-y-2">{children}</ol>
                ),
              },
              marks: {
                link: ({ children, value }) => {
                  const target = value?.blank ? '_blank' : undefined
                  const rel = value?.blank ? 'noopener noreferrer' : undefined
                  return (
                    <a
                      href={value?.href}
                      target={target}
                      rel={rel}
                      className="text-primary underline hover:text-primary/80"
                    >
                      {children}
                    </a>
                  )
                },
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
              },
              types: {
                image: ({ value }) => {
                  if (!value?.asset) return null

                  const imageUrl = urlFor(value)
                    .width(1200)
                    .fit('max')
                    .auto('format')
                    .url()

                  return (
                    <div className="my-8">
                      <Image
                        src={imageUrl}
                        alt={value.alt || ''}
                        width={1200}
                        height={800}
                        className="w-1/2 h-auto mx-auto"
                      />
                      {value.caption && (
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                          {value.caption}
                        </p>
                      )}
                    </div>
                  )
                },
              },
            }}
          />
        </section>
      ))}
    </div>
  )
}
