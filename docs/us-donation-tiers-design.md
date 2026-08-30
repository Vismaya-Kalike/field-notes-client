# US Donation Tiers — Design

**Date:** 2026-08-30
**Status:** Implemented

Three things came out stronger than designed, noted inline below: the browser sends no
amount and no centre count at all, `create-subscription` prices from the database rather
than its request body, and the custom-amount ceiling is per-currency.

## Summary

Restructure US donation amounts around **learning centers** as the unit of giving. US
monthly tiers become 1 / 3 / 5 / 10 centers priced off a single per-center rate, billed
through Stripe as one subscription with `quantity` set to the center count. Adds a group
giving option ("Adopt a center with your friends") with a custom amount and an optional
list of friends. US one-time amounts increase. India is unchanged throughout.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Per-center monthly rate | **$249** | Matches ₹25,000 and the subscriptions already billing at this rate |
| Monthly ladder | 1 / 3 / 5 / 10 centers | Requested |
| One-time ladder | $1,000 / $3,000 / $6,000 / $15,000 / $25,000 | Requested: larger one-time amounts |
| Group giving scope | US recurring only | India and US one-time keep plain custom-amount inputs |
| Friends field | Structured name + email rows | Contactable group data, not just a note |
| Friends storage | `JSONB` column | Short bounded list, read with the donation, never queried by |
| Stripe billing model | One $249 Price, `quantity: N` | Dashboard aggregates total centers sponsored; moves pricing authority server-side |
| Client-supplied amounts | Removed for center tiers | Server derives price and centre count from the tier id alone |
| Custom amount bounds | $1–$50,000 US, ₹1–₹50,00,000 India | Only place a client-chosen amount is still legitimate; a single dollar ceiling would wrongly reject rupee amounts |
| Testing | Vitest, unit-level | Cover the logic where a bug charges the wrong amount |

## Shared pricing module

The tier amounts currently live inside a React component and the Stripe item is built
inline inside the route handler. Neither is importable by a test without dragging in React
or the Stripe SDK, and the UI and the biller each compute the price independently.

Both move into plain modules that the component, the API routes, and the tests all import:

**`lib/donations/tiers.ts`**
- `US_CENTER_MONTHLY_USD = 249`
- `US_TIERS`, `INDIA_TIERS`, `US_ONETIME_AMOUNTS`, `INDIA_ONETIME_AMOUNTS`
- `CUSTOM_AMOUNT_MIN = 1`, `CUSTOM_AMOUNT_MAX = { us: 50_000, india: 5_000_000 }`
- `getTiers`, `getOneTimeAmounts`, `getTierById(country, tierId)`
- `isCustomTierId`, `isCustomAmountValid(country, amount)`
- `deriveAmount(country, tierId)` — the single authority on what a tier costs
- `resolveAmount(country, tierId, requestedAmount)` — the server-side entry point:
  fixed tiers ignore the requested amount entirely; custom tiers accept it only in bounds

**`lib/donations/stripe-items.ts`**
- `buildSubscriptionItem({ tierId, centerCount, customAmount })` → the Stripe subscription
  item object. Pure; makes no SDK call, so it is testable without network or keys.

This makes ladder drift between what is displayed and what is billed structurally
impossible rather than merely tested against.

## Amount ladders

### US monthly (recurring)

Amount is **derived** as `centerCount × US_CENTER_MONTHLY_USD`, never hardcoded, so the
displayed ladder cannot drift from what Stripe charges.

```
US_CENTER_MONTHLY_USD = 249

id                  centerCount   amount    label
adopt-center        1             $249      Adopt 1 Learning Center
adopt-3-centers     3             $747      Adopt 3 Learning Centers
adopt-5-centers     5             $1,245    Adopt 5 Learning Centers
adopt-10-centers    10            $2,490    Adopt 10 Learning Centers
adopt-with-friends  —             custom    Adopt a Center with Your Friends
```

`adopt-center` retains its existing id so US history in `donations.recurring_tier` stays
continuous. The other three ids are new.

### US one-time

```
$1,000
$3,000    label: "Funds a center for a year"
$6,000
$15,000
$25,000
Custom    placeholder 2000
```

