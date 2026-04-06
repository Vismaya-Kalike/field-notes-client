'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Song } from '../types/database'
import { Skeleton } from './ui/skeleton'
import { PageTitle } from './PageTitle'
import { ArrowLeft, Music, User, BookOpen, Info } from 'lucide-react'

export default function SongDetail() {
  const params = useParams()
  const locale = useLocale()
  const songId = params?.songId as string

  const { data: song, isLoading, error } = useQuery({
    queryKey: ['song', songId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', songId)
        .single()

      if (error) throw error
      return data as Song
    },
    enabled: !!songId,
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-6 w-24 mb-8" />
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (error || !song) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`/${locale}/resources/songs`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Songs
        </Link>
        <div className="text-center text-destructive">
          {error ? `Error: ${(error as Error).message}` : 'Song not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle title={song.title_en} />

      <Link
        href={`/${locale}/resources/songs`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Songs
      </Link>

      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-1">Song {song.song_number}</p>
          <h1 className="text-3xl text-foreground mb-1">{song.title}</h1>
          <p className="text-xl text-muted-foreground">{song.title_en}</p>
        </div>

        <div className="space-y-8">
          {song.author && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg text-foreground">Author</h2>
              </div>
              <p className="text-muted-foreground pl-7">{song.author}</p>
            </section>
          )}

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Music className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg text-foreground">Lyrics</h2>
            </div>
            <div className="pl-7 text-lg leading-relaxed whitespace-pre-line">
              {song.lyrics}
            </div>
          </section>

          {song.pedagogical_purpose && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg text-foreground">Pedagogical Purpose</h2>
              </div>
              <p className="text-muted-foreground pl-7">{song.pedagogical_purpose}</p>
            </section>
          )}

          {song.notes && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg text-foreground">Notes</h2>
              </div>
              <p className="text-muted-foreground pl-7">{song.notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
