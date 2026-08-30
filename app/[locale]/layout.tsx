import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { QueryProvider } from '@/components/providers/QueryProvider'
import '../globals.css'
import type { Locale } from '@/i18n'
import { Work_Sans, Baloo_2 } from 'next/font/google'

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
})

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-baloo',
})

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = (await params) as { locale: Locale }
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${workSans.variable} ${baloo.variable}`}>
      <body className="font-sans">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>{children}</QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