A center-year at $249/mo is $2,988. The $3,000 rung is rounded up rather than shown as
$2,988; at $12 over cost the label is accurate.

### India

Unchanged. All five existing tiers (`adopt-center` ₹25,000, `third-center` ₹8,333,
`facilitator` ₹5,000, `fixed-monthly` ₹2,500, `stationery` ₹1,000), the existing one-time
ladder, and the plain "Custom Amount" cards all stay exactly as they are.

## Component changes

### `RecurringTierCards.tsx` — split tier config by country

Today a single `TIERS` array carries both `amountINR` and `amountUSD` per row, encoding
"both countries have the same tiers at different prices". That assumption no longer holds:
US needs a different tier *structure*, not different prices for the same tiers.

The array is replaced by `INDIA_TIERS` and `US_TIERS` imported from `lib/donations/tiers.ts`,
each with its `amount` already in that country's currency. The component no longer defines
any amounts. This removes `formatAmount(tier)` and the `country === 'india' ? amountINR :
amountUSD` ternaries at every read site.

The trailing card becomes country-conditional:

- **India** — unchanged "Custom Amount" card.
- **US** — "Adopt a Center with Your Friends", tier id `adopt-with-friends`, same custom
  amount input, placeholder `249`. Copy: *"Split the cost of a center with friends. Add
  their details at the next step — or leave it to us and we'll match you with other
  donors."*

**Bug fixed in passing:** `isCustomSelected` is local `useState` duplicating what
`selectedTier?.id` already encodes. `handleCountryChange` resets `selectedTier` in the
parent but the child is not remounted, so `isCustomSelected` goes stale — the custom card
renders highlighted with an empty input and no Continue button. Derive it from
`selectedTier?.id` and delete the state. Same fix in `OneTimeAmountButtons.tsx`.

### `OneTimeAmountButtons.tsx` — labelled rungs

The local `INDIA_AMOUNTS` / `US_AMOUNTS` arrays move to `lib/donations/tiers.ts` and change
shape from `number[]` to `{ amount: number; label?: string }[]`. Cards render the label as
small muted text beneath the amount when present, nothing when absent — which is every rung
except US `$3,000`, and all of India.

### `DonorInfoForm.tsx` — friends field

Repeatable name/email rows via react-hook-form `useFieldArray`, rendered only when
`country === 'us' && tierId === 'adopt-with-friends'`. Takes a new `tierId` prop rather
than a boolean, so the component isn't opaque about why the field appears.

- Starts with two empty rows; "+ Add another" appends; rows past the first get a remove control
- Helper text: *"Don't have a group yet? Leave this blank and we'll match you with other
  donors adopting a center."*

### `DonationForm.tsx` — wiring

Passes `selectedTier?.id` into `DonorInfoForm`, and forwards `friends` and `centerCount`
in the `/api/donations` body. No flow-step changes; the friends field lives inside the
existing donor-info step.

## Stripe: quantity-based subscriptions

Real Stripe subscriptions are already implemented and working — `stripe.subscriptions.create`
with `payment_behavior: 'default_incomplete'`, `invoice.paid` and
`customer.subscription.deleted` webhooks, idempotency via the `webhook_events` table. This
changes only how the subscription item is priced.

### Current

```ts
items: [{ price_data: { unit_amount: amountInCents, ... } }]
```

Every subscription mints its own throwaway inline Price (created `active=false`,
non-reusable), so Stripe cannot aggregate across them.

### New

```ts
// center tiers
items: [{ price: process.env.STRIPE_CENTER_PRICE_ID, quantity: centerCount }]

// adopt-with-friends
items: [{ price_data: { unit_amount: amountInCents, ... }, quantity: 1 }]
```

Verified against Stripe docs: `quantity` is valid on subscription items for prices with
`recurring.usage_type: 'licensed'` (the default), and `price_data` and `quantity` are
combinable on the same item.

A 10-center subscription bills $2,490/month as one subscription, one invoice, one line
reading **"10 × Learning Center Sponsorship — $249.00 each"**.

### Why a real Price object

1. **Aggregation.** One shared Price lets the Stripe Dashboard answer "how many centers are
   currently sponsored?" as a single summed quantity, without querying Supabase.
