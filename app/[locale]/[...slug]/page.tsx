import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity/client'
import { pageBySlugQuery } from '@/lib/sanity/queries'
import { ContentPage } from '@/components/content/ContentPage'
import type { Locale } from '@/i18n'

interface PageProps {
  params: Promise<{ locale: Locale; slug: string[] }>
}

export default async function DynamicPage({ params }: PageProps) {
  const { locale, slug } = await params
  
  // Join slug array to create full slug path (e.g., ['about', 'purpose'] -> 'about/purpose')
  const fullSlug = slug.join('/')
  
  // Fetch page from Sanity
  const page = await client.fetch(pageBySlugQuery, { slug: fullSlug })
  
  if (!page) {
    notFound()
  }
  
  // Get content for current locale
  const content = page[locale]
  
  if (!content || !content.title) {
    notFound()
  }
  
  return <ContentPage content={content} />
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params
  const fullSlug = slug.join('/')
  
  const page = await client.fetch(pageBySlugQuery, { slug: fullSlug })
  
  if (!page) {
    return {}
  }
  
  const content = page[locale]
  
  return {
    title: content?.metaTitle || content?.title,
    description: content?.metaDescription || content?.subtitle,
  }
}

// Revalidate every hour
export const revalidate = 3600
