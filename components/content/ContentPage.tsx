import { PortableText } from '@portabletext/react'
import type { PortableTextBlock, PortableTextSpan } from '@portabletext/types'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'
import { TableOfContents } from './TableOfContents'

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
  updatedAt?: string
}

interface TocItem {
  id: string
  text: string
  level: number
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function extractHeadings(sections: Section[]): TocItem[] {
  const headings: TocItem[] = []

  sections.forEach((section, sectionIdx) => {
    if (section.heading) {
      headings.push({
        id: `section-${sectionIdx}-${slugify(section.heading)}`,
        text: section.heading,
        level: 2,
      })
    }

    section.content.forEach((block) => {
      if (
        block._type === 'block' &&
        typeof block.style === 'string' &&
        ['h2', 'h3', 'h4'].includes(block.style) &&
        Array.isArray(block.children)
      ) {
        const text = block.children
          .filter((child): child is PortableTextSpan => 'text' in child && typeof child.text === 'string')
          .map((child) => child.text)
          .join('') || ''

        if (text) {
          headings.push({
            id: `${block.style}-${slugify(text)}`,
            text,
            level: parseInt(block.style.charAt(1)),
          })
        }
      }
    })
  })

  return headings
}

export function ContentPage({ content, updatedAt }: ContentPageProps) {
  const tocItems = content.sections ? extractHeadings(content.sections) : []

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex gap-12 items-start">
        <div className="flex-1 max-w-4xl min-w-0">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
            {content.subtitle && (
              <p className="text-xl text-muted-foreground mb-4">{content.subtitle}</p>
            )}
            {updatedAt && (
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>

          {content.sections?.map((section, idx) => (
            <section key={idx} className="mb-12">
              {section.heading && (
                <h2
                  id={`section-${idx}-${slugify(section.heading)}`}
                  className="text-2xl font-semibold mb-4 scroll-mt-24"
                >
                  {section.heading}
                </h2>
              )}
              <PortableText
                value={section.content}
                components={{
                  block: {
                    h2: ({ children, value }) => {
                      const text = value?.children
                        ?.filter((child): child is PortableTextSpan => 'text' in child && typeof child.text === 'string')
                        .map((child) => child.text)
                        .join('') || '';
                      const id = text ? `h2-${slugify(text)}` : undefined;
                      return (
                        <h2 id={id} className="text-xl font-semibold mt-8 mb-4 scroll-mt-24">
                          {children}
                        </h2>
                      );
                    },
                    h3: ({ children, value }) => {
                      const text = value?.children
                        ?.filter((child): child is PortableTextSpan => 'text' in child && typeof child.text === 'string')
                        .map((child) => child.text)
                        .join('') || ''
                      const id = text ? `h3-${slugify(text)}` : undefined
                      return (
                        <h3 id={id} className="text-lg font-semibold mt-6 mb-3 scroll-mt-24">
                          {children}
                        </h3>
                      )
                    },
                    h4: ({ children, value }) => {
                      const text = value?.children
                        ?.filter((child): child is PortableTextSpan => 'text' in child && typeof child.text === 'string')
                        .map((child) => child.text)
                        .join('') || ''
                      const id = text ? `h4-${slugify(text)}` : undefined
                      return (
                        <h4 id={id} className="text-base font-semibold mt-4 mb-2 scroll-mt-24">
                          {children}
                        </h4>
                      )
                    },
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

        {tocItems.length > 0 && (
          <aside className="hidden lg:block w-64 shrink-0 h-full">
            <TableOfContents items={tocItems} />
          </aside>
        )}
      </div>
    </div>
  )
}
