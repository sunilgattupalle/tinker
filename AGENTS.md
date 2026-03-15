# AGENTS.md — Tinker

> A Scratch-like AI coding app for kids (and curious adults).
> Read `idea.md` for full product vision.

---

## Project Overview

Tinker is a browser-based visual coding environment where kids type what they want in plain English, and an AI character named **Cosmo** assembles Scratch-style blocks in response. Three-panel layout: block palette, script canvas, live sprite stage.

**Target user:** A 10-year-old who already uses Scratch. Don't dumb it down.

**Architecture:** Tinker is a custom React UI built on top of Scratch's open-source engine. We use `scratch-vm` for block execution and `scratch-render` for sprite rendering. All block definitions, execution timing, concurrency, and the sprite engine come from Scratch. We build the UI skin, the Cosmo AI layer, and the sharing system.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React 18+ with Vite | TypeScript, strict mode |
| Styling | Tailwind CSS | Kid-friendly but not babyish |
| Block execution | scratch-vm | Scratch's virtual machine — handles all block logic |
| Sprite rendering | scratch-render | Scratch's WebGL renderer — sprites, costumes, effects |
| Asset loading | scratch-storage | Scratch's asset loader |
| SVG processing | scratch-svg-renderer | Renders SVG costumes for scratch-render |
| Block UI | Custom React components | Our own styled block palette and script canvas |
| AI backend | Claude API (claude-sonnet) | Via proxy to protect API key |
| API proxy | Vite dev server proxy (local) / Cloudflare Worker (prod) | Never expose API key to client |
| State management | Zustand | Lightweight, wraps scratch-vm state for React reactivity |
| Project format | .sb3 (standard Scratch format) | Projects are compatible with scratch.mit.edu |
| Testing | Vitest + React Testing Library | Unit and component tests |
| Hosting | GitHub Pages via `gh-pages` | Free, static deployment |

---

## Directory Structure

