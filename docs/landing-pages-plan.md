# Plan: Break the "docs site" feel — Marketing shell + Handbook

## Context

The Vismaya Kalike (ViKa) site (`client/`, `vika-handbook`) currently feels entirely like a documentation site. The root cause is **structural, not content**: a fixed left sidebar + auto-generated table-of-contents + Work Sans 300 on a neutral canvas is the canonical docs pattern — and that shell (`client/app/[locale]/layout.tsx` → `components/Sidebar.tsx`) wraps **every** page, including Home, Donate, and Contact. So even marketing pages inherit a documentation feel.

The content is already cleanly split, which makes this mostly a **layout/shell** job, not a content rewrite:
- **Bespoke React pages:** Home, Donate, Contact, Learning Centers, Resources.
- **Sanity CMS "handbook" pages** (rendered uniformly through `[...slug]/page.tsx`): `open`, `joyful`, `self-determined`, `community-run`, `agency`, `what-is-vismaya-kalike`, `suggested-material-list`, `partners`, + legal.

**Goal:** introduce two distinct experiences via Next.js **route groups** (no framework change, no URL changes):
1. A **marketing shell** — top header + footer, no sidebar, editorial/branded — for landing pages.
2. The **handbook shell** — the existing sidebar + TOC, kept clean and readable — for all docs, reachable via a "Handbook" entry point.

### Decisions locked with the user
- **Nav model:** Two distinct shells (marketing top-nav vs handbook sidebar).
- **Landing pages:** Home (redesign), Donate (restyle shell only), Contact (light restyle), + NEW **About/Mission**, NEW **Impact & Transparency**, and a **Learning Centers** overview. (Defer further new pages like "Get Involved" to a later pass.)
- **Visual:** Branded marketing pages in **ViKa's own palette and aesthetic** (turquoise/teal/violet/coral/yellow + the playful theory-of-change energy). Handbook stays clean. **No navy/gold** — the PDF is a *data* reference only, not a style reference.
- **Fund-flow PDF:** Rebuilt **natively** in ViKa colours (no PDF served). The PDF supplies the numbers and structure; the look is ViKa.
- **Typography:** Not locked. Start from ViKa's warm/playful world and **iterate live on the real home page** rather than deciding in the abstract. Work Sans stays for body.
- **Handbook URLs:** Keep existing slugs (`/open`, `/joyful`, …) unchanged via route groups; add a new `/handbook` index page as the header's entry point. **No redirects needed.**

### Sequencing (per user)
Build in phases, gated on confirming routing works before investing in polish:
- **Phase 1 — Skeleton + Home.** Stand up the two-shell route-group structure, move existing pages, **confirm routing + build pass** (all legacy URLs, both shells). Then redesign the **Home** page in a first ViKa aesthetic direction and iterate on it live with the user.
- **Phase 2 — Remaining marketing pages.** Once the aesthetic is agreed on the home page, build **About**, **Impact & Transparency**, **Learning Centers overview**, and the marketing Header/Footer, reusing the locked component/style system.
- **Phase 3 — Finish + polish.** Restyle Donate/Contact shells, polish the fund-flow diagram, trim the handbook sidebar nav, add the `/handbook` index, wire i18n strings.

---

## Part A — Structural migration (route groups, two shells)

Route groups are parenthesized folders Next.js strips from the URL, so the effective route set is identical to today — existing docs URLs resolve exactly as before.

### Target tree under `client/app/[locale]/`
```
[locale]/
├── layout.tsx                 # KEPT, slimmed: html/body, Work Sans, globals.css, intl + query providers ONLY
├── (marketing)/
│   ├── layout.tsx             # NEW: <Header/> + <main> + <Footer/>  (no providers)
│   ├── page.tsx               # MOVED from [locale]/page.tsx    → /en
│   ├── donate/                # MOVED (folder incl. components/, types.ts)
│   ├── contact/               # MOVED (folder incl. components/)
│   ├── learning-centers/      # MOVED whole subtree
│   ├── about/page.tsx         # NEW
│   └── impact/page.tsx        # NEW
└── (handbook)/
    ├── layout.tsx             # NEW: flex + <Sidebar/> + <main> (moved out of root)
    ├── [...slug]/             # MOVED: all Sanity docs (preserve revalidate + generateMetadata)
    ├── resources/             # MOVED whole subtree
    └── handbook/page.tsx      # NEW: handbook index/landing → /en/handbook
```

### Layout split (avoid provider duplication)
- **`[locale]/layout.tsx` (kept, slimmed):** retains `<html>/<body>`, Work Sans, `import '../globals.css'`, `getMessages()` + `NextIntlClientProvider`, `QueryProvider`. **Remove** the `getNavigation` call, the `flex` wrapper, `<Sidebar/>`, and `<main>`. Ends as `<QueryProvider>{children}</QueryProvider>`.
- **`(handbook)/layout.tsx` (new, async):** verbatim move of the current flex + `<Sidebar navigation={navigation}/>` + `<main>` block; calls the (trimmed) nav fetch.
- **`(marketing)/layout.tsx` (new):** renders `<Header/>`, `<main>`, `<Footer/>`. No providers, no Sanity nav fetch (removes a per-request fetch from every marketing page).

