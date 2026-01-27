import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { Sidebar } from '@/components/Sidebar'
import { getNavigation } from '@/lib/sanity/navigation'
import '../globals.css'
import type { Locale } from '@/i18n'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params as { locale: Locale }
  const messages = await getMessages()
  const navigation = await getNavigation(locale)

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <div className="min-h-screen bg-background flex">
              <Sidebar navigation={navigation} />
              <main className="flex-1 min-w-0 overflow-y-auto">
                {children}
              </main>
            </div>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
