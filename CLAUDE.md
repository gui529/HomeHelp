# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build (run this to catch type errors)
npm run lint     # lint
```

## Environment Variables

Required in `.env.local`:
- `YELP_API_KEY` — Yelp Fusion API key (server-side only, never sent to client)
- `ADMIN_PASSWORD` — password for the `/admin` route
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)

## Architecture

**Next.js 16 App Router** — `params` and `searchParams` in page components are Promises and must be awaited.

### Data flow
- Yelp search → `lib/yelp.ts` → called server-side only (via API route or server component)
- Featured businesses → `lib/kv.ts` → Supabase `featured_businesses` table (just `id text primary key`)
- Starred favorites → browser `localStorage` only, no backend

### Key files
- `lib/yelp.ts` — `searchBusinesses(location, category, term, limit)` — all Yelp API calls go here
- `lib/kv.ts` — `getFeaturedIds()`, `addFeatured()`, `removeFeatured()` — Supabase reads/writes
- `lib/categories.ts` — category definitions with Yelp alias (`value`), search term (`term`), label, icon
- `app/api/search/route.ts` — proxies Yelp search to client (keeps API key server-side)
- `app/api/featured/route.ts` — GET returns featured IDs; POST (Bearer `ADMIN_PASSWORD`) adds/removes
- `app/admin/page.tsx` — password-gated admin UI for toggling featured listings
- `components/BusinessCard.tsx` — shared card used on home, search, and dashboard pages

### Featured listings
Businesses marked featured in `/admin` are stored in Supabase and surfaced first in search results with a gold border and "Sponsored" badge. Without Supabase credentials, `getFeaturedIds()` returns an empty set (graceful degradation).

### localStorage schema
```json
{ "starred": { "<yelp-business-id>": { /* Business object */ } } }
```