### Navigation
- New marketing chrome components: `components/marketing/Header.tsx` (`'use client'`: logo w/ `dark:invert` → Home, primary links, `DarkModeToggle`, language switcher) and `components/marketing/Footer.tsx` (Privacy/Terms, org info). Optional `lib/marketing/navigation.ts` static link array.
- **Header nav set:** Home · About · Handbook (`/handbook`) · Learning Centers · Impact · Donate (primary CTA) · Contact.
- **Trim the sidebar:** `lib/sanity/navigation.ts` currently injects Learning Centers/Donate/Contact as sidebar items (lines ~86–128). Add `getHandbookNavigation(locale)` returning Sanity docs (+ Resources + a "Back to main site" link) and **drop** Learning Centers/Donate/Contact from the sidebar so they don't duplicate the header.
- **Recommended cleanup:** extract the private `LanguageSwitcher` from `Sidebar.tsx` into `components/LanguageSwitcher.tsx`, reuse in both Header and Sidebar.
- **Dark mode:** `DarkModeToggle` lives only in the Sidebar today → add it to the marketing Header so marketing pages keep the toggle. Theme persists globally (`.dark` on shared `<html>` + localStorage), so `dark:invert` logos keep working across both shells.

### Gotchas (must respect)
- Never create `(handbook)/page.tsx` — two `page.tsx` mapping to `/en` is a hard build error.
- Keep `[...slug]` a regular catch-all (NOT `[[...slug]]`, which would collide with the marketing home at `/en`).
- Keep `<html>`/`globals.css`/intl/query providers in the root layout **only** — do not re-import or re-wrap in group layouts (would remount React Query / re-init intl).
- Use `git mv` for every move (preserve history). `@/*` imports are location-independent and safe; only donate/contact's relative `./components/*` imports matter and they move with their folders.
- Preserve `export const revalidate = 3600` on the moved `[...slug]/page.tsx`.
- Keep each top-level segment (e.g. all of `learning-centers`, all of `resources`) wholly within one group so overview + drilldowns share a shell.

---

## Part B — Visual system (ViKa-branded marketing, clean handbook)

Aesthetic direction is **ViKa's own world**: the vivid palette (already tokenised as `--color-vika-*`), the hand-drawn logo, and the concentric-arc "theory of change" energy — playful, warm, curious ("vismaya" = wonder). This is the starting point; the exact display-type and hero treatment get refined live on the home page (Phase 1).

