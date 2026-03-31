# Contributing to Paws Up

Thanks for your interest in contributing. Here's what you need to know.

## Project Stack

- **Framework:** React 19 + TypeScript + Vite
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Backend/Auth:** Supabase
- **Data fetching:** TanStack React Query
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (for auth and database)
- A Vercel account (optional, for full local API emulation)

### Setup

```bash
git clone https://github.com/<org>/paws-up.git
cd paws-up
npm install
```

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running locally

```bash
# Frontend only (no API routes)
npm run dev

# Frontend + Vercel serverless functions
npm run dev:full
```

The app runs at `http://localhost:8080` by default. API functions run on port 3000 via `vercel dev`.

## Project Structure

```
src/
├── api/              # Vercel serverless functions (also under /api at root)
├── components/       # Reusable UI components
│   ├── layout/       # App-level layout components (navbar, error boundary, etc.)
│   └── ui/           # shadcn/ui generated components — don't edit these directly
├── context/          # React context providers (AuthContext, GameContext)
├── hooks/            # Custom React hooks
├── integrations/     # Third-party client setup (Supabase)
├── lib/              # Shared utilities
├── pages/            # Route-level page components
└── types/            # Shared TypeScript types
```

## Making Changes

### Branches

- `main` — production branch, protected
- `redesign` — active development branch (base your work off this)
- Feature branches: `feature/<short-description>`
- Bug fixes: `fix/<short-description>`

Create your branch from `redesign`:

```bash
git checkout redesign
git pull
git checkout -b feature/your-feature-name
```

### Code style

- Use full variable names — no abbreviations (`response` not `res`, `request` not `req`)
- TypeScript everywhere — avoid `any`
- Components go in `src/components/` or `src/pages/` depending on whether they're route-level
- Don't edit files under `src/components/ui/` directly — those are managed by shadcn/ui. If you need a customized variant, compose it in a new component

### Adding a new page

1. Create `src/pages/YourPage.tsx`
2. Import and add the route in `src/App.tsx`
3. If it needs auth protection, wrap it in `<ProtectedRoute>`

### Adding shadcn/ui components

```bash
npx shadcn@latest add <component-name>
```

This copies the component source into `src/components/ui/`. Commit it like any other file.

## Pull Requests

- Base PRs against the `redesign` branch (not `main`)
- Keep PRs focused — one feature or fix per PR
- Include a clear description of what changed and why
- Screenshots or screen recordings are helpful for UI changes
- Make sure `npm run build` passes before opening a PR

```bash
npm run build   # must pass
npm run lint    # must pass
```

## Reporting Bugs

Open an issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser and OS

## Questions

Open a GitHub Discussion or drop a comment on the relevant issue.
