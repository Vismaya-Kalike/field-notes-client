'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { LearningCentre, FieldNote, FieldImage } from '@/types/database'
import { Skeleton } from '@/components/ui/skeleton'
import { PageTitle } from '@/components/PageTitle'
import { LearningCentreTimeline, getMonthTocItems } from '@/components/LearningCentreTimeline'
import { TableOfContents } from '@/components/content/TableOfContents'

function locationParts(centre: LearningCentre): string {
  const parts: string[] = []
  if (centre.area) parts.push(centre.area)
  if (centre.city && centre.city !== centre.area) parts.push(centre.city)
  if (centre.district && centre.district !== centre.city) parts.push(centre.district)
  parts.push(centre.state)
  return parts.join(', ')
}

interface PageProps {
  params: Promise<{
    state: string
    district: string
    centreId: string
  }>
}

export default function LearningCentrePage({ params }: PageProps) {
  const { centreId } = use(params)
  const { data: centre, isLoading: centreLoading, error: centreError } = useQuery({
    queryKey: ['learning-centre', centreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_centres_by_district')
        .select('id, centre_name, area, city, district, state, start_date, end_date, facilitators, partner_organisations')
        .eq('id', centreId)
        .single()

      if (error) throw error
      return data as LearningCentre
    },
  })

  const { data: fieldNotes = [], isLoading: notesLoading } = useQuery({
    queryKey: ['field-notes', centreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('field_notes')
        .select('id, learning_centre_id, facilitator_id, text, sanitized_text, is_visible, ai_commentary, sent_at, created_at')
        .eq('learning_centre_id', centreId)
        .eq('is_visible', true)
        .order('sent_at', { ascending: false, nullsFirst: false })

      if (error) throw error
      return (data || []) as FieldNote[]
    },
  })

  const { data: fieldImages = [], isLoading: imagesLoading } = useQuery({
    queryKey: ['field-images', centreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('field_images')
        .select('id, learning_centre_id, facilitator_id, photo_url, caption, sent_at, created_at')
        .eq('learning_centre_id', centreId)
        .order('sent_at', { ascending: false, nullsFirst: false })

      if (error) throw error
      return (data || []) as FieldImage[]
    },
  })

  if (centreLoading || notesLoading || imagesLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="space-y-4 mb-10">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-6 ml-3 pl-6 border-l-2 border-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (centreError || !centre) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-destructive">
          Error loading learning centre: {centreError instanceof Error ? centreError.message : 'Not found'}
        </div>
      </div>
    )
  }

  const tocItems = getMonthTocItems(fieldNotes, fieldImages)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle title={`${centre.centre_name} - Learning Center`} />

      <div className="flex gap-12 items-start">
        <div className="flex-1 max-w-3xl min-w-0">
          <div className="sticky top-0 bg-background py-2 z-20">
            <h1 className="text-2xl text-foreground">{centre.centre_name}</h1>
            <p className="text-muted-foreground">
              {locationParts(centre)}
            </p>
          </div>

          <div className="mb-10 mt-2">
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              {centre.facilitators && centre.facilitators.length > 0 && (
                <div>
                  <span className="text-muted-foreground">
                    Facilitator{centre.facilitators.length > 1 ? 's' : ''}:
                  </span>{' '}
                  {centre.facilitators.map((f) => f.name).join(', ')}
                </div>
              )}

              {centre.partner_organisations && centre.partner_organisations.length > 0 && (
                <div>
                  <span className="text-muted-foreground">
                    Partner{centre.partner_organisations.length > 1 ? 's' : ''}:
                  </span>{' '}
                  {centre.partner_organisations.map((o) => o.name).join(', ')}
                </div>
              )}

              <div>
                <span className="text-muted-foreground">Started:</span>{' '}
                {new Date(centre.start_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                {centre.end_date && (
                  <>
                    {' '}&middot;{' '}
                    <span className="text-muted-foreground">Ended:</span>{' '}
                    {new Date(centre.end_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </>
                )}
              </div>
            </div>
          </div>

          <LearningCentreTimeline
            fieldNotes={fieldNotes}
            fieldImages={fieldImages}
            facilitators={centre.facilitators || []}
          />
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
