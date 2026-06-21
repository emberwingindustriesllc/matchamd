# MatchaMD

A community and pathway app for foreign medical graduates (FMGs/IMGs) pursuing
US residency and fellowship positions — connect, share resources, and track the
match journey together.

> Owned and operated by **EmberWing LLC**.

## Tech stack

- **Frontend:** React + Vite, Tailwind CSS, shadcn/ui (Radix primitives)
- **Backend / Auth / DB:** Supabase
- **Mobile:** Capacitor (Android & iOS)
- **Payments:** Stripe (web) + RevenueCat (in-app purchases)
- **Hosting:** Vercel

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Install & run

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase keys
npm run dev
```

### Environment variables

See [`.env.example`](./.env.example) for the full list. The essentials:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript checker |

### Mobile (Android via Capacitor)

```bash
npm run build
npx cap sync android
npx cap open android
```

## License & ownership

Proprietary. © EmberWing LLC. All rights reserved.
