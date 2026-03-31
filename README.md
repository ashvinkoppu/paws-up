# Paws Up

A virtual pet game that teaches financial literacy. Care for your pet while learning to budget, save, and spend wisely. By Ashvin Koppu.

## The Concept

Players adopt a virtual pet and must balance its needs (food, play, health, rest) against a limited budget. Every decision has a cost - teaching real-world financial trade-offs through engaging gameplay rather than lectures.

## Features

**Pet Care**

- 4 species (dog, cat, rabbit, hamster) with customizable colours, gender, and personality
- Dynamic stats: hunger, happiness, energy, cleanliness, health
- Teen/adult growth stages and leveling system
- Wardrobe system with 13 equippable accessories across 4 slots
- Park playground with fetch, feeding, agility, and NPC pet interactions

**Financial System**

- Weekly budget management with full transaction history
- 22 care items across 5 care categories, plus 13 wardrobe accessories
- Spending breakdown by category with custom budget visualisation
- Finance lessons based on current spending behaviour
- Consequences for overspending (pet needs go unmet)

**Gameplay**

- 4 mini-games to earn coins: Catch the Treat, Memory Match, Pet Trivia, Whack-a-Critter
- 5 daily tasks per day, including timed hard tasks and discount rewards
- 13 milestones across 3 difficulty tiers
- 10 achievements
- 8 random events (emergencies, discounts, opportunities)
- In-game day/night cycle with game clock

**Cloud Saves**

- Supabase authentication (email + Google OAuth)
- Progress syncs automatically across devices

**Other**

- AI-powered FAQ chatbot (GPT-5 Nano via Vercel Serverless Function)
- Interactive tutorial for new players
- Full privacy policy, terms of service, and attributions pages

## Tech Stack

| Category | Technology |
|---|---|
| **Language** | TypeScript |
| **Frontend Framework** | React 19 |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3 + tailwindcss-animate |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **Routing** | React Router DOM 6 |
| **State Management** | React Context + useReducer, TanStack React Query |
| **Backend / Auth** | Supabase (authentication + PostgreSQL) |
| **AI Chatbot** | OpenAI API (GPT-5 Nano) via Vercel Serverless Function |
| **Data Visualisation** | Custom React + Tailwind budget breakdown UI |
| **Icons** | Lucide React |
| **Fonts** | Google Fonts (Fredoka, Fraunces, Inconsolata) |
| **Notifications** | Sonner toast library |
| **Deployment / Analytics** | Vercel + Vercel Analytics + Speed Insights |

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

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `OPENAI_API_KEY` - OpenAI API key for the FAQ chatbot

Optional production variable:

- `SUPABASE_SERVICE_ROLE_KEY` - Recommended for server-side JWT verification in Vercel deployments

3. Run the Supabase migration to create the database tables:

```bash
npx supabase db push
```

Or manually run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor.

4. Start the development server:

```bash
npm run dev
```

This starts the Vite frontend at `http://localhost:8080`.

