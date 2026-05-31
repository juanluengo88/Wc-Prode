# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build (also type-checks)
npm run lint     # Run ESLint
```

There are no tests in this project.

## Architecture

**WC-Prode** is a World Cup prediction app (prode) built with Next.js App Router, Tailwind CSS v4, and React 19. All state is in-memory mock data — there is no backend or database.

### State management

All app state lives in a single custom hook `src/hooks/useProdeApp.ts` and is exposed globally via `src/context/ProdeContext.tsx`. Every page and component reads state through `useProde()`. The context is mounted once in `src/app/layout.tsx` via `<ProdeProvider>`.

The hook owns: auth state (`isLoggedIn`, `currentUser`), the mock database (`matches`, `predictions`, `users`), and all mutation handlers (`handleSavePrediction`, `handleUpdateProfile`, etc.).

### Route protection

Protected pages (`/fixture`, `/predictions`, `/leaderboard`, `/profile`, `/match/[id]`) each use a `useEffect` + `router.push('/login')` pattern when `isLoggedIn` is false. There is no middleware. The home page at `/` is public.

### Data layer

All data lives in `src/lib/mockData.ts`, which exports the three core interfaces (`Match`, `Prediction`, `User`) and three arrays (`mockMatches`, `mockPredictions`, `mockUsers`). When replacing with a real API, this file and `useProdeApp.ts` are the only things that need to change.

Key business logic in `useProdeApp.ts`:
- Login injects the session user into the leaderboard and re-sorts by `totalPoints`.
- Match lock threshold is 15 minutes before `dateTime` (checked in `FixtureView` and `MatchDetailView`).
- Scoring: 3 pts exact score, 1 pt correct outcome, 0 pts wrong.

### Page ↔ component pattern

Each route file in `src/app/*/page.tsx` is thin: it reads from `useProde()`, handles auth redirect, and passes props down to a view component in `src/components/views/`. Navigation components (`TopNavbar`, `BottomNav`) are imported directly by each page, not at layout level.

### Styling

Tailwind CSS v4 with no config file — all theming is through Tailwind's `@theme inline` in `src/app/globals.css`. The design system is dark-first:
- Backgrounds: `slate-950` (page) / `slate-900` (cards)
- Accent: `amber-500` / `yellow-600` gradients
- Glass cards: `backdrop-blur-xl bg-slate-900/75 border border-slate-800 rounded-3xl`
- Gradient text: `bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent`
- Ambient glows: large `blur-[120px]` divs with `amber-500/5` or `indigo-500/8`

The React Compiler is enabled (`reactCompiler: true` in `next.config.ts`), so manual `useMemo`/`useCallback` is unnecessary.
