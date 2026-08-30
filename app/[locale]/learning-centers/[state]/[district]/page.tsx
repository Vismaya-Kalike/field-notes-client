'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { LearningCentre } from '@/types/database'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageTitle } from '@/components/PageTitle'

function CentreCard({
  centre,
  state,
  district,
  locale,
  router,
  inactive,
}: {
  centre: LearningCentre
  state: string
  district: string
  locale: string
  router: AppRouterInstance
  inactive?: boolean
}) {
  const activeFacilitators = centre.facilitators?.filter((f) => f.active !== false) ?? []

  return (
    <Card
      onClick={() => router.push(`/${locale}/learning-centers/${encodeURIComponent(state)}/${encodeURIComponent(district)}/${centre.id}`)}
      className={`cursor-pointer transition-colors hover:bg-accent ${inactive ? 'opacity-60' : ''}`}
    >
      <CardHeader>
        <CardTitle className="text-lg">{centre.centre_name}</CardTitle>
        <CardDescription>
          {centre.area && `${centre.area}, `}{centre.city}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {inactive && centre.status_description && (
          <p className="text-sm text-muted-foreground italic">{centre.status_description}</p>
        )}

        {activeFacilitators.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Facilitator{activeFacilitators.length > 1 ? 's' : ''}
            </p>
            <div className="space-y-1">
              {activeFacilitators.map((facilitator) => (
                <p key={facilitator.id} className="text-sm">
                  {facilitator.name}
                </p>
              ))}
            </div>
          </div>
        )}

        {centre.partner_organisations && centre.partner_organisations.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Partner Organisation{centre.partner_organisations.length > 1 ? 's' : ''}
            </p>
            <div className="space-y-1">
              {centre.partner_organisations.map((org) => (
                <p key={org.id} className="text-sm">
                  {org.name}
                </p>
              ))}
            </div>
          </div>
        )}

        {centre.donors && centre.donors.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Supported by
            </p>
            <p className="text-sm">
              {centre.donors.map((d) => d.name).join(', ')}
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2">
          <p>Started: {new Date(centre.start_date).toLocaleDateString()}</p>
          {centre.end_date && (
            <p>Ended: {new Date(centre.end_date).toLocaleDateString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface PageProps {
  params: Promise<{
    state: string
    district: string
  }>
}

export default function DistrictLearningCentresPage({ params }: PageProps) {
  const { state: stateParam, district: districtParam } = use(params)
  const state = decodeURIComponent(stateParam)
  const district = decodeURIComponent(districtParam)
  const router = useRouter()
  const locale = useLocale()

  const { data: learningCentres = [], isLoading, error } = useQuery({
    queryKey: ['learning-centres', state, district],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_centres_by_district')
        .select('id, centre_name, area, city, district, state, start_date, end_date, status, status_description, facilitators, partner_organisations, donors')
        .eq('state', state)
        .eq('district', district)
        .order('centre_name', { ascending: true })

      if (error) throw error

      return (data || []) as LearningCentre[]
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
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
          Error loading learning centres: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle title={`${district}, ${state} - Learning Centers`} />
      <div className="mb-6">
        <h1 className="text-2xl text-foreground">{district}</h1>
        <p className="text-muted-foreground">{state}</p>
      </div>

      {learningCentres.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No learning centres found in this district.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningCentres.filter((c) => c.status !== 'inactive').map((centre) => (
              <CentreCard key={centre.id} centre={centre} state={state} district={district} locale={locale} router={router} />
            ))}
          </div>

          {learningCentres.some((c) => c.status === 'inactive') && (
            <div className="mt-12">
              <h2 className="text-lg text-muted-foreground mb-4">Inactive Centres</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningCentres.filter((c) => c.status === 'inactive').map((centre) => (
                  <CentreCard key={centre.id} centre={centre} state={state} district={district} locale={locale} router={router} inactive />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
