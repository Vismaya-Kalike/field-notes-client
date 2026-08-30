import { PhotoGallery } from '@/components/PhotoGallery'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

interface LearningCentre {
  id: string
  centre_name: string
  area: string
  city: string
  district: string
  state: string
}

const principles = [
  {
    name: 'Open',
    href: '/open',
    blurb: 'Anyone can walk in. Children choose what they want to do.',
    tint: 'bg-vika-turquoise/10 border-vika-turquoise/25',
  },
  {
    name: 'Joyful',
    href: '/joyful',
    blurb: 'Learning that children actually want to come back to.',
    tint: 'bg-vika-yellow/15 border-vika-yellow/30',
  },
  {
    name: 'Self-determined',
    href: '/self-determined',
    blurb: 'Children decide what they work on, and when.',
    tint: 'bg-vika-violet/10 border-vika-violet/25',
  },
  {
    name: 'Community-run',
    href: '/community-run',
    blurb: 'Run by facilitators from the community itself.',
    tint: 'bg-vika-teal/10 border-vika-teal/25',
  },
]

function RippleBackdrop() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 800 800"
      className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[140%] w-[140%] max-w-none -translate-x-1/2 -translate-y-[18%]"
      style={{
        maskImage: 'radial-gradient(closest-side, black 55%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(closest-side, black 55%, transparent 100%)',
      }}
    >
      {[
        { r: 90, c: 'var(--color-vika-coral)', o: 0.35 },
        { r: 160, c: 'var(--color-vika-yellow)', o: 0.3 },
        { r: 240, c: 'var(--color-vika-turquoise)', o: 0.28 },
        { r: 320, c: 'var(--color-vika-violet)', o: 0.22 },
        { r: 400, c: 'var(--color-vika-teal)', o: 0.16 },
      ].map((ring) => (
        <circle
          key={ring.r}
          cx="400"
          cy="400"
          r={ring.r}
          fill="none"
          stroke={ring.c}
          strokeOpacity={ring.o}
          strokeWidth="10"
        />
      ))}
    </svg>
  )
}

