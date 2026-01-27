# Vismaya Kalike Dashboard

A Next.js dashboard for the Vismaya Kalike field reports pipeline. The application connects to Supabase and Sanity CMS to surface:

- District-level summaries of learning centres
- Centre-level rosters, facilitators, volunteers, and partner organisations
- Linked artefacts such as coordinator notes, child field notes, and generated monthly reports
- CMS-driven content pages with internationalization (English and Kannada)
- Activity catalog with filtering and detail views

The UI is built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase, and Sanity CMS.

## Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm
- Access to a Supabase project with the required database schema
- Access to a Sanity project for CMS content

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Create your environment file**
   ```bash
   cp .env.local.template .env.local
   ```
   Update `.env.local` with your credentials:
   ```ini
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-publishable-key

   # Sanity Configuration
   NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
   NEXT_PUBLIC_SANITY_DATASET=production

   # Sanity Studio Configuration
   SANITY_STUDIO_PROJECT_ID=your-sanity-project-id
   SANITY_STUDIO_DATASET=production
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   ```
   Visit `http://localhost:3000` to open the dashboard.

## Available Scripts

- `pnpm dev` – Start Next.js development server
- `pnpm build` – Create production build in `.next/`
- `pnpm start` – Start production server
- `pnpm lint` – Run ESLint
- `pnpm sanity` – Start Sanity Studio locally
- `pnpm sanity:deploy` – Deploy Sanity Studio

## Project Structure

```
client/
├── app/              # Next.js App Router pages
│   └── [locale]/     # Internationalized routes
├── components/       # React components
│   ├── ui/          # Shadcn/ui components
│   └── ...
├── lib/             # Utilities and clients
│   ├── sanity/      # Sanity CMS client and queries
│   └── supabase.ts  # Supabase client
├── messages/        # i18n translations (en.json, kn.json)
├── sanity/          # Sanity schema definitions
├── types/           # TypeScript type definitions
└── public/          # Static assets
```

## Database Schema

Database migrations live in `supabase/migrations/`. The repository no longer includes live seed data; supply your own sample datasets before running the migrations locally or on a fresh project.

Key database views:
- `districts_summary` – Learning centres count by district
- `learning_centres_with_details` – Full centre information with facilitators and partners

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Set environment variables in Vercel project settings
4. Deploy

### Other Platforms

The application is a standard Next.js app and can be deployed to any platform that supports Next.js:

1. Build the application: `pnpm build`
2. Set the required environment variables
3. Start the server: `pnpm start`

**Required Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`

## Features

- **Internationalization**: Full i18n support with English and Kannada locales
- **CMS-Driven Content**: Dynamic pages powered by Sanity CMS
- **Learning Centers**: Browse learning centers by state and district
- **Activities Catalog**: Searchable activity database with detailed information
- **Dark Mode**: System-aware theme switching
- **Responsive Design**: Mobile-first, fully responsive UI
