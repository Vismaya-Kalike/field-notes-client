'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Masonry from 'react-masonry-css'
import { useLocale } from 'next-intl'
import { useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'

interface FieldImageRow {
  id: string
  photo_url: string
  caption: string | null
  learning_centre_id: string
  state: string
  district: string
  sent_at: string | null
}


const PAGE_SIZE = 20

export function PhotoGallery() {
  const locale = useLocale()
  const [seed] = useState(() => Math.random().toString(36).slice(2))
  const sentinelRef = useRef<HTMLDivElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['random-field-images', seed],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .rpc('get_random_field_images', {
          limit_count: PAGE_SIZE,
          offset_count: pageParam,
          seed,
        })

      if (error) throw error
      return (data || []) as FieldImageRow[]
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return allPages.length * PAGE_SIZE
    },
  })

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '400px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const images = data?.pages.flat() ?? []

  if (isLoading) {
    return (
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
        {[...Array(12)].map((_, i) => (
          <Skeleton
            key={i}
            className="mb-3 rounded-lg"
            style={{ height: `${150 + (i % 3) * 80}px` }}
          />
        ))}
      </div>
    )
  }

  if (images.length === 0) return null

  return (
    <div>
      <Masonry
        breakpointCols={{ default: 4, 1024: 3, 640: 2 }}
        className="flex -ml-1.5"
        columnClassName="pl-1.5 space-y-1.5"
      >
        {images.map((img) => (
          <Link
            key={img.id}
            href={`/${locale}/learning-centers/${encodeURIComponent(img.state)}/${encodeURIComponent(img.district)}/${img.learning_centre_id}#image-${img.id}`}
            className="block overflow-hidden rounded"
          >
            <Image
              src={img.photo_url}
              alt={img.caption || 'Photo from a learning centre'}
              width={400}
              height={300}
              className="object-cover w-full h-auto transition-transform hover:scale-105"
              unoptimized
            />
          </Link>
        ))}
      </Masonry>

      <div ref={sentinelRef} className="h-1" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 border-2 border-vika-teal border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
