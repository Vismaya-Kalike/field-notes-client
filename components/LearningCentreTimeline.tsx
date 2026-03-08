'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Masonry from 'react-masonry-css'
import type { FieldNote, FieldImage, Facilitator } from '@/types/database'

interface TimelineEntry {
  id: string
  type: 'note' | 'image'
  date: string
  facilitatorId: string | null | undefined
  text?: string
  aiCommentary?: string | null
  photoUrl?: string
  caption?: string
}

interface LearningCentreTimelineProps {
  fieldNotes: FieldNote[]
  fieldImages: FieldImage[]
  facilitators: Facilitator[]
}

function mergeAndSort(notes: FieldNote[], images: FieldImage[]): TimelineEntry[] {
  const noteEntries: TimelineEntry[] = notes.map((note) => ({
    id: note.id,
    type: 'note',
    date: note.sent_at || note.created_at,
    facilitatorId: note.facilitator_id,
    text: note.sanitized_text || note.text,
    aiCommentary: note.ai_commentary,
  }))

  const imageEntries: TimelineEntry[] = images.map((image) => ({
    id: image.id,
    type: 'image',
    date: image.sent_at || image.created_at,
    facilitatorId: image.facilitator_id,
    photoUrl: image.photo_url,
    caption: image.caption,
  }))

  return [...noteEntries, ...imageEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

function groupByMonth(entries: TimelineEntry[]): Map<string, TimelineEntry[]> {
  const groups = new Map<string, TimelineEntry[]>()

  for (const entry of entries) {
    const date = new Date(entry.date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const existing = groups.get(key)
    if (existing) {
      existing.push(entry)
    } else {
      groups.set(key, [entry])
    }
  }

  return groups
}

function formatMonthYear(key: string): string {
  const [year, month] = key.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

function monthId(key: string): string {
  return `month-${key}`
}

export function getMonthTocItems(
  fieldNotes: FieldNote[],
  fieldImages: FieldImage[],
): { id: string; text: string; level: number }[] {
  const sorted = mergeAndSort(fieldNotes, fieldImages)
  const grouped = groupByMonth(sorted)
  return Array.from(grouped.keys()).map((key) => ({
    id: monthId(key),
    text: formatMonthYear(key),
    level: 2,
  }))
}

type TimelineBlock =
  | { kind: 'note'; entry: TimelineEntry }
  | { kind: 'image'; entry: TimelineEntry }
  | { kind: 'image-cluster'; entries: TimelineEntry[]; date: string; facilitatorId: string | null | undefined }

function getDayKey(dateStr: string): string {
  return new Date(dateStr).toISOString().slice(0, 10)
}

function clusterEntries(entries: TimelineEntry[]): TimelineBlock[] {
  const blocks: TimelineBlock[] = []
  let i = 0

  while (i < entries.length) {
    const entry = entries[i]

    if (entry.type === 'note') {
      blocks.push({ kind: 'note', entry })
      i++
      continue
    }

    const dayKey = getDayKey(entry.date)
    const cluster: TimelineEntry[] = [entry]
    let j = i + 1
    while (j < entries.length && entries[j].type === 'image' && getDayKey(entries[j].date) === dayKey) {
      cluster.push(entries[j])
      j++
    }

    if (cluster.length === 1) {
      blocks.push({ kind: 'image', entry })
    } else {
      blocks.push({ kind: 'image-cluster', entries: cluster, date: entry.date, facilitatorId: entry.facilitatorId })
    }
    i = j
  }

  return blocks
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function NoteBlock({ entry, facilitatorMap }: { entry: TimelineEntry; facilitatorMap: Map<string, string> }) {
  return (
    <div className="relative">
      <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-vika-teal border-2 border-background" />
      <div className="text-xs text-muted-foreground mb-1">
        {formatDate(entry.date)}
        {entry.facilitatorId && facilitatorMap.has(entry.facilitatorId) && (
          <span> &middot; {facilitatorMap.get(entry.facilitatorId)}</span>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-sm text-foreground whitespace-pre-wrap">{entry.text}</p>
        {entry.aiCommentary && (
          <div className="text-sm text-muted-foreground bg-muted rounded-md p-3 italic">
            {entry.aiCommentary}
          </div>
        )}
      </div>
    </div>
  )
}

function SingleImageBlock({ entry, facilitatorMap }: { entry: TimelineEntry; facilitatorMap: Map<string, string> }) {
  return (
    <div id={`image-${entry.id}`} className="relative scroll-mt-24">
      <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-vika-teal border-2 border-background" />
      <div className="text-xs text-muted-foreground mb-1">
        {formatDate(entry.date)}
        {entry.facilitatorId && facilitatorMap.has(entry.facilitatorId) && (
          <span> &middot; {facilitatorMap.get(entry.facilitatorId)}</span>
        )}
      </div>
      <div className="relative w-full max-w-md overflow-hidden rounded-lg">
        <Image
          src={entry.photoUrl!}
          alt={entry.caption || 'Field image'}
          width={400}
          height={300}
          className="object-cover w-full h-auto"
          unoptimized
        />
      </div>
      {entry.caption && (
        <p className="text-sm text-muted-foreground mt-1">{entry.caption}</p>
      )}
    </div>
  )
}

function ImageClusterBlock({
  entries,
  date,
  facilitatorId,
  facilitatorMap,
}: {
  entries: TimelineEntry[]
  date: string
  facilitatorId: string | null | undefined
  facilitatorMap: Map<string, string>
}) {
  return (
    <div className="relative">
      <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-vika-teal border-2 border-background" />
      <div className="text-xs text-muted-foreground mb-2">
        {formatDay(date)} &middot; {entries.length} photos
        {facilitatorId && facilitatorMap.has(facilitatorId) && (
          <span> &middot; {facilitatorMap.get(facilitatorId)}</span>
        )}
      </div>
      <Masonry
        breakpointCols={{ default: 3, 640: 2 }}
        className="flex gap-2 -ml-2"
        columnClassName="pl-2 space-y-2"
      >
        {entries.map((img) => (
          <div key={img.id} id={`image-${img.id}`} className="overflow-hidden rounded-lg scroll-mt-24">
            <Image
              src={img.photoUrl!}
              alt={img.caption || 'Field image'}
              width={300}
              height={225}
              className="object-cover w-full h-auto"
              unoptimized
            />
          </div>
        ))}
      </Masonry>
      {entries.some((img) => img.caption) && (
        <div className="mt-3 space-y-1">
          {entries.filter((img) => img.caption).map((img) => (
            <p key={img.id} className="text-xs text-muted-foreground">{img.caption}</p>
          ))}
        </div>
      )}
    </div>
  )
}

export function LearningCentreTimeline({ fieldNotes, fieldImages, facilitators }: LearningCentreTimelineProps) {
  const facilitatorMap = new Map(facilitators.map((f) => [f.id, f.name]))
  const sorted = mergeAndSort(fieldNotes, fieldImages)
  const grouped = groupByMonth(sorted)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const hasScrolled = useRef(false)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return

    // Prevent browser's instant scroll to hash
    window.scrollTo(0, 0)
    history.replaceState(null, '', ' ')
    // Restore hash without triggering scroll
    history.replaceState(null, '', `#${hash}`)
  }, [])

  useEffect(() => {
    if (hasScrolled.current || sorted.length === 0) return
    const hash = window.location.hash.slice(1)
    if (!hash) return

    // Small delay to ensure layout is painted
    requestAnimationFrame(() => {
      const el = document.getElementById(hash)
      if (el) {
        hasScrolled.current = true
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }, [sorted.length])

  if (sorted.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No field notes or images yet.
      </div>
    )
  }

  const toggleMonth = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <div className="space-y-10">
      {Array.from(grouped.entries()).map(([monthKey, entries]) => {
        const blocks = clusterEntries(entries)
        const isCollapsed = collapsed.has(monthKey)

        return (
          <section key={monthKey}>
            <h2
              id={monthId(monthKey)}
              className="text-lg text-foreground mb-4 sticky top-[56px] bg-background py-2 z-10 scroll-mt-[76px] cursor-pointer select-none flex items-center gap-2"
              onClick={() => toggleMonth(monthKey)}
            >
              <span className={`inline-block transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>
                ▾
              </span>
              {formatMonthYear(monthKey)}
              <span className="text-sm text-muted-foreground font-normal">
                ({entries.length})
              </span>
            </h2>

            {!isCollapsed && (
              <div className="relative border-l-2 border-border ml-3 space-y-6 pl-6">
                {blocks.map((block) => {
                  if (block.kind === 'note') {
                    return <NoteBlock key={block.entry.id} entry={block.entry} facilitatorMap={facilitatorMap} />
                  }
                  if (block.kind === 'image') {
                    return <SingleImageBlock key={block.entry.id} entry={block.entry} facilitatorMap={facilitatorMap} />
                  }
                  return (
                    <ImageClusterBlock
                      key={block.entries[0].id}
                      entries={block.entries}
                      date={block.date}
                      facilitatorId={block.facilitatorId}
                      facilitatorMap={facilitatorMap}
                    />
                  )
                })}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
