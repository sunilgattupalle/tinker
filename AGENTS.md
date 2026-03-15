# AGENTS.md — Tinker

> A Scratch-like AI coding app for kids (and curious adults).
> Read `idea.md` for full product vision.

---

## Project Overview

Tinker is a browser-based visual coding environment where kids type what they want in plain English, and an AI character named **Cosmo** assembles Scratch-style blocks in response. Three-panel layout: block palette, script canvas, live sprite stage.

**Target user:** A 10-year-old who already uses Scratch. Don't dumb it down.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React 18+ with Vite | TypeScript, strict mode |
| Styling | Tailwind CSS | Kid-friendly but not babyish |
| Block rendering | Custom React components | Inspired by Scratch/Blockly visual style |
| Block execution | Sandboxed iframe with canvas | Sprites run in isolated preview |
| AI backend | Claude API (claude-sonnet) | Via proxy to protect API key |
| API proxy | Vite dev server proxy (local) / Cloudflare Worker (prod) | Never expose API key to client |
| State management | Zustand | Lightweight, minimal boilerplate |
| Testing | Vitest + React Testing Library | Unit and component tests |
| Hosting | GitHub Pages via `gh-pages` | Free, static deployment |

---

## Directory Structure

```
tinker/
├── AGENTS.md              ← You are here
├── idea.md                ← Product vision & design notes
├── docs/
│   ├── architecture.md    ← System design, component boundaries
│   ├── design-system.md   ← Colors, typography, layout specs
│   └── api-contracts.md   ← Interfaces between components
├── specs/
│   ├── 01-scaffold.md
│   ├── 02-layout.md
│   ├── 03-block-system.md
│   ├── 04-sprite-stage.md
│   ├── 05-cosmo-ai.md
│   ├── 06-templates.md
│   └── 07-sharing.md
├── specs/future/              ← Parked: community gallery (build later)
│   └── 08-community.md
├── docs/future/
│   └── community-architecture.md
├── public/
│   └── assets/            ← Sprites, sounds, images
├── src/
│   ├── main.tsx           ← App entry point
│   ├── App.tsx            ← Root component, layout shell
│   ├── components/
│   │   ├── BlockPalette/  ← Left panel: categorized blocks
│   │   ├── ScriptCanvas/  ← Middle panel: drag-and-drop block assembly
│   │   ├── SpriteStage/   ← Right panel: live sprite preview (iframe/canvas)
│   │   ├── CosmoChat/     ← Bottom bar: AI input + Cosmo character
│   │   └── ui/            ← Shared UI primitives (buttons, modals, etc.)
│   ├── blocks/
│   │   ├── definitions.ts ← Block type definitions (motion, looks, sound, etc.)
│   │   ├── registry.ts    ← Block registry and lookup
│   │   └── interpreter.ts ← Executes block sequences on sprites
│   ├── ai/
│   │   ├── client.ts      ← Claude API client (through proxy)
│   │   ├── prompts.ts     ← System prompts for Cosmo personality
│   │   └── parser.ts      ← Converts AI response → block sequences
│   ├── sprites/
│   │   ├── engine.ts      ← Sprite runtime (position, costume, movement)
│   │   └── renderer.ts    ← Canvas rendering for sprite stage
│   ├── store/
│   │   ├── project.ts     ← Current project state (blocks, sprites, stage)
│   │   └── ui.ts          ← UI state (selected category, active sprite)
│   ├── types/
│   │   └── index.ts       ← Shared TypeScript types
│   └── utils/
│       └── index.ts       ← Helpers
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── index.html
```

---

## Coding Conventions

### TypeScript
- Strict mode enabled (`"strict": true`)
- Prefer `interface` over `type` for object shapes
- Use descriptive names — `BlockDefinition`, not `BD`
- Export types from `src/types/index.ts` for shared use
- No `any` — use `unknown` and narrow

### React
- Functional components only
- Named exports (not default exports)
- Co-locate component styles and tests:
  ```
  BlockPalette/
  ├── BlockPalette.tsx
  ├── BlockPalette.test.tsx
  └── index.ts          ← re-export
  ```
- Props interfaces named `{ComponentName}Props`
- Keep components under 150 lines — extract hooks and helpers

### Styling
- Tailwind utility classes in JSX
- Use Tailwind `@apply` sparingly, only for highly reused patterns
- Design tokens defined in `tailwind.config.ts` (colors, spacing, fonts)
- Mobile-friendly but desktop-first (primary use case is a family computer)

### State
- Zustand stores in `src/store/`
- One store per domain: `project` (blocks, sprites) and `ui` (selections, modals)
- Never mutate state directly — use Zustand's `set()`

### Testing
- Every component gets a basic render test at minimum
- Test user interactions, not implementation details
- AI integration tests can mock the Claude API client

---

## How to Build Features

Each feature spec lives in `specs/` and is numbered for build order. When implementing a spec:

1. **Read the spec** — it contains acceptance criteria, component boundaries, and edge cases
2. **Check `docs/architecture.md`** — for how the feature fits into the system
3. **Check `docs/api-contracts.md`** — for interfaces between components
4. **Implement** — follow the directory structure and conventions above
5. **Test** — write tests matching the acceptance criteria
6. **Verify** — run `npm run lint && npm run test` before considering it done

### Build order

| Spec | Depends on | Description |
|---|---|---|
| `01-scaffold.md` | Nothing | Project setup, tooling, empty shell |
| `02-layout.md` | 01 | Three-panel layout + responsive shell |
| `03-block-system.md` | 02 | Block definitions, palette, drag-to-canvas |
| `04-sprite-stage.md` | 03 | Sprite engine, canvas renderer, block execution |
| `05-cosmo-ai.md` | 03, 04 | AI integration, Cosmo character, NL→blocks |
| `06-templates.md` | 03, 04, 05 | Starter projects (pet sim, quiz, story) |
| `07-sharing.md` | 06 | Export/import projects, shareable URLs (no backend) |

---

## Commands

```bash
npm run dev          # Start dev server (hot reload)
npm run build        # Production build
npm run preview      # Preview production build locally
npm run test         # Run tests (Vitest)
npm run lint         # Lint (ESLint + TypeScript)
npm run deploy       # Deploy to GitHub Pages
```

---

## Key Decisions (Do Not Re-debate)

1. **Blocks are React components, not Blockly** — We render our own block UI for full control over styling and interaction. No Blockly dependency.
2. **Sprites run in a canvas, not DOM** — The sprite stage is a `<canvas>` element for smooth animation and proper layering.
3. **AI suggests, kid approves** — Cosmo never auto-executes. It proposes block changes and the kid clicks to accept.
4. **No user accounts** — Projects save to localStorage. No backend, no database.
5. **TypeScript everywhere** — No `.js` files in `src/`.

---

## What Not to Do

- Don't add user accounts, auth, or a backend database — everything is client-side
- Don't add real-time collaboration
- Don't add curriculum or lesson plans
- Don't use Blockly (we build our own lighter block UI)
- Don't make it feel like a "learning platform" — it should feel like a *creative tool*
