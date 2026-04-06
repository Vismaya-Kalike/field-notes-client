'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ScienceExperiment } from '../types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Skeleton } from './ui/skeleton'
import { Input } from './ui/input'
import { PageTitle } from './PageTitle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { FlaskConical, Search } from 'lucide-react'

function ExperimentCard({ experiment, onClick }: { experiment: ScienceExperiment; onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-all hover:bg-accent hover:shadow-md"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-sm font-medium text-muted-foreground shrink-0">
            {experiment.experiment_number}
          </span>
          <div className="min-w-0">
            <CardTitle className="text-base line-clamp-1">{experiment.title}</CardTitle>
            {experiment.category && (
              <CardDescription className="text-xs">{experiment.category}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {experiment.learning_outcome}
        </p>
        <p className="text-xs text-muted-foreground/70 line-clamp-1">
          {experiment.materials}
        </p>
      </CardContent>
    </Card>
  )
}

export default function ScienceExperiments() {
  const router = useRouter()
  const locale = useLocale()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const { data: experiments = [], isLoading, error } = useQuery({
    queryKey: ['science-experiments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('science_experiments')
        .select('*')
        .order('experiment_number', { ascending: true })

      if (error) throw error
      return (data || []) as ScienceExperiment[]
    },
  })

  const categories = [...new Set(experiments.map(e => e.category).filter(Boolean))]

  const filteredExperiments = experiments.filter(experiment => {
    const matchesSearch = searchTerm === '' ||
      experiment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      experiment.materials.toLowerCase().includes(searchTerm.toLowerCase()) ||
      experiment.learning_outcome.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === '' || categoryFilter === 'all' || experiment.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-6 w-96 mb-8" />
        <Skeleton className="h-10 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-full" />
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
          Error loading experiments: {(error as Error).message}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle title="Science Experiments" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FlaskConical className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-3xl text-foreground">Science Experiments</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          A collection of {experiments.length} hands-on science experiments
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search experiments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category || ''}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Showing {filteredExperiments.length} of {experiments.length} experiments
      </p>

      {filteredExperiments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No experiments found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExperiments.map((experiment) => (
            <ExperimentCard
              key={experiment.id}
              experiment={experiment}
              onClick={() => router.push(`/${locale}/resources/experiments/${experiment.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
