'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import { DarkModeToggle } from './ui/dark-mode-toggle'
import { ChevronRight, Menu, X } from 'lucide-react'
import Image from 'next/image'

export interface NavItem {
  title: string
  href?: string
  order?: number
  children?: NavItem[]
  type?: 'separator' | 'link'
  _pageId?: string
}

function NavGroup({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname()
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(() => {
    if (item.children) {
      return item.children.some(child =>
        child.href && pathname === `/${locale}${child.href}`
      )
    }
    return false
  })

  if (item.type === 'separator') {
    return <div className="my-2 border-t border-border" />
  }

  const hasChildren = item.children && item.children.length > 0

  if (!hasChildren && item.href) {
    const fullHref = `/${locale}${item.href}`
    const isActive = pathname === fullHref
    return (
      <Link
        href={fullHref}
        className={cn(
          "block px-3 py-1.5 text-sm rounded-md transition-colors",
          isActive
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
      >
        {item.title}
      </Link>
    )
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-colors",
          "hover:bg-accent",
          isOpen ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <span>{item.title}</span>
        <ChevronRight
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
      </button>

      {isOpen && (
        <div className="ml-3 pl-3 border-l border-border space-y-1">
          {item.children?.map((child, idx) => (
            <NavGroup key={idx} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function LanguageSwitcher() {
  const pathname = usePathname()
  const locale = useLocale()

  const pathWithoutLocale = pathname.replace(/^\/(en|kn)/, '')

  return (
    <div className="flex gap-2">
      <Link
        href={`/en${pathWithoutLocale}`}
        className={cn(
          "px-2 py-1 text-xs rounded transition-colors",
          locale === 'en'
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        English
      </Link>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "px-2 py-1 text-xs rounded opacity-50 cursor-not-allowed",
            "text-muted-foreground"
          )}
        >
          ಕನ್ನಡ
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
          Coming Soon
        </span>
      </div>
    </div>
  )
}

interface SidebarProps {
  className?: string
  navigation: NavItem[]
}

export function Sidebar({ className, navigation }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const locale = useLocale()

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border border-border shadow-sm hover:bg-accent transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 lg:z-0",
          "h-screen w-64 bg-sidebar",
          "border-r border-sidebar-border",
          "flex flex-col",
          "transform transition-transform duration-200 lg:transform-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Header */}
        <div className="shrink-0 px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <Link href={`/${locale}/`} className="block">
              <Image
                height={400}
                width={200}
                src="/logo_with_text.png"
                alt="Vismaya Kalike"
                className="h-10 w-auto dark:invert"
              />
            </Link>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-sidebar-accent transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {navigation.map((item, idx) => (
            <NavGroup key={idx} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 px-4 py-3 border-t border-sidebar-border space-y-3">
          <LanguageSwitcher />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">v1.0.0</p>
            <DarkModeToggle />
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