To also run the AI chatbot API proxy (requires the [Vercel CLI](https://vercel.com/docs/cli)):

```bash
npm run dev:full
```

## Project Structure

```
src/
├── components/
│   ├── chat/          # AI FAQ chatbot
│   ├── dashboard/     # Play/manage UI panels (finance, shop, achievements, tasks…)
│   ├── layout/        # Shared layout components (AnimatedSection, PublicFooter, …)
│   ├── mini-games/    # Catch, Memory, Trivia, and Whack mini-games
│   ├── overlays/      # Modals and overlays (events, tutorial, new day, confetti)
│   ├── park/          # Park playground scene
│   ├── pet/           # Pet display, stats, creation wizard, death overlay
│   └── ui/            # shadcn/ui primitives
├── context/           # AuthContext, GameContext, GameProvider, reducer
├── data/              # Static data: shop items, events, timing config
├── hooks/             # Custom hooks (use-scroll-state, use-mobile, use-toast)
├── lib/               # Supabase client, utils
├── pages/             # Route-level components
└── types/             # TypeScript type definitions
```

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with feature overview |
| `/login` | Sign in (email or Google) |
| `/signup` | Create an account |
| `/dashboard` | Main game (protected) |
| `/park` | Park area (protected) |
| `/faq` | FAQ and AI assistant |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/attributions` | Open-source, font, and asset credits |

## Libraries & Templates

### Core Framework

- **[React](https://react.dev/)** (v19) - UI component library
- **[TypeScript](https://www.typescriptlang.org/)** (v5) - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** (v5) - Frontend build tool and dev server
- **[React Router DOM](https://reactrouter.com/)** (v6) - Client-side routing

### UI & Styling

- **[Tailwind CSS](https://tailwindcss.com/)** (v3) - Utility-first CSS framework
- **[tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)** - Animation utilities
- **[shadcn/ui](https://ui.shadcn.com/)** - Component library built on Radix UI
- **[Radix UI](https://www.radix-ui.com/)** - Accessible, unstyled UI primitives
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[class-variance-authority](https://cva.style/)** - Component variant utility
- **[clsx](https://github.com/lukeed/clsx)** + **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Class name utilities
- **[Sonner](https://sonner.emilkowal.dev/)** - Toast notification library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme helper used by the Sonner toast wrapper

### Backend & Data

- **[Supabase](https://supabase.com/)** - Auth, PostgreSQL, real-time sync
- **[@supabase/auth-ui-react](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)** - Pre-built auth UI
- **[@supabase/auth-ui-shared](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)** - Shared Supabase Auth UI theming tokens
- **[TanStack React Query](https://tanstack.com/query)** - Server state management
- **[OpenAI API](https://platform.openai.com/)** - FAQ chatbot (GPT-5 Nano)
- **[Vercel Serverless Functions](https://vercel.com/docs/functions)** - Secure OpenAI proxy

### Deployment & Observability

- **[Vercel](https://vercel.com/)** - Hosting and serverless deployment
- **[@vercel/analytics](https://vercel.com/docs/analytics)** - Client-side usage analytics
- **[@vercel/speed-insights](https://vercel.com/docs/speed-insights)** - Performance telemetry

### Dev Tools

- **[ESLint](https://eslint.org/)** (v9) + **[typescript-eslint](https://typescript-eslint.io/)** - Linting
- **[PostCSS](https://postcss.org/)** + **[Autoprefixer](https://github.com/postcss/autoprefixer)** - CSS processing
- **[@vitejs/plugin-react-swc](https://github.com/nicolo-ribaudo/vite-plugin-react-swc)** - Fast React refresh
- **[concurrently](https://github.com/open-cli-tools/concurrently)** - Parallel dev scripts

### Fonts (via Google Fonts)

- **[Fredoka](https://fonts.google.com/specimen/Fredoka)** - Primary display font
- **[Fraunces](https://fonts.google.com/specimen/Fraunces)** - Serif accent font
- **[Inconsolata](https://fonts.google.com/specimen/Inconsolata)** - Monospace for numbers and code

## Asset Provenance

- Bundled pet sprite assets live in `src/assets/pet-dog.png`, `src/assets/pet-cat.png`, `src/assets/pet-rabbit.png`, and `src/assets/pet-hamster.png`.
- These PNGs are imported directly by the app and tinted at runtime via CSS filters in `src/data/petVisuals.ts`.
- This repository does not currently include a separate third-party stock-art or marketplace attribution file for those sprites. If externally sourced artwork is added later, document the creator, source URL, and license here and on `/attributions`.

## Credits & Attributions

See the full [Attributions page](/attributions) for third-party library licenses, font credits, and bundled asset notes.

- **[shadcn/ui](https://ui.shadcn.com/)** by shadcn - Component templates
- **[Radix UI](https://www.radix-ui.com/)** by WorkOS - Accessible primitives
- **[OpenAI](https://openai.com/)** - GPT-5 Nano powering the FAQ chatbot
- **[Supabase](https://supabase.com/)** - Authentication and database
- **[Google Fonts](https://fonts.google.com/)** - Fredoka, Fraunces, Inconsolata
- **[Lucide](https://lucide.dev/)** - Open-source icon set
- **[Vercel](https://vercel.com/)** - Hosting and serverless functions
- **Bundled pet sprite assets** - Stored locally under `src/assets/`; no separate third-party source is documented in-repo today
