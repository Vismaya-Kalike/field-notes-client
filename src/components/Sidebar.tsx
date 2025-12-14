import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { DarkModeToggle } from './ui/dark-mode-toggle'

interface NavItem {
  title: string
  href?: string
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    title: 'About ViKa',
    href: '/about',
    children: [
      { title: 'Purpose', href: '/about/purpose' },
      { title: 'Agency', href: '/about/agency' },
      {
        title: 'Principles',
        href: '/about/principles',
        children: [
          { title: 'Joyful', href: '/about/principles/joyful' },
          { title: 'Self-determined', href: '/about/principles/self-determined' },
          { title: 'Open', href: '/about/principles/open' },
          { title: 'Community Lead', href: '/about/principles/community-lead' },
        ]
      },
      { title: 'ViKa and School', href: '/about/vika-and-school' },
    ]
  },
  {
    title: 'Learning Centers',
    href: '/'
  },
  {
    title: 'Getting Started',
    href: '/getting-started',
    children: [
      { title: 'Identifying a Space', href: '/getting-started/identifying-space' },
      { title: 'Identifying a Facilitator', href: '/getting-started/identifying-facilitator' },
      { title: 'Identifying Partners', href: '/getting-started/identifying-partners' },
      { title: 'Suggested Material List', href: '/getting-started/material-list' },
      { title: 'Play, Play, Play', href: '/getting-started/play' },
      { title: 'How do I know ViKa is happening?', href: '/getting-started/indicators' },
      { title: 'Safety Measures', href: '/getting-started/safety' },
      { title: 'FAQ', href: '/getting-started/faq' },
    ]
  },
  {
    title: 'Understanding Progress',
    href: '/progress',
    children: [
      { title: 'Approach (AR / PAR)', href: '/progress/approach' },
      { title: 'Field Notes', href: '/progress/field-notes' },
      { title: 'Children Feedback', href: '/progress/children-feedback' },
      { title: 'Portfolios', href: '/progress/portfolios' },
      { title: 'Coordinator Reports', href: '/progress/coordinator-reports' },
      {
        title: 'Community Reporting',
        href: '/progress/community',
        children: [
          { title: 'Home Visits', href: '/progress/community/home-visits' },
          { title: 'Parents Meetings', href: '/progress/community/parents-meetings' },
          { title: 'Metric Melas', href: '/progress/community/metric-melas' },
        ]
      },
    ]
  },
  {
    title: 'Resources',
    href: '/resources',
    children: [
      { title: 'Learning Material', href: '/resources/learning-material' },
      {
        title: 'Activities',
        href: '/resources/activities',
        children: [
          { title: 'Book of Wonder', href: '/resources/activities/book-of-wonder' },
          { title: 'Randomize', href: '/resources/activities/randomize' },
        ]
      },
      {
        title: 'Facilitator Workshops',
        href: '/resources/workshops',
        children: [
          { title: 'Activities for Facilitators', href: '/resources/workshops/activities' },
          { title: 'Resource People', href: '/resources/workshops/resource-people' },
        ]
      },
      {
        title: 'Reading',
        href: '/resources/reading',
        children: [
          { title: 'Books', href: '/resources/reading/books' },
          { title: 'Articles', href: '/resources/reading/articles' },
          { title: 'Papers', href: '/resources/reading/papers' },
        ]
      },
      {
        title: 'Events',
        href: '/resources/events',
        children: [
          { title: 'Programmes', href: '/resources/events/programmes' },
          { title: 'Field Trips', href: '/resources/events/field-trips' },
        ]
      },
      { title: 'People', href: '/resources/people' },
      { title: 'Organisations', href: '/resources/organisations' },
      {
        title: 'Documentation',
        href: '/resources/docs',
        children: [
          { title: 'Job Description Templates', href: '/resources/docs/job-description' },
          { title: 'Volunteer Templates', href: '/resources/docs/volunteer' },
          { title: 'Rental Agreement Templates', href: '/resources/docs/rental-agreement' },
          { title: 'MoU Templates', href: '/resources/docs/mou' },
          { title: 'Deck', href: '/resources/docs/deck' },
          { title: 'Budget Templates', href: '/resources/docs/budget' },
          { title: 'Proposal Templates', href: '/resources/docs/proposal' },
          { title: 'Policy Templates', href: '/resources/docs/policy' },
        ]
      },
      { title: 'Brand Guidelines', href: '/resources/brand-guidelines' },
    ]
  },
  {
    title: 'Writing / Blog',
    href: '/blog'
  },
  {
    title: 'Governance',
    href: '/governance'
  },
  {
    title: 'Partners',
    href: '/partners',
    children: [
      { title: 'Partner Organisations', href: '/partners/organisations' },
      { title: 'Apply to be a Partner', href: '/partners/apply' },
      { title: 'Collaboration Framework', href: '/partners/collaboration-framework' },
    ]
  },
  {
    title: 'Scholarship',
    href: '/scholarship',
    children: [
      { title: 'Apply for a Scholarship', href: '/scholarship/apply' },
    ]
  },
  {
    title: 'Donate / Support',
    href: '/donate'
  },
  {
    title: 'Subscribe / Contact',
    href: '/contact'
  },
  {
    title: 'Tools',
    href: '/tools',
    children: [
      { title: 'LLM Playground', href: '/playground' },
    ]
  },
  {
    title: 'Privacy Policy',
    href: '/privacy-policy'
  },
  {
    title: 'Terms and Conditions',
    href: '/terms'
  },
]

function NavGroup({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(() => {
    if (item.children) {
      return item.children.some(child =>
        child.href && location.pathname === child.href
      )
    }
    return false
  })

  const hasChildren = item.children && item.children.length > 0

  if (!hasChildren && item.href) {
    const isActive = location.pathname === item.href
    return (
      <Link
        to={item.href}
        className={cn(
          "block px-3 py-1.5 text-sm rounded-md transition-colors",
          isActive
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
          depth > 0 && "ml-4"
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
        <svg
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-90"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
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

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border border-border shadow-sm hover:bg-accent transition-colors"
        aria-label="Open navigation"
      >
        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
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
        <div className="flex-shrink-0 px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <Link to="/" className="block">
              <img
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
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
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
        <div className="flex-shrink-0 px-4 py-3 border-t border-sidebar-border">
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