export default async function HomePage() {
  const { data: partners } = await supabase
    .from('partner_organisations')
    .select('id, name, logo_url, type, contact, url')
    .order('name')

  const { data: learningCentres } = await supabase
    .rpc('get_random_learning_centres', { limit_count: 6 })

  return (
    <div className="marketing overflow-x-hidden">
      {/* ① Hero */}
      <section className="relative isolate px-4 pb-20 pt-16 text-center sm:px-6 md:pb-28 md:pt-24">
        <RippleBackdrop />
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <Image
            src="/logo.png"
            alt="Vismaya Kalike"
            width={96}
            height={96}
            priority
            className="mb-8 h-20 w-20 dark:invert"
          />
          <h1 className="text-5xl md:text-7xl">
            Every child is born{' '}
            <span className="text-vika-coral">curious.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
            Vismaya Kalike runs after-school learning centers where
            first-generation learners across Karnataka choose what they
            explore — and get to stay curious.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/donate"
              className="inline-flex items-center rounded-full bg-vika-coral px-8 py-3.5 font-display text-lg font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Donate
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center rounded-full border-2 border-foreground/15 px-8 py-3.5 font-display text-lg font-semibold text-foreground transition-colors hover:border-foreground/30 hover:bg-foreground/5"
            >
              See where the money goes →
            </Link>
          </div>
        </div>
      </section>

      {/* ② What ViKa is */}
      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-2xl leading-relaxed md:text-3xl">
            Vismaya Kalike is an after-school program run by a collective of
            five community organisations. In our centers, children decide what
            they want to work on. We keep the spaces{' '}
            <PrincipleLink href="/open">open</PrincipleLink>,{' '}
            <PrincipleLink href="/joyful">joyful</PrincipleLink>,{' '}
            <PrincipleLink href="/self-determined">self-determined</PrincipleLink>{' '}
            and{' '}
            <PrincipleLink href="/community-run">community-run</PrincipleLink>{' '}
            so learners build{' '}
            <PrincipleLink href="/agency">agency</PrincipleLink> — the
            confidence to make decisions about their own learning.
          </p>
        </div>
      </section>

      {/* ③ The five principles */}
      <section className="bg-muted/40 px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Eyebrow>How the centers work</Eyebrow>
          <h2 className="mt-3 text-3xl md:text-4xl">Five things we hold to</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p) => (
              <Link
                key={p.name}
                href={p.href}
                className={`group flex flex-col rounded-2xl border p-6 transition-transform hover:-translate-y-1 ${p.tint}`}
              >
                <h3 className="text-xl text-foreground">{p.name}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {p.blurb}
                </p>
                <span className="mt-4 font-display text-sm font-semibold text-foreground/70 transition-colors group-hover:text-foreground">
                  Read more →
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/agency"
            className="group mt-4 flex flex-col rounded-2xl border border-vika-coral/30 bg-vika-coral/15 p-8 transition-transform hover:-translate-y-1 md:flex-row md:items-center md:justify-between"
          >
            <div className="md:max-w-2xl">
              <h3 className="text-2xl text-foreground md:text-3xl">Agency</h3>
              <p className="mt-2 text-muted-foreground">
                The thread through all of it — children who can make decisions
                for themselves, and carry that well beyond the center.
              </p>
            </div>
            <span className="mt-4 shrink-0 font-display font-semibold text-foreground/70 transition-colors group-hover:text-foreground md:mt-0">
              Read more →
            </span>
          </Link>
        </div>
      </section>

      {/* ④ Proof it's real — facilitator quote (PLACEHOLDER) */}
      <section className="px-4 py-16 sm:px-6 md:py-24">
        <figure className="mx-auto max-w-3xl text-center">
          <blockquote className="text-2xl leading-snug md:text-3xl">
            <span className="font-display font-semibold">
              “Placeholder — a facilitator&apos;s words go here. Two or three
              sentences about a real moment at a center: a child who changed,
              something that surprised them, why the work matters.”
            </span>
          </blockquote>
          <figcaption className="mt-6 text-sm text-muted-foreground">
            — A facilitator, [center] center
          </figcaption>
        </figure>
      </section>

      {/* ⑤ Where it happens */}
      <section className="bg-muted/40 px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-end">
            <div>
              <Eyebrow>Where it happens</Eyebrow>
              <h2 className="mt-3 text-3xl md:text-4xl">
                Centers rooted in the community
              </h2>
              <p className="mt-4 text-muted-foreground">
                Every center sits inside the community it serves — in Hosapete,
                Koppala, Tumakuru and Bangalore, with more opening soon.
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-4 text-center">
              <Stat value="75+" label="learning centers" />
              <Stat value="5" label="community organisations" />
              <Stat value="2017" label="since" />
            </dl>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(learningCentres as LearningCentre[] | null)?.map((centre) => (
              <div
                key={centre.id}
                className="rounded-2xl border border-border bg-background p-5"
              >
                <h3 className="text-base text-foreground">
                  {centre.centre_name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {centre.area}, {centre.city}
                </p>
                <p className="text-xs text-muted-foreground">
                  {centre.district}, {centre.state}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/learning-centers"
            className="mt-8 inline-flex font-display font-semibold text-foreground hover:opacity-70"
          >
            View all learning centers →
          </Link>
        </div>
      </section>

      {/* ⑥ Transparency teaser */}
      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-4xl rounded-3xl border border-vika-teal/25 bg-vika-teal/10 p-8 text-center md:p-12">
          <p className="font-display text-5xl font-bold text-vika-teal md:text-6xl">
            80%
          </p>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            of every rupee reaches the community directly — facilitator
            salaries, learning materials and workshops. (Placeholder figure — to
            confirm.)
          </p>
          <Link
            href="/donate"
            className="mt-6 inline-flex font-display font-semibold text-foreground hover:opacity-70"
          >
            See where the money goes →
          </Link>
        </div>
      </section>

      {/* ⑦ The collective */}
      {partners && partners.length > 0 && (
        <section className="bg-muted/40 px-4 py-16 sm:px-6 md:py-24">
          <div className="mx-auto max-w-6xl">
            <Eyebrow>The collective</Eyebrow>
            <h2 className="mt-3 text-3xl md:text-4xl">
              We don&apos;t work alone
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              ViKa is run with community-based organisations already working on
              the ground — so the work is theirs, not parachuted in.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {partners.map((partner) => {
                const inner = (
                  <>
                    <div className="flex h-14 items-center justify-center">
                      {partner.logo_url ? (
                        <Image
                          src={partner.logo_url}
                          alt={partner.name}
                          width={90}
                          height={50}
                          className="max-h-14 object-contain"
                        />
                      ) : (
                        <div className="h-14" />
                      )}
                    </div>
                    <p className="mt-3 text-center text-sm font-medium text-foreground">
                      {partner.name}
                    </p>
                    {partner.type && (
                      <p className="text-center text-xs leading-tight text-muted-foreground">
                        {partner.type}
                      </p>
                    )}
                  </>
                )
                return partner.url ? (
                  <Link
                    key={partner.id}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-border bg-background p-4 transition-shadow hover:shadow-md"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div
                    key={partner.id}
                    className="rounded-2xl border border-border bg-background p-4"
                  >
                    {inner}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ⑧ Photos */}
      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Eyebrow>From the centers</Eyebrow>
          <h2 className="mt-3 mb-10 text-3xl md:text-4xl">
            What it looks like
          </h2>
          <PhotoGallery />
        </div>
      </section>

      {/* ⑨ CTA band */}
      <section className="px-4 pb-20 sm:px-6 md:pb-28">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-vika-coral px-6 py-16 text-center text-white md:py-20">
          <h2 className="mx-auto max-w-2xl text-3xl md:text-5xl">
            Help a child stay curious.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/90">
            Your support keeps a center open, stocked and staffed by someone
            from the community.
          </p>
          <Link
            href="/donate"
            className="mt-8 inline-flex items-center rounded-full bg-white px-8 py-3.5 font-display text-lg font-semibold text-vika-coral shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Donate
          </Link>
        </div>
      </section>
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-display text-sm font-semibold uppercase tracking-wider text-vika-teal">
      {children}
    </span>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="font-display text-4xl font-bold text-foreground md:text-5xl">
        {value}
      </dd>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function PrincipleLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="font-medium underline decoration-vika-teal/40 underline-offset-4 transition-colors hover:decoration-vika-teal"
    >
      {children}
    </Link>
  )
}