2. **Server-side pricing authority.** `create-subscription/route.ts` currently takes `amount`
   straight from the request body and bills it — a donor could POST `amount: 1` and get a
   $1/month "10 center" subscription. With a fixed Price the client sends only `centerCount`;
   the $249 lives in Stripe. The same trust issue exists in `/api/donations` and gets the
   same treatment: amount is derived server-side for known tier ids.
3. **Proration.** Quantity changes prorate automatically, so upgrades become a quantity edit.

### `create-subscription/route.ts` changes

Stronger than designed: rather than accepting a `centerCount` from the browser, the route
**drops `amount` from its request schema entirely** and reads `recurring_tier` and `amount`
from the donation row that `/api/donations` already wrote. The browser cannot name a price
or a quantity at any point in the flow. `StripeCheckout` correspondingly stops sending an
amount on the recurring path.

- Request schema is now `{ donationId, donorEmail, donorName, tierName? }`
- Tier and amount read from the donation row; missing row → 404, missing tier → 400
- Centre tiers → fixed-Price path at `quantity: tier.centerCount`
- `adopt-with-friends` → inline `price_data` at `quantity: 1`, bounds-checked
- Metadata gains `tierId` and `centerCount` so webhooks and exports carry them
- **Fallback:** if `STRIPE_CENTER_PRICE_ID` is unset, use `price_data { unit_amount: 24900 }`
  with `quantity: centerCount` and `console.warn`. Billing is identical; only Dashboard
  aggregation is lost. This removes any deploy-ordering dependency on the Price existing.

### Out of scope

- **US one-time** goes through `create-intent`; no subscription involved, no change.
- **India** goes through Razorpay entirely; `create-subscription` is US-only, so the India
  flow is untouched.
- **Existing $249 subscriptions** keep billing on their own inline prices. No migration of
  live subscriptions.

## Data layer

### Migration

`supabase/migrations/20260830000001_add_group_donations_to_donations.sql`:

```sql
ALTER TABLE donations ADD COLUMN group_members JSONB;
ALTER TABLE donations ADD COLUMN center_count INTEGER;

ALTER TABLE donations ADD CONSTRAINT valid_center_count CHECK (
  center_count IS NULL OR center_count > 0
);
```

`center_count` makes "how many centers are sponsored" answerable from Supabase as well as
Stripe. Both nullable — neither applies to India or to one-time donations.

JSONB rather than a child table: `group_members` is a short bounded list, always read
alongside its donation, never queried by.

### Validation — `lib/validations/donation.ts`

`friends` added as an optional array to both `donorInfoSchema` and `donationRequestSchema`.
No `centerCount` field — it is derived server-side from the tier id, so there is nothing
for a client to get wrong or tamper with.

The two schemas need different shapes. The **form** variant uses `superRefine`, leaving
input and output types identical so `useFieldArray` can keep rendering blank rows; the
**request** variant uses `transform().pipe()` to discard blank rows outright. Both are
exercised by tests.

Partially-filled rows are the one place this can bite. Rule:

1. Rows where **both** name and email are empty are stripped before validation
2. A surviving row must have a non-empty name **and** a valid email

A donor who types a name and tabs away gets a clear per-row error rather than a silently
dropped friend.

The existing `valid_recurring_tier` CHECK constraint requires `recurring_tier IS NOT NULL`
on recurring donations. `adopt-with-friends` is a stable id, so it satisfies this the same
way the existing `custom` id does.

### `/api/donations/route.ts`

Inserts `group_members` (null when the list is empty) and `center_count`, both derived
rather than accepted: the amount comes from `resolveAmount(country, tierId, requested)` and
the centre count from `getTierById(country, tierId)?.centerCount`. One-time amounts, which
have no tier, are bounds-checked against the country's ceiling. A rejected amount returns
400 rather than silently billing something else.

### `types.ts`

`Donation` gains `group_members: Array<{ name: string; email: string }> | null` and
`center_count: number | null`. `RecurringTier` gains `centerCount?: number`.

## Files touched

