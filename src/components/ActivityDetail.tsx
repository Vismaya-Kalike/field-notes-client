import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Activity } from '../types/database'
import { Skeleton } from './ui/skeleton'
import { PageTitle } from './PageTitle'
import {
  ArrowLeft,
  Users,
  MapPin,
  RefreshCw,
  Package,
  Brain,
  Sparkles,
  Target,
  Lightbulb,
  PlayCircle,
  CheckCircle2
} from 'lucide-react'

function ConstraintIndicator({
  icon: Icon,
  label,
  value,
  positiveValue,
  positiveText,
  negativeText,
  textClass,
  bgClass,
}: {
  icon: React.ElementType
  label: string
  value: number
  positiveValue: number
  positiveText: string
  negativeText: string
  textClass: string
  bgClass: string
}) {
  const isPositive = value === positiveValue

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${
      isPositive
        ? `${bgClass} border-border`
        : 'bg-transparent border-dashed border-border'
    }`}>
      <Icon className={`h-5 w-5 flex-shrink-0 ${isPositive ? textClass : 'text-muted-foreground/50'}`} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm ${isPositive ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
          {isPositive ? positiveText : negativeText}
        </p>
      </div>
    </div>
  )
}

export default function ActivityDetail() {
  const { activityId } = useParams<{ activityId: string }>()

  const { data: activity, isLoading, error } = useQuery({
    queryKey: ['activity', activityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single()

      if (error) throw error
      return data as Activity
    },
    enabled: !!activityId,
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-6 w-24 mb-8" />
        <div className="max-w-3xl">
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-6 w-32 mb-3" />
          <Skeleton className="h-24 w-full mb-6" />
          <Skeleton className="h-6 w-32 mb-3" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (error || !activity) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/resources/activities"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Activities
        </Link>
        <div className="text-center text-destructive">
          {error ? `Error: ${(error as Error).message}` : 'Activity not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle title={activity.name} />

      {/* Back link */}
      <Link
        to="/resources/activities"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Activities
      </Link>

      {/* Content */}
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{activity.name}</h1>
          {activity.category && (
            <span className="inline-block px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">
              {activity.category}
            </span>
          )}
        </div>

      {/* Constraint Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <ConstraintIndicator
          icon={Users}
          label="Facilitator"
          value={activity.facilitator_constraint}
          positiveValue={0}
          positiveText="Independent play"
          negativeText="Needs facilitation"
          textClass="text-vika-amber"
          bgClass="bg-vika-amber/10"
        />
        <ConstraintIndicator
          icon={MapPin}
          label="Space"
          value={activity.space_constraint}
          positiveValue={0}
          positiveText="Small space is fine"
          negativeText="Large space needed"
          textClass="text-vika-violet"
          bgClass="bg-vika-violet/10"
        />
        <ConstraintIndicator
          icon={RefreshCw}
          label="Repeatability"
          value={activity.repeat_constraint}
          positiveValue={1}
          positiveText="Highly repeatable"
          negativeText="Limited replay"
          textClass="text-vika-coral"
          bgClass="bg-vika-coral/10"
        />
        <ConstraintIndicator
          icon={Brain}
          label="Prior Knowledge"
          value={activity.knowledge_constraint}
          positiveValue={0}
          positiveText="No prerequisites"
          negativeText="Knowledge required"
          textClass="text-vika-sky"
          bgClass="bg-vika-sky/10"
        />
        <ConstraintIndicator
          icon={Package}
          label="Materials"
          value={activity.material_constraint}
          positiveValue={0}
          positiveText="Basic/no materials"
          negativeText="Specific materials needed"
          textClass="text-vika-yellow"
          bgClass="bg-vika-yellow/10"
        />
        <ConstraintIndicator
          icon={Sparkles}
          label="New Learning"
          value={activity.exposure_to_new_topics}
          positiveValue={1}
          positiveText="Introduces new concepts"
          negativeText="Reinforces existing"
          textClass="text-vika-teal"
          bgClass="bg-vika-teal/10"
        />
      </div>

      {/* Activity Details */}
      <div className="space-y-8">
        {/* Materials */}
        {activity.materials_required && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Materials Required</h2>
            </div>
            <p className="text-muted-foreground pl-7">{activity.materials_required}</p>
          </section>
        )}

        {/* Objective */}
        {activity.objective && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Objective</h2>
            </div>
            <p className="text-muted-foreground pl-7">{activity.objective}</p>
          </section>
        )}

        {/* How to Play */}
        {activity.how_to_play && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <PlayCircle className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">How to Play</h2>
            </div>
            <div className="pl-7 text-muted-foreground whitespace-pre-line">
              {activity.how_to_play}
            </div>
          </section>
        )}

        {/* Outcome */}
        {activity.outcome && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Learning Outcome</h2>
            </div>
            <p className="text-muted-foreground pl-7">{activity.outcome}</p>
          </section>
        )}

        {/* Tags */}
        {activity.tags && activity.tags.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Tags</h2>
            </div>
            <div className="flex flex-wrap gap-2 pl-7">
              {activity.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
      </div>
    </div>
  )
}
