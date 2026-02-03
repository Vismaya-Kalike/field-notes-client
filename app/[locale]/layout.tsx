import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { Sidebar } from '@/components/Sidebar'
import { getNavigation } from '@/lib/sanity/navigation'
import '../globals.css'
import type { Locale } from '@/i18n'
import { Work_Sans } from 'next/font/google'

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
})

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
    <html lang={locale} className={workSans.variable}>
      <body className="font-sans">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <div className="min-h-screen bg-background flex">
              <Sidebar navigation={navigation} />
              <main className="flex-1 min-w-0">
                {children}
              </main>
            </div>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