| File | Change |
|---|---|
| `lib/donations/tiers.ts` | **New.** Ladders, `deriveAmount`, custom-amount bounds |
| `lib/donations/stripe-items.ts` | **New.** Pure Stripe subscription-item builder |
| `lib/donations/tiers.test.ts` | **New.** Amount derivation |
| `lib/donations/stripe-items.test.ts` | **New.** Price/quantity + fallback |
| `lib/validations/donation.test.ts` | **New.** Friends rows, India rules intact |
| `vitest.config.ts`, `package.json` | Vitest dev dependency, config, and `test` script |
| `donate/components/RecurringTierCards.tsx` | Read tiers from `lib/donations/tiers`; friends card; drop `isCustomSelected` state |
| `donate/components/OneTimeAmountButtons.tsx` | New US amounts; labelled rungs; drop `isCustomSelected` state |
| `donate/components/DonorInfoForm.tsx` | `useFieldArray` friends rows; new `tierId` prop |
| `donate/components/DonationForm.tsx` | Pass `tierId`; forward `friends` + `centerCount` |
| `donate/types.ts` | `group_members`, `center_count`, `centerCount` |
| `lib/validations/donation.ts` | `friends` + `centerCount` schemas |
| `app/api/donations/route.ts` | Persist new columns; derive amount server-side |
| `app/api/stripe/create-subscription/route.ts` | Price + quantity; server-derived amount |
| `supabase/migrations/<new>.sql` | Two new columns |

## Verification

The project has no test framework today — `package.json` defines only `dev`, `build`,
`start`, `lint`. Add **Vitest** and a `test` script. Everything under test is a pure
function or a Zod schema, so no React testing library is needed; component rendering is
covered by the manual pass instead. Scope is deliberately the logic where a bug charges the
wrong amount — no API-route or browser tests.

### Automated — `lib/donations/tiers.test.ts`

- `deriveAmount('us', 'adopt-10-centers')` → `2490`; every US tier equals `centerCount × 249`
- Every entry in `US_TIERS` derives its amount rather than declaring one, asserted by
  comparing each tier's `amount` against `centerCount × US_CENTER_MONTHLY_USD`
- India tiers return their existing INR amounts unchanged
- Unknown tier id → throws rather than silently returning `0`

### Automated — `lib/donations/stripe-items.test.ts`

- `adopt-10-centers` → `{ price: <center price>, quantity: 10 }`
- `adopt-with-friends` → `{ price_data: { unit_amount }, quantity: 1 }`
- `STRIPE_CENTER_PRICE_ID` unset → `{ price_data: { unit_amount: 24900 }, quantity: 10 }`,
  i.e. the fallback bills the same $2,490 total
- Custom amount below $1 or above $50,000 → rejected

### Automated — `lib/validations/donation.test.ts`

- Friend row with a name and no email → per-row error, submission blocked
- Friend row with both fields empty → stripped, submission allowed
- Friends list absent entirely → valid (the "match us" path)
- India still requires a valid PAN; cheque still requires an address; recurring still
  requires a tier

### Manual — Stripe test mode, card `4242 4242 4242 4242`

- US monthly 10 centers → Stripe subscription shows quantity 10 at $249, invoice totals $2,490
- US monthly friends + 2 friends → `group_members` populated, subscription at custom amount
- US monthly friends, no friends entered → `group_members` null, no validation block
- Friends row with name but no email → per-row error, submit blocked
- US one-time $3,000 → payment intent, `$3,000` with year label rendered
- India monthly + one-time → unchanged tiers, unchanged amounts, Razorpay flow intact
- Switch country US → India mid-flow → no stale highlighted custom card
- `STRIPE_CENTER_PRICE_ID` unset → subscription still succeeds at $2,490, warning logged

### Gate

`pnpm test`, `pnpm build`, and `pnpm lint` all pass before the change is considered done.

**Result:** 42 tests passing across 3 files, build exit 0, no ESLint warnings or errors.
The manual Stripe test-mode pass above has not been run yet.

## Ops prerequisite

Create a recurring Price in the Stripe Dashboard — product **"Learning Center Sponsorship"**,
**$249.00 / month**, licensed — and set `STRIPE_CENTER_PRICE_ID`. Not blocking: the fallback
path bills correctly without it.
