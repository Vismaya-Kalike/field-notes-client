/**
 * Stripe's hosted billing portal login page.
 *
 * Donors enter the email they gave with and Stripe emails them a secure link to update
 * their card or cancel. Stripe owns the authentication, so this URL is safe to publish
 * on the site and in emails — unlike a per-donor portal session, which expires within
 * minutes and grants access to whoever holds it.
 *
 * This is the live-mode link; test-mode customers will not be found through it.
 */
export const STRIPE_PORTAL_URL =
  process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL ??
  'https://billing.stripe.com/p/login/28EbJ03IJeTQ9iXgQQdfG00'
