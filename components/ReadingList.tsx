'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ReadingListItem } from '../types/database'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Skeleton } from './ui/skeleton'
import { Input } from './ui/input'
import { PageTitle } from './PageTitle'
import { BookOpen, FileText, GraduationCap, Search } from 'lucide-react'

const TYPE_CONFIG = {
  book: { label: 'Books', icon: BookOpen },
  article: { label: 'Articles', icon: FileText },
  paper: { label: 'Papers', icon: GraduationCap },
} as const

function ReadingListEntry({ item }: { item: ReadingListItem }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{item.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{item.author}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {item.description}
        </p>
        {item.apa_citation && (
          <p className="text-xs text-muted-foreground/70 italic">
            {item.apa_citation}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function ReadingList() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['reading-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reading_list')
        .select('*')
        .order('title', { ascending: true })

      if (error) throw error
      return (data || []) as ReadingListItem[]
    },
  })

  const filtered = items.filter(item => {
    if (searchTerm === '') return true
    const term = searchTerm.toLowerCase()
    return (
      item.title.toLowerCase().includes(term) ||
      item.author.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    )
  })

  const grouped = {
    book: filtered.filter(i => i.type === 'book'),
    article: filtered.filter(i => i.type === 'article'),
    paper: filtered.filter(i => i.type === 'paper'),
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-6 w-96 mb-8" />
        <Skeleton className="h-10 w-full mb-8" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader>
              <CardContent><Skeleton className="h-16 w-full" /></CardContent>
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
          Error loading reading list: {(error as Error).message}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle title="Reading List" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-3xl text-foreground">Reading List</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Books, articles and research papers that have influenced the philosophical and pedagogical
          thinking behind Vismaya Kalike.
        </p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by title, author, or topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-12">
        {(['book', 'article', 'paper'] as const).map(type => {
          const entries = grouped[type]
          if (entries.length === 0) return null
          const config = TYPE_CONFIG[type]
          const Icon = config.icon

          return (
            <section key={type} className="space-y-4">
              <div className="flex items-center gap-2">
                <Icon className="h-6 w-6 text-muted-foreground" />
                <h2 className="text-2xl text-foreground">
                  {config.label}
                  <span className="text-base text-muted-foreground ml-2">({entries.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entries.map(item => (
                  <ReadingListEntry key={item.id} item={item} />
                ))}
              </div>
            </section>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No items found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}
