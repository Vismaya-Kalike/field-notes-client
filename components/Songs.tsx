'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Song } from '../types/database'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Skeleton } from './ui/skeleton'
import { Input } from './ui/input'
import { PageTitle } from './PageTitle'
import { Music, Search } from 'lucide-react'

function SongCard({ song, onClick }: { song: Song; onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-all hover:bg-accent hover:shadow-md"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-sm font-medium text-muted-foreground shrink-0">
            {song.song_number}
          </span>
          <div className="min-w-0">
            <CardTitle className="text-base line-clamp-1">{song.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-1">{song.title_en}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {song.pedagogical_purpose && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {song.pedagogical_purpose}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function Songs() {
  const router = useRouter()
  const locale = useLocale()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: songs = [], isLoading, error } = useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('song_number', { ascending: true })

      if (error) throw error
      return (data || []) as Song[]
    },
  })

  const filteredSongs = songs.filter(song => {
    if (searchTerm === '') return true
    const term = searchTerm.toLowerCase()
    return (
      song.title.toLowerCase().includes(term) ||
      song.title_en.toLowerCase().includes(term) ||
      song.pedagogical_purpose?.toLowerCase().includes(term)
    )
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
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
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
          Error loading songs: {(error as Error).message}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle title="Songs" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Music className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-3xl text-foreground">Songs</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          A collection of {songs.length} Kannada songs for joyful learning
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search songs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Showing {filteredSongs.length} of {songs.length} songs
      </p>

      {filteredSongs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No songs found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onClick={() => router.push(`/${locale}/resources/songs/${song.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
