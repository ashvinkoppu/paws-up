# Paws Up

A virtual pet game that teaches financial literacy. Care for your pet while learning to budget, save, and spend wisely. By Ashvin Koppu.

## The Concept

Players adopt a virtual pet and must balance its needs (food, play, health, rest) against a limited budget. Every decision has a cost—teaching real-world financial trade-offs through engaging gameplay rather than lectures.

## Features

**Pet Care**

- 4 species (dog, cat, rabbit, hamster) with customizable colors and personalities
- Dynamic stats: hunger, happiness, energy, cleanliness, health
- Growth stages and leveling system
- Equippable accessories

**Financial System**

- Weekly budget management with transaction tracking
- Shop with 40+ items across 6 categories
- Budget visualization and spending recommendations
- Consequences for overspending (pet needs go unmet)

**Gameplay**

- 4 mini-games to earn money (Catch the Treat, Memory, Quiz, Whack-a-Mole)
- Daily tasks with discount rewards
- 13 milestones across 3 difficulty tiers
- 20+ achievements
- Random events (emergencies, discounts, opportunities)

**Cloud Saves**

- Supabase authentication
- Progress syncs across devices

## Tech Stack

| Category | Technology |
|---|---|
| **Language** | TypeScript |
| **Frontend Framework** | React 19 |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3 + tailwindcss-animate |
| **UI Components** | shadcn/ui (built on Radix UI primitives) |
| **Routing** | React Router DOM 6 |
| **State Management** | React Context + useReducer, TanStack React Query |
| **Backend / Auth** | Supabase (authentication + PostgreSQL database) |
| **AI Chatbot** | OpenAI API (gpt-5-nano) via Vercel Serverless Functions |
| **Charts** | Recharts (via shadcn/ui chart component) |
| **Icons** | Lucide React |
| **Fonts** | Google Fonts (Fredoka, Fraunces, Inconsolata) |
| **Notifications** | Sonner toast library |
| **Deployment** | Vercel |

## Quick Start

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [OpenAI API key](https://platform.openai.com/api-keys) (for the FAQ chatbot)

### Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your keys:

```bash
cp .env.example .env.local
```

Required variables:

- `VITE_SUPABASE_URL` — Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Your Supabase anon/public key
- `OPENAI_API_KEY` — OpenAI API key for the chatbot

3. Run the Supabase migration to create the database tables:

```bash
npx supabase db push
```

Or manually run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor.

4. Start the development server:

```bash
npm run dev
```

This starts the Vite frontend at http://localhost:8080.

To also run the chatbot API proxy (requires [Vercel CLI](https://vercel.com/docs/cli)):

```bash
npm run dev:full
```

## Libraries & Templates

### Core Framework

- **[React](https://react.dev/)** (v19) — UI component library
- **[TypeScript](https://www.typescriptlang.org/)** (v5) — Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** (v5) — Frontend build tool and dev server
- **[React Router DOM](https://reactrouter.com/)** (v6) — Client-side routing

### UI & Styling

- **[Tailwind CSS](https://tailwindcss.com/)** (v3) — Utility-first CSS framework
- **[tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)** — Animation utilities for Tailwind
- **[shadcn/ui](https://ui.shadcn.com/)** — Re-usable component library built on Radix UI
- **[Radix UI](https://www.radix-ui.com/)** — Unstyled, accessible UI primitives (dialog, tabs, accordion, tooltip, popover, select, and more)
- **[Lucide React](https://lucide.dev/)** — Icon library
- **[class-variance-authority](https://cva.style/)** — Component variant utility
- **[clsx](https://github.com/lukeed/clsx)** + **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** — Conditional class name merging
- **[Recharts](https://recharts.org/)** — Charting library (used via shadcn/ui chart component)
- **[Sonner](https://sonner.emilkowal.dev/)** — Toast notification library
- **[next-themes](https://github.com/pacocoursey/next-themes)** — Theme management (dark/light mode)

### Backend & Data

- **[Supabase](https://supabase.com/)** (`@supabase/supabase-js`) — Authentication, PostgreSQL database, and real-time sync
- **[@supabase/auth-ui-react](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)** — Pre-built authentication UI components
- **[TanStack React Query](https://tanstack.com/query)** — Server state management and data fetching
- **[OpenAI API](https://platform.openai.com/)** — Powers the FAQ chatbot (called via serverless proxy)
- **[Vercel Serverless Functions](https://vercel.com/docs/functions)** (`@vercel/node`) — API proxy for secure OpenAI calls

### Dev Tools

- **[ESLint](https://eslint.org/)** (v9) — Code linting
- **[typescript-eslint](https://typescript-eslint.io/)** — TypeScript-specific lint rules
- **[PostCSS](https://postcss.org/)** + **[Autoprefixer](https://github.com/postcss/autoprefixer)** — CSS processing
- **[@vitejs/plugin-react-swc](https://github.com/nicolo-ribaudo/vite-plugin-react-swc)** — Fast React refresh with SWC compiler
- **[concurrently](https://github.com/open-cli-tools/concurrently)** — Run multiple dev scripts in parallel

### Fonts (via Google Fonts)

- **[Fredoka](https://fonts.google.com/specimen/Fredoka)** — Primary display font
- **[Fraunces](https://fonts.google.com/specimen/Fraunces)** — Serif accent font
- **[Inconsolata](https://fonts.google.com/specimen/Inconsolata)** — Monospace font for numerical data

## Credits & Attributions

- **[Lovable](https://lovable.dev/)** — Initial project scaffolding and boilerplate generation
- **[shadcn/ui](https://ui.shadcn.com/)** by [shadcn](https://github.com/shadcn) — Component templates adapted for the game UI
- **[Radix UI](https://www.radix-ui.com/)** by Workos — Accessible UI primitives powering shadcn/ui components
- **[OpenAI](https://openai.com/)** — GPT-5 Nano model powering the in-game FAQ chatbot
- **[Supabase](https://supabase.com/)** — Open-source Firebase alternative providing authentication and database
- **[Google Fonts](https://fonts.google.com/)** — Fredoka, Fraunces, and Inconsolata typefaces
- **[Lucide](https://lucide.dev/)** — Open-source icon set
- **[Vercel](https://vercel.com/)** — Hosting platform and serverless function runtime
