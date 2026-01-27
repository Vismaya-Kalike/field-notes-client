'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Activity } from '../types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Skeleton } from './ui/skeleton'
import { Input } from './ui/input'
import { PageTitle } from './PageTitle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Book, Users, MapPin, RefreshCw, Package, Brain, Sparkles, Search, Filter, X } from 'lucide-react'

const CONSTRAINT_ICONS: Record<string, React.ElementType> = {
  facilitator: Users,
  space: MapPin,
  repeat: RefreshCw,
  material: Package,
  knowledge: Brain,
  exposure: Sparkles,
}

interface ConstraintFilter {
  key: string
  label: string
  description: string
  icon: React.ElementType
  positiveValue: 0 | 1
}

const CONSTRAINT_FILTERS: Record<string, ConstraintFilter> = {
  facilitator: {
    key: 'facilitator',
    label: 'Independent',
    description: 'No facilitator needed',
    icon: Users,
    positiveValue: 0,
  },
  space: {
    key: 'space',
    label: 'Small space',
    description: 'Works in small spaces',
    icon: MapPin,
    positiveValue: 0,
  },
  material: {
    key: 'material',
    label: 'Minimal materials',
    description: 'Basic or no materials needed',
    icon: Package,
    positiveValue: 0,
  },
  repeat: {
    key: 'repeat',
    label: 'Repeatable',
    description: 'Can be played many times',
    icon: RefreshCw,
    positiveValue: 1,
  },
  knowledge: {
    key: 'knowledge',
    label: 'No prerequisites',
    description: 'No prior knowledge required',
    icon: Brain,
    positiveValue: 0,
  },
  exposure: {
    key: 'exposure',
    label: 'New concepts',
    description: 'Introduces new topics',
    icon: Sparkles,
    positiveValue: 1,
  },
}

function FilterButton({
  filter,
  isActive,
  onToggle,
}: {
  filter: ConstraintFilter
  isActive: boolean
  onToggle: () => void
}) {
  const Icon = filter.icon

  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors ${
        isActive
          ? 'bg-vika-teal/20 border-vika-teal text-vika-teal'
          : 'bg-background border-border text-muted-foreground hover:bg-accent'
      }`}
      title={filter.description}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{filter.label}</span>
    </button>
  )
}

function ConstraintBadge({
  type,
  value,
  label
}: {
  type: keyof typeof CONSTRAINT_ICONS
  value: number
  label: string
}) {
  const Icon = CONSTRAINT_ICONS[type]
  const filter = CONSTRAINT_FILTERS[type]
  const isPositive = filter ? value === filter.positiveValue : false

  const getColorClasses = () => {
    if (!isPositive) return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
    switch (type) {
      case 'facilitator': return 'bg-vika-amber/20 text-vika-amber'
      case 'space': return 'bg-vika-violet/20 text-vika-violet'
      case 'repeat': return 'bg-vika-coral/20 text-vika-coral'
      case 'material': return 'bg-vika-yellow/20 text-vika-yellow'
      case 'knowledge': return 'bg-vika-sky/20 text-vika-sky'
      case 'exposure': return 'bg-vika-teal/20 text-vika-teal'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getColorClasses()}`}
      title={label}
    >
      <Icon className="h-3 w-3" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

