import { Sidebar } from '@/components/Sidebar'
import { getNavigation } from '@/lib/sanity/navigation'
import type { Locale } from '@/i18n'

export default async function HandbookLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = (await params) as { locale: Locale }
  const navigation = await getNavigation(locale)

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar navigation={navigation} />
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">{children}</main>
    </div>
  )
}
