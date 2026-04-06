'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ScienceExperiment } from '../types/database'
import { Skeleton } from './ui/skeleton'
import { PageTitle } from './PageTitle'
import { ArrowLeft, Package, ListOrdered, Lightbulb, GraduationCap } from 'lucide-react'

export default function ScienceExperimentDetail() {
  const params = useParams()
  const locale = useLocale()
  const experimentId = params?.experimentId as string

  const { data: experiment, isLoading, error } = useQuery({
    queryKey: ['science-experiment', experimentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('science_experiments')
        .select('*')
        .eq('id', experimentId)
        .single()

      if (error) throw error
      return data as ScienceExperiment
    },
    enabled: !!experimentId,
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-6 w-24 mb-8" />
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <Skeleton className="h-6 w-32 mb-3" />
          <Skeleton className="h-16 w-full mb-6" />
          <Skeleton className="h-6 w-32 mb-3" />
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-6 w-32 mb-3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (error || !experiment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`/${locale}/resources/experiments`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Science Experiments
        </Link>
        <div className="text-center text-destructive">
          {error ? `Error: ${(error as Error).message}` : 'Experiment not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle title={experiment.title} />

      <Link
        href={`/${locale}/resources/experiments`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Science Experiments
      </Link>

      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-1">Experiment {experiment.experiment_number}</p>
          <h1 className="text-3xl text-foreground mb-2">{experiment.title}</h1>
          {experiment.category && (
            <span className="inline-block px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">
              {experiment.category}
            </span>
          )}
        </div>

        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg text-foreground">Materials Required</h2>
            </div>
            <p className="text-muted-foreground pl-7">{experiment.materials}</p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <ListOrdered className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg text-foreground">Steps</h2>
            </div>
            <div className="pl-7 text-muted-foreground whitespace-pre-line">
              {experiment.steps}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg text-foreground">Result</h2>
            </div>
            <p className="text-muted-foreground pl-7">{experiment.result}</p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg text-foreground">Learning Outcome</h2>
            </div>
            <p className="text-muted-foreground pl-7">{experiment.learning_outcome}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
