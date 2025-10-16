# Field Notes Client

A frontend dashboard for the Vismaya Kalike field reports pipeline. The application connects to a Supabase project and surfaces:

- District-level summaries of learning centres
- Centre-level rosters, facilitators, volunteers, and partner organisations
- Linked artefacts such as coordinator notes, child field notes, and generated monthly reports

The UI is built with React, TypeScript, Vite, Tailwind CSS, and Supabase JS.

## Prerequisites

- Node.js 18 or higher
- npm (ships with Node) or another compatible package manager
- Access to a Supabase project that exposes the views used by the app (for local development you can run `supabase start` from the `supabase/` folder after configuring your own seed data)

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create your environment file**
   ```bash
   cp env.example .env
   ```
   Update the new `.env` with your Supabase URL and anon/public key:
   ```ini
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
   ```
3. **Run the development server**
   ```bash
   npm run dev
   ```
   Visit the printed local URL (default `http://localhost:5173`) to open the dashboard.

## Additional Commands

- `npm run build` – Create a production build in `dist/`
- `npm run preview` – Preview the production build locally
- `npm run lint` – Run ESLint across the project

## Supabase Schema

Database migrations live in `supabase/migrations/`. The repository no longer includes live seed data; supply your own sample datasets before running the migrations locally or on a fresh project.

## Deployment

The project includes a `vercel.json` file configured for the Vite build output. Any static host that serves the `dist/` directory and rewrites unknown routes to `index.html` will work. Remember to set the `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` environment variables in your hosting platform.
