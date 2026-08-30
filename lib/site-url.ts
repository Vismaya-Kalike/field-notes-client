/**
 * Absolute base URL for links that leave the app — emails and payment-gateway
 * redirects, where a relative path is meaningless.
 *
 * Vercel sets VERCEL_URL per deployment, which covers previews without configuration;
 * NEXT_PUBLIC_SITE_URL takes precedence so production points at the real domain.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) return configured.replace(/\/$/, '')

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl}`

  return 'http://localhost:3000'
}