### Type + color (scoped so the Handbook is untouched)
- **Palette:** reuse the existing brand tokens — turquoise `#1eddd2`, teal `#05ada3`, violet `#6677f5`, coral `#fc9797`, yellow `#d7df23`, amber `#f59e0b`, sky `#5781ff` — as the marketing accent system (hero washes, section bands, stat/legend colours, pillar chips). No new navy/gold tokens. Ground on the existing neutral canvas (optionally biased slightly warm/teal). Keep the STYLE_GUIDE discipline: vivid colour as accents/washes, not body text.
- **Display type (TBD, iterate on home):** body stays **Work Sans**. For landing headlines, trial a warm/playful display face that fits the hand-drawn brand (candidates to try on the real page: a rounded humanist like *Quicksand*/*Nunito*, or a soft display like *Fraunces Soft* — NOT the formal serif direction). Whatever we pick loads via `next/font` in `[locale]/layout.tsx` alongside Work Sans and registers as a `--font-display` token. Decide by looking at it in-page, not up-front.
- **Scoping mechanism (critical for Tailwind v4):** the base rules forcing all `h1–h6` to coral + weight 300 live in `@layer base`. Add an **unlayered** `.marketing { … }` block at the bottom of `globals.css` — unlayered rules beat any layered rule regardless of specificity, no `!important` needed — so marketing pages can set their own heading font/weight/colour treatment while the Handbook keeps its coral / Work-Sans-300 look untouched. Each landing page wraps content in `<div className="marketing">`; Handbook never opts in.
- **Rhythm & bands:** landing sections use `py-20 md:py-28`; alternate full-bleed surface bands using ViKa washes (e.g. `bg-vika-turquoise/5`, coral/violet tints, a bold brand band for the hero/CTA). Provide `dark:` variants for every band. Motion: subtle on-scroll fade/rise + stat count-up via `IntersectionObserver`, gated on `prefers-reduced-motion` (`tailwindcss-animate` already available).

### Reusable components — `client/components/marketing/`
RSC by default; only `StatCard` (count-up) and `Reveal` are `'use client'` leaves. Reuse `cn`, shadcn `Button`/`Card`, Lucide.
`Section` (band wrapper: variant + rhythm + max-width) · `Eyebrow` · `SectionHeading` (display font + optional colour accent) · `Hero` · `StatCard` + `StatRow` · `CalloutCard` (the 80/20 emphasis block, in a ViKa tint) · `CommunityGrid`/`CommunityCard` · `FundFlowDiagram` + `FundFlowLegend` · `CTASection` · `PillarCard` · `Reveal`.
`Section`/`CalloutCard` `variant`/`tone` props map to ViKa washes (turquoise/coral/violet tints + a bold brand band), not navy/cream. Marketing button treatment via `className`, **not** new shadcn variants (don't touch shared `button.tsx`).

### Fund-flow (Sankey) diagram
- **Data source of truth:** `client/lib/data/fund-flow.ts` (typed: FY label, `total`, `sources[]`, `programs[]` each `{id,label,amount,pct,color}`, center node). Companion `client/lib/data/impact-stats.ts` and `communities.ts`. All FY-sensitive figures live here (yearly PR to update), **not** in Sanity.
- **Desktop (≥md):** inline `<svg viewBox>` — three columns (sources → ViKa → programs) with cubic-Bézier ribbons whose widths ∝ pct; node heights ∝ amount; segment colours drawn from the **ViKa palette** (turquoise/teal/violet/coral/yellow/amber/sky), echoing the theory-of-change infographic. No chart lib.
- **Mobile (<md):** `hidden md:block` on the SVG; render a stacked flex-bar layout (`md:hidden`) — labeled "Sources"/"Programs" groups, each row a proportional-width bar with label + amount + pct.
- **Accessibility:** SVG `role="img"` + `aria-labelledby` (`<title>/<desc>`), decorative ribbons `aria-hidden`; include an `sr-only` table enumerating every source/program with amount + pct; legend chips carry text + amount (never color-only).

### Impact & Transparency page content (rebuild of the PDF, in ViKa colours)
Eyebrow "VISMAYA KALIKE · DONOR TRANSPARENCY · FY 2026–27" → Hero "Where your rupee reaches the community." → **80% callout** (ViKa-tint emphasis card: 80% direct to communities — facilitator/coordinator salaries & workshops, exposure visits, learning materials; 20% rent/admin/coordination) → **Stat row** (₹2.84 Cr budget · ₹79.6 L raised · 110 centers [72 active · 38 pipeline] · 5 regions) → **Communities we serve** (Vijayanagara — Devadasi & mining-displaced; Tumkur — Waste pickers; Raichur — Agricultural labor; Bangalore — Domestic workers & construction labor) → **Fund flow** SOURCES→ViKa→PROGRAMS (Sources: Core Team & Family ₹20L·7.0%, Friends & Family ₹19.6L·6.9%, Corporate ₹40L·14.1%, Still Needed ₹1.81Cr·63.5%, Self-funded Leadership ₹24L·8.4% · Programs: Community Staff ₹1.54Cr·54.3%, Children's Direct ₹70L·24.6%, Coordination & Rent ₹36L·12.7%, Leadership ₹24L·8.4%) → Methodology note → CTA (Donate).

### Per-page section breakdown
- **Home** (`(marketing)/page.tsx`, redesign; keep Supabase partner + random-centre queries): Hero (logo + display tagline + Donate/Explore CTAs) → Mission intro (preserve inline concept links) → Pillars (`PillarCard`) → Impact stat teaser → Featured centres (existing random grid, restyled) → Partners (existing grid) → `PhotoGallery` → CTA.
- **About/Mission** (`(marketing)/about/page.tsx`, new): brand-band Hero → founding story (2017 → collective of 5 orgs) → mission pillars → Theory of Change (`theory_of_change.jpg` via `next/image`) → the collective/partners → CTA.
- **Impact & Transparency** (`(marketing)/impact/page.tsx`, new): as above.
- **Learning Centers overview** (`(marketing)/learning-centers/page.tsx`, restyle): Hero → coverage stat row → optional region narrative → existing `<DistrictsList/>` in a restyled band → CTA. Drilldowns unchanged.
- **Donate** (restyle shell only): wrap in `.marketing`, swap hero to `Hero`/`SectionHeading`; keep `$249 / ₹25000` copy; optionally add the 80% `CalloutCard` above the form. **Do not touch `<DonationForm/>` or anything in `donate/components/*`.**
- **Contact** (light restyle): wrap in `.marketing`, swap intro headings to `SectionHeading`, keep `ContactForm` and all data.
- **Handbook index** (`(handbook)/handbook/page.tsx`, new): renders in the sidebar shell; a directory of link cards to the docs pages (from the handbook nav) — the header "Handbook" link target.

### Content sourcing
- **Typed data files** (`lib/data/*`): all FY figures — fund flow, impact stats, communities. Version-controlled, one PR per FY.
- **Supabase (unchanged):** partners, learning centres, `PhotoGallery` images.
- **Sanity (existing):** long-form docs stay as-is. New marketing prose ships **hardcoded in v1** but components take `title`/`subtitle`/`body` as props, so a later Sanity migration is a drop-in. Route hardcoded strings through `next-intl` (en/kn) like the rest of the app.
- Move `vika-fund-flow 3.pdf` out of scope for serving — the native page replaces it (keep the file in-repo as reference only).

---

## Build order (phased — routing gate first)

### Phase 1 — Route-group skeleton + Home (confirm routing, then iterate the aesthetic)
Structural moves first, no visual change, each independently verifiable via `pnpm dev`; `git mv` every move:
1. Add `(handbook)/layout.tsx` (flex+Sidebar+nav); slim root layout to providers-only; `git mv [...slug]` → `(handbook)/`. Check `/en/open`, `/en/partners`.
2. Add a minimal `(marketing)/layout.tsx` (`{children}` only for now); `git mv page.tsx` → `(marketing)/`. Check `/en` + `/en/open` coexist in their respective shells.
3. `git mv` donate, contact, learning-centers → `(marketing)/`. Check each + a drilldown (relative imports resolve).
4. `git mv` resources → `(handbook)/`. Check resources routes render with sidebar.
5. **Routing gate:** `pnpm build` passes with no "two parallel pages resolve to the same path" error; every legacy URL renders in the correct shell; `kn` prefixing intact. **Confirm with the user before proceeding.**
6. Add `--font-display` + the `.marketing` scope block in `globals.css`; **redesign Home** in a first ViKa aesthetic direction (hero, pillars, stat teaser, existing centre/partner grids restyled). Iterate live with the user until the look is agreed.

### Phase 2 — Remaining marketing pages + chrome
7. Extract the reusable `components/marketing/*` set from the agreed Home styling.
8. Build `Header`/`Footer` (extract `LanguageSwitcher`, include `DarkModeToggle`); wire into `(marketing)/layout.tsx`.
9. Build `about`, `impact` (fund-flow rebuild), and the Learning Centers overview using the locked components. Each new page sets its own `metadata`.

### Phase 3 — Finish + polish
10. Restyle Donate (shell only — do not touch `donate/components/*`) and Contact.
11. Polish the `FundFlowDiagram` (SVG desktop / stacked mobile / sr-only table).
12. Trim sidebar nav (`getHandbookNavigation`); add `(handbook)/handbook/page.tsx` index; point header "Handbook" → `/handbook`.
13. Route hardcoded marketing strings through `next-intl` (en/kn).

---

## Verification
- `pnpm dev` and click through: every legacy docs URL (`/en/open`, `/en/joyful`, `/en/partners`, `/en/terms`) renders in the **sidebar** shell; `/en`, `/en/donate`, `/en/contact`, `/en/about`, `/en/impact`, `/en/learning-centers` render in the **marketing** shell with header + footer and **no** sidebar.
- Dark-mode toggle in the marketing header flips theme and persists into the handbook shell; logos `dark:invert` correctly.
- Handbook pages remain visually clean (coral headings / Work Sans 300); marketing pages show the ViKa aesthetic (vivid palette washes, display headings) with no coral-heading bleed either way.
- Impact page matches the PDF content; fund-flow diagram renders as SVG on desktop and stacked bars on mobile; `sr-only` data table present.
- `pnpm build` succeeds with **no** "two parallel pages resolve to the same path" error; route list shows all legacy URLs unchanged. `revalidate = 3600` still on `(handbook)/[...slug]/page.tsx`.
- Spot-check `kn` locale prefixing (`/kn/open`, `/kn/donate`).

## Critical files
- `app/[locale]/layout.tsx` — slim to providers-only
- `app/[locale]/(marketing)/layout.tsx`, `(handbook)/layout.tsx` — new shells
- `components/marketing/Header.tsx`, `Footer.tsx` — new marketing chrome
- `components/Sidebar.tsx` — moves into handbook layout; extract `LanguageSwitcher`
- `lib/sanity/navigation.ts` — split marketing vs handbook nav; trim hardcoded items
- `app/globals.css` — add `--font-display` + unlayered `.marketing` scope block (reuse existing `--color-vika-*` tokens; no navy/gold)
- `components/marketing/*` — component library (Section, Hero, StatRow, CalloutCard, FundFlowDiagram, …)
- `lib/data/fund-flow.ts` (+ `impact-stats.ts`, `communities.ts`) — typed yearly figures
- `app/[locale]/(marketing)/impact/page.tsx`, `about/page.tsx`; `(handbook)/handbook/page.tsx` — new pages
