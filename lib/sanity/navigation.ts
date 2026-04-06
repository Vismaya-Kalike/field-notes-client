import { client } from './client'
import { allPagesQuery } from './queries'
import type { Locale } from '@/i18n'

export interface NavItem {
  title: string
  href?: string
  order: number
  children?: NavItem[]
  type?: 'separator' | 'link'
  _pageId?: string
}

interface SanityPage {
  _id: string
  slug: { current: string }
  order: number
  navigationOnly?: boolean
  parentPage?: {
    _id: string
    slug: { current: string }
  }
  en: { title: string }
  kn: { title: string }
}

export async function getNavigation(locale: Locale): Promise<NavItem[]> {
  const pages = await client.fetch<SanityPage[]>(allPagesQuery)
  
  // Build a map of pages by ID for easy lookup
  const pagesById = new Map<string, SanityPage>()
  pages.forEach(page => pagesById.set(page._id, page))
  
  // Build navigation tree
  const navTree: NavItem[] = []
  const childrenMap = new Map<string, NavItem[]>()
  
  // First pass: create nav items and group by parent
  pages.forEach(page => {
    const navItem: NavItem = {
      title: page[locale]?.title || page.en.title,
      order: page.order || 0,
      _pageId: page._id,
    }

    // Only add href if this is an actual page (not navigation-only)
    if (!page.navigationOnly) {
      navItem.href = `/${page.slug.current}`
    }
    
    if (page.parentPage) {
      // This is a child page
      const parentId = page.parentPage._id
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, [])
      }
      childrenMap.get(parentId)!.push(navItem)
    } else {
      // This is a top-level page
      navTree.push(navItem)
    }
  })
  
  // Second pass: attach children to their parents
  function attachChildren(item: NavItem, pageId: string) {
    const children = childrenMap.get(pageId)
    if (children && children.length > 0) {
      item.children = children.sort((a, b) => a.order - b.order)
      
      // Recursively attach children's children
      children.forEach(child => {
        if (child._pageId) {
          attachChildren(child, child._pageId)
        }
      })
    }
  }

  navTree.forEach(item => {
    if (item._pageId) {
      attachChildren(item, item._pageId)
    }
  })
  
  // Add custom navigation items
  const customItems: NavItem[] = [
    {
      title: 'Learning Centers',
      href: '/learning-centers',
      order: 1000,
    },
    {
      title: 'Resources',
      order: 1001,
      children: [
        {
          title: 'Activities',
          href: '/resources/activities',
          order: 0,
        },
        {
          title: 'Songs',
          href: '/resources/songs',
          order: 1,
        },
        {
          title: 'Science Experiments',
          href: '/resources/experiments',
          order: 2,
        },
        {
          title: 'Reading List',
          href: '/resources/reading-list',
          order: 3,
        },
      ],
    },
    {
      title: 'Donate',
      href: '/donate',
      order: 1002,
    },
    {
      title: 'Contact Us',
      href: '/contact',
      order: 1003,
    },
  ]


  // Combine custom items with Sanity pages
  const allItems = [...customItems, ...navTree]

  // Sort top-level items by order
  return allItems.sort((a, b) => a.order - b.order)
}
