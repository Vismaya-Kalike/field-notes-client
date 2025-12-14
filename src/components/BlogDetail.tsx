import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Blog } from '../types/database'
import { Skeleton } from './ui/skeleton'
import { PageTitle } from './PageTitle'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'

const markdownComponents: Partial<Components> = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold text-foreground mt-10 mb-4">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-base text-foreground leading-relaxed mb-5 text-justify">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside ml-6 mb-5 space-y-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside ml-6 mb-5 space-y-2">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-base text-foreground leading-relaxed">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-muted-foreground/30 pl-4 my-6 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-5">{children}</pre>
  ),
  hr: () => (
    <hr className="my-8 border-border" />
  ),
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>()

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (error) throw error
      return data as Blog
    },
    enabled: !!slug,
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-6 w-24 mb-8" />
        <div className="max-w-3xl">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-5 w-48 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
        <div className="text-center text-destructive">
          {error ? `Error loading blog: ${(error as Error).message}` : 'Blog post not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle title={blog.title} />

      {/* Back link */}
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>

      {/* Header */}
      <header className="mb-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {blog.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {blog.author_name && (
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {blog.author_name}
            </span>
          )}
          {blog.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(blog.published_at)}
            </span>
          )}
        </div>
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-vika-teal text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <article className="max-w-3xl mx-auto">
        <ReactMarkdown components={markdownComponents}>{blog.content}</ReactMarkdown>
      </article>
    </div>
  )
}
