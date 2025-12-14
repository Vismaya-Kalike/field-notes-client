import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Blog } from '../types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Skeleton } from './ui/skeleton'
import { PageTitle } from './PageTitle'
import { BookOpen, Calendar, User } from 'lucide-react'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function BlogCard({ blog, onClick }: { blog: Blog; onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-all hover:shadow-md hover:bg-accent"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold line-clamp-2">
          {blog.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-4 text-xs">
          {blog.author_name && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {blog.author_name}
            </span>
          )}
          {blog.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(blog.published_at)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {blog.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {blog.excerpt}
          </p>
        )}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {blog.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-vika-teal text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function BlogList() {
  const navigate = useNavigate()

  const { data: blogs = [], isLoading, error } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      if (error) throw error
      return (data || []) as Blog[]
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-32 mb-2" />
        <Skeleton className="h-6 w-64 mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-destructive">
          Error loading blogs: {(error as Error).message}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle title="Blog" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-3xl font-bold text-foreground">Blog</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Stories, reflections, and insights from our journey with self-directed learning
        </p>
      </div>

      {/* Blog List */}
      {blogs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No blog posts yet. Check back soon!
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              onClick={() => navigate(`/blog/${blog.slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
