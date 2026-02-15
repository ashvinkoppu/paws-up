# Paws Up

A virtual pet game that teaches financial literacy. Care for your pet while learning to budget, save, and spend wisely.

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

React + TypeScript, Vite, Tailwind CSS, shadcn/ui, Supabase, Recharts

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
