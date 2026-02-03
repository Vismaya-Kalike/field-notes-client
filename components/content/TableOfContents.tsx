'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  items: TocItem[]
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const rafRef = useRef<number | null>(null)
  const resizeTimeoutRef = useRef<number | null>(null)

  const updateActive = useCallback(() => {
    if (items.length === 0) return

    const VIEWPORT_TOP_OFFSET_PX = 220

    const scrolledToBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100

    if (scrolledToBottom) {
      const lastItem = items[items.length - 1]
      setActiveId((prev) => (prev === lastItem.id ? prev : lastItem.id))
      return
    }

    let nextActive: string | null = null
    for (const item of items) {
      const el = document.getElementById(item.id)
      if (!el) continue
      const top = el.getBoundingClientRect().top
      if (top <= VIEWPORT_TOP_OFFSET_PX) nextActive = item.id
      else break
    }

    if (!nextActive) nextActive = items[0]?.id ?? null

    setActiveId((prev) => (prev === nextActive ? prev : nextActive))
  }, [items])

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current != null) return
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        updateActive()
      })
    }

    const onResize = () => {
      if (resizeTimeoutRef.current != null) {
        window.clearTimeout(resizeTimeoutRef.current)
      }
      resizeTimeoutRef.current = window.setTimeout(() => {
        resizeTimeoutRef.current = null
        updateActive()
      }, 120)
    }

    Promise.resolve().then(updateActive)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current)
      if (resizeTimeoutRef.current != null) {
        window.clearTimeout(resizeTimeoutRef.current)
      }
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [updateActive])

  if (items.length === 0) return null

  return (
    <nav className="hidden lg:block fixed right-4 top-24 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h3 className="text-sm mb-4 text-foreground">On this page</h3>
      <ul className="space-y-2 text-sm">
        {items.map((item) => {
          const isActive = item.id === activeId
          return (
            <li
              key={item.id}
              style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveId(item.id)
                  document.getElementById(item.id)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }}
                aria-current={isActive ? 'location' : undefined}
                className={`block py-1 transition-all ${
                  isActive
                    ? 'text-foreground opacity-100'
                    : 'text-foreground opacity-40 hover:opacity-70'
                }`}
              >
                {item.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