function ActivityCard({ activity, onClick }: { activity: Activity; onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-all hover:bg-accent hover:shadow-md"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium line-clamp-1">
          {activity.name}
        </CardTitle>
        {activity.category && (
          <CardDescription className="text-xs">
            {activity.category}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {activity.objective && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {activity.objective}
          </p>
        )}
        <div className="flex flex-wrap gap-1">
          <ConstraintBadge
            type="facilitator"
            value={activity.facilitator_constraint}
            label={activity.facilitator_constraint ? "Needs facilitator" : "Independent"}
          />
          <ConstraintBadge
            type="space"
            value={activity.space_constraint}
            label={activity.space_constraint ? "Large space" : "Small space"}
          />
          <ConstraintBadge
            type="repeat"
            value={activity.repeat_constraint}
            label={activity.repeat_constraint ? "Highly repeatable" : "Limited replay"}
          />
          <ConstraintBadge
            type="knowledge"
            value={activity.knowledge_constraint}
            label={activity.knowledge_constraint ? "Knowledge required" : "No prerequisites"}
          />
          <ConstraintBadge
            type="material"
            value={activity.material_constraint}
            label={activity.material_constraint ? "Specific materials" : "Basic/no materials"}
          />
          <ConstraintBadge
            type="exposure"
            value={activity.exposure_to_new_topics}
            label={activity.exposure_to_new_topics ? "New concepts" : "Reinforces existing"}
          />
        </div>
      </CardContent>
    </Card>
  )
}

type ConstraintFilters = {
  facilitator: boolean
  space: boolean
  material: boolean
  repeat: boolean
  knowledge: boolean
  exposure: boolean
}

const initialFilters: ConstraintFilters = {
  facilitator: false,
  space: false,
  material: false,
  repeat: false,
  knowledge: false,
  exposure: false,
}

export default function Activities() {
  const router = useRouter()
  const locale = useLocale()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [constraintFilters, setConstraintFilters] = useState<ConstraintFilters>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)

  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return (data || []) as Activity[]
    },
  })

  const categories = [...new Set(activities.map(a => a.category).filter(Boolean))]

  const hasActiveFilters = Object.values(constraintFilters).some(v => v === true)

  const clearFilters = () => {
    setConstraintFilters(initialFilters)
    setCategoryFilter('all')
    setSearchTerm('')
  }

  const toggleFilter = (key: keyof ConstraintFilters) => {
    setConstraintFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = searchTerm === '' ||
      activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.objective?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = categoryFilter === '' || categoryFilter === 'all' || activity.category === categoryFilter

    const matchesFacilitator = !constraintFilters.facilitator ||
      activity.facilitator_constraint === CONSTRAINT_FILTERS.facilitator.positiveValue
    const matchesSpace = !constraintFilters.space ||
      activity.space_constraint === CONSTRAINT_FILTERS.space.positiveValue
    const matchesMaterial = !constraintFilters.material ||
      activity.material_constraint === CONSTRAINT_FILTERS.material.positiveValue
    const matchesRepeat = !constraintFilters.repeat ||
      activity.repeat_constraint === CONSTRAINT_FILTERS.repeat.positiveValue
    const matchesKnowledge = !constraintFilters.knowledge ||
      activity.knowledge_constraint === CONSTRAINT_FILTERS.knowledge.positiveValue
    const matchesExposure = !constraintFilters.exposure ||
      activity.exposure_to_new_topics === CONSTRAINT_FILTERS.exposure.positiveValue

    return matchesSearch && matchesCategory &&
      matchesFacilitator && matchesSpace && matchesMaterial &&
      matchesRepeat && matchesKnowledge && matchesExposure
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-6 w-96 mb-8" />
        <Skeleton className="h-32 w-full mb-8 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-full mb-3" />
                <div className="flex gap-1">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
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
          Error loading activities: {(error as Error).message}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle title="Activities" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Book className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-3xl font-bold text-foreground">Activities</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          A collection of {activities.length} activities for joyful learning in self-directed spaces
        </p>
      </div>

      <p className="text-muted-foreground mb-8 max-w-3xl">
        A collection of engaging activities designed for joyful learning in self-directed spaces.
        Each activity is tagged with constraints to help you find the right fit for your space,
        materials, and facilitation style. Click on any activity to see full details including
        instructions, learning outcomes, and required materials.
      </p>

      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <Filter className="h-4 w-4" />
          <span>Filter by constraints</span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-primary text-primary-foreground">
              Active
            </span>
          )}
        </button>

        {showFilters && (
          <div className="p-4 rounded-lg border border-border bg-card mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">
                Show only activities that meet these criteria.{' '}
                <a
                  href={`/${locale}/blog/framework-for-evaluating-learning-activities`}
                  className="hover:underline"
                >
                  Learn more
                </a>
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CONSTRAINT_FILTERS).map(([key, filter]) => (
                <FilterButton
                  key={key}
                  filter={filter}
                  isActive={constraintFilters[key as keyof ConstraintFilters]}
                  onToggle={() => toggleFilter(key as keyof ConstraintFilters)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search activities..."
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
        Showing {filteredActivities.length} of {activities.length} activities
      </p>

      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No activities found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onClick={() => router.push(`/${locale}/resources/activities/${activity.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