```
tinker/
├── AGENTS.md              ← You are here
├── idea.md                ← Product vision & design notes
├── docs/
│   ├── architecture.md    ← System design, scratch-vm integration
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
│   ├── scratch/
│   │   ├── setup.ts       ← Initialize VM + Renderer, wire them together
│   │   ├── blockAdapter.ts ← Bridge between our UI and VM block API
│   │   ├── spriteAdapter.ts ← Bridge between our sprite UI and VM targets
│   │   └── opcodes.ts     ← Map of opcodes to UI-friendly labels/colors/categories
│   ├── components/
│   │   ├── BlockPalette/  ← Left panel: reads block defs from VM, renders styled blocks
│   │   ├── ScriptCanvas/  ← Middle panel: creates/edits VM blocks via adapter
│   │   ├── SpriteStage/   ← Right panel: mounts scratch-render canvas
│   │   ├── CosmoChat/     ← Bottom bar: AI input + Cosmo character
│   │   └── ui/            ← Shared UI primitives (buttons, modals, etc.)
│   ├── ai/
│   │   ├── client.ts      ← Claude API client (through proxy)
│   │   ├── prompts.ts     ← System prompts with scratch-vm opcode vocabulary
│   │   └── parser.ts      ← Converts AI response → VM block operations
│   ├── store/
│   │   ├── project.ts     ← Wraps VM state for React reactivity
│   │   └── ui.ts          ← UI state (selected category, active sprite, chat)
│   ├── types/
│   │   └── index.ts       ← Shared TypeScript types (adapter interfaces, UI types)
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
- Use descriptive names — `BlockAdapter`, not `BA`
- Export types from `src/types/index.ts` for shared use
- No `any` — use `unknown` and narrow
- scratch-vm and scratch-render are JavaScript libraries without types. Create local type declarations in `src/types/scratch.d.ts` for the APIs we use.

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
- The `project` store wraps scratch-vm — it subscribes to VM events and exposes reactive state
- The `ui` store holds UI-only state (selections, modals, chat history)
- Never mutate VM state directly from components — always go through the store or adapter

### Testing
- Every component gets a basic render test at minimum
- Test user interactions, not implementation details
- Mock scratch-vm in tests (it's a heavy dependency)
- AI integration tests mock the Claude API client

---

## How to Build Features

Each feature spec lives in `specs/` and is numbered for build order. When implementing a spec:

1. **Read the spec** — it contains acceptance criteria, component boundaries, and edge cases
2. **Check `docs/architecture.md`** — for how scratch-vm/render are wired up
3. **Check `docs/api-contracts.md`** — for adapter interfaces
4. **Implement** — follow the directory structure and conventions above
5. **Test** — write tests matching the acceptance criteria
6. **Verify** — run `npm run lint && npm run test` before considering it done

### Build order

| Spec | Depends on | Description |
|---|---|---|
| `01-scaffold.md` | Nothing | Project setup, Scratch deps, tooling, empty shell |
| `02-layout.md` | 01 | Three-panel layout + responsive shell |
| `03-block-system.md` | 02 | Block palette + script canvas (using scratch-vm block API) |
| `04-sprite-stage.md` | 03 | Mount scratch-render, wire VM, green flag/stop |
| `05-cosmo-ai.md` | 03, 04 | AI integration, Cosmo character, NL→sb3 blocks |
| `06-templates.md` | 03, 04, 05 | Starter .sb3 projects (pet sim, quiz, story) |
| `07-sharing.md` | 06 | Export/import .sb3 files, shareable URLs |

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

1. **scratch-vm for execution, scratch-render for rendering** — We don't build our own block interpreter or sprite renderer. Scratch's open-source engine handles all of that.
2. **Custom React UI, not scratch-gui** — We build our own block palette, script canvas, toolbar, and chat bar. We don't fork scratch-gui. This gives us full control over look, feel, and the AI integration.
3. **No Blockly / scratch-blocks** — Our block UI is custom React components. Blockly is too heavy and hard to restyle.
4. **Standard .sb3 format** — Projects are saved/loaded in Scratch's native format. A Tinker project can be opened in real Scratch.
5. **AI suggests, kid approves** — Cosmo never auto-executes. It proposes block changes and the kid clicks to accept.
6. **No user accounts** — Projects save to localStorage and export as .sb3 files. No backend, no database.
7. **TypeScript everywhere** — No `.js` files in `src/`. scratch-vm/render are JS but we wrap them with typed adapters.

---

## Scratch VM Cheat Sheet

Quick reference for agents working with scratch-vm:

```javascript
// Initialize
const vm = new VirtualMachine();
vm.attachRenderer(renderer);
vm.attachStorage(storage);

// Load a project
vm.loadProject(sb3ArrayBuffer);

// Run
vm.greenFlag();
vm.stopAll();
vm.start();  // start the VM tick loop

// Blocks — the VM listens to block events
vm.blockListener(event);  // Blockly-style event objects

// Targets (sprites)
vm.runtime.targets;              // all sprites + stage
vm.editingTarget;                // currently selected sprite
vm.setEditingTarget(targetId);

// Save
vm.saveProjectSb3();  // returns Promise<ArrayBuffer>

// Events
vm.on('targetsUpdate', callback);
vm.on('workspaceUpdate', callback);
vm.on('PROJECT_RUN_START', callback);
vm.on('PROJECT_RUN_STOP', callback);
```

### sb3 Block Format

Blocks in .sb3 JSON use this structure:
```json
{
  "opcode": "motion_movesteps",
  "next": "block-id-2",
  "parent": null,
  "inputs": { "STEPS": [1, [4, "10"]] },
  "fields": {},
  "shadow": false,
  "topLevel": true,
  "x": 0, "y": 0
}
```

Key opcodes: `event_whenflagclicked`, `motion_movesteps`, `motion_turnright`, `looks_sayforsecs`, `control_forever`, `control_repeat`, `control_wait`, `control_if`, `sensing_keypressed`

---

## What Not to Do

- Don't add user accounts, auth, or a backend database — everything is client-side
- Don't add real-time collaboration
- Don't add curriculum or lesson plans
- Don't use Blockly or scratch-blocks (we build our own lighter block UI)
- Don't fork scratch-gui — we build our own React app
- Don't build a custom block interpreter — scratch-vm handles execution
- Don't build a custom sprite renderer — scratch-render handles it
- Don't make it feel like a "learning platform" — it should feel like a *creative tool*
