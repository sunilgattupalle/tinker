# AGENTS.md — Tinker

> An AI-powered creation platform for kids (and curious adults).
> Read `idea.md` for full product vision.

---

## Project Overview

Tinker is a browser-based creation platform where kids type what they want in plain English, and an AI character named **Cosmo** builds it. Two creation modes:

- **Game Mode** — Scratch-style blocks and sprites, powered by `scratch-vm` + `scratch-render`
- **Web Mode** — HTML/CSS websites with a live preview iframe

Same Cosmo, same layout pattern (palette + workspace + preview), same sharing model — just different canvases.

**Target user:** A 10-year-old who already uses Scratch. Don't dumb it down.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React 18+ with Vite | TypeScript, strict mode |
| Styling | Tailwind CSS | Kid-friendly but not babyish |
| Game Mode engine | scratch-vm + scratch-render | Scratch's open-source block execution + WebGL renderer |
| Web Mode preview | Sandboxed iframe (`srcdoc`) | No dependencies, instant feedback |
| AI backend | Claude API (claude-sonnet) | Via proxy to protect API key |
| API proxy | Vite dev server proxy (local) / Cloudflare Worker (prod) | Never expose API key to client |
| State management | Zustand | Lightweight stores per mode |
| Testing | Vitest + React Testing Library | Unit and component tests |
| Hosting | GitHub Pages via `gh-pages` | Free, static deployment |

---

## Directory Structure

```
tinker/
├── AGENTS.md              ← You are here
├── idea.md                ← Product vision & design notes
├── docs/
│   ├── architecture.md    ← System design, multi-mode architecture
│   └── design-system.md   ← Colors, typography, layout specs
├── specs/
│   ├── 08-multi-mode.md   ← Mode system, welcome screen, conditional layout
│   └── 09-web-mode.md     ← Web mode components, AI, templates, sharing
├── specs/future/
│   └── 08-community.md    ← Parked: community gallery (build later)
├── docs/future/
│   └── community-architecture.md
├── src/
│   ├── main.tsx           ← App entry point
│   ├── App.tsx            ← Root component — renders Game or Web layout based on mode
│   │
│   ├── scratch/           ← Game Mode: scratch-vm adapter layer
│   │   ├── setup.ts       ← Initialize VM + Renderer + Storage
│   │   ├── blockAdapter.ts ← Bridge UI ↔ VM block API
│   │   ├── spriteAdapter.ts ← Bridge UI ↔ VM targets
│   │   └── opcodes.ts     ← Opcode registry (labels, colors, categories)
│   │
│   ├── components/
│   │   ├── BlockPalette/  ← Game Mode: block palette (left panel)
│   │   ├── ScriptCanvas/  ← Game Mode: script editor (middle panel)
│   │   ├── SpriteStage/   ← Game Mode: scratch-render canvas (right panel)
│   │   ├── web/           ← Web Mode: code editor, preview, element palette
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── WebPreview.tsx
│   │   │   └── ElementPalette.tsx
│   │   ├── CosmoChat/     ← Shared: AI chat bar (mode-aware)
│   │   └── ui/            ← Shared: Toolbar, WelcomeScreen, ShareModal, etc.
│   │
│   ├── ai/
│   │   ├── client.ts      ← Shared: Claude API HTTP client
│   │   ├── prompts.ts     ← Game Mode: system prompt with scratch-vm opcodes
│   │   ├── parser.ts      ← Game Mode: parse AI response → block proposals
│   │   ├── context.ts     ← Game Mode: build project context from VM state
│   │   ├── proposalToBlocks.ts ← Game Mode: apply proposals to VM
│   │   ├── webPrompts.ts  ← Web Mode: system prompt for HTML/CSS generation
│   │   └── webParser.ts   ← Web Mode: extract HTML from AI response
│   │
│   ├── store/
│   │   ├── project.ts     ← Game Mode: wraps scratch-vm state for React
│   │   ├── webProject.ts  ← Web Mode: HTML code state
│   │   └── ui.ts          ← Shared: mode, chat, modals, welcome screen
│   │
│   ├── templates/
│   │   ├── templates.ts   ← Game Mode: template configs + loader
│   │   ├── projects.ts    ← Game Mode: programmatic .sb3 project builders
│   │   ├── webTemplates.ts ← Web Mode: template configs + loader
│   │   └── webProjects.ts ← Web Mode: HTML template strings
│   │
│   ├── sharing/
│   │   ├── export.ts      ← Game Mode: .sb3 export
│   │   ├── import.ts      ← Game Mode: .sb3 import + drop zone
│   │   ├── urlShare.ts    ← Game Mode: URL sharing with pako
│   │   ├── webExport.ts   ← Web Mode: .html export
│   │   └── thumbnail.ts   ← Shared: canvas thumbnail
│   │
│   ├── types/
│   │   ├── index.ts       ← Shared TypeScript types
│   │   └── scratch.d.ts   ← scratch-vm type declarations
│   └── test/
│       └── setup.ts       ← Test setup with mocks
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── index.html
```

---

## Coding Conventions

### TypeScript
- Strict mode enabled (`"strict": true`)
- Prefer `interface` over `type` for object shapes
- No `any` — use `unknown` and narrow
- scratch-vm/render are JavaScript; type declarations in `src/types/scratch.d.ts`

### React
- Functional components only, named exports
- Co-locate component styles and tests (`BlockPalette.tsx` + `BlockPalette.test.tsx`)
- Props interfaces named `{ComponentName}Props`
- Keep components under 150 lines

### Styling
- Tailwind utility classes in JSX
- Design tokens in `tailwind.config.ts` (from `docs/design-system.md`)
- Desktop-first, responsive down to 1024px

### State
- `ui` store: shared state (mode, chat, modals). Mode-agnostic.
- `project` store: Game Mode state (wraps scratch-vm)
- `webProject` store: Web Mode state (HTML code string)
- Never mutate VM state directly from components — go through adapters

### Testing
- Every component gets a basic render test
- Mock scratch-vm in tests
- AI integration tests mock the Claude API client

---

## How to Build Features

Specs live in `specs/` and are numbered. When implementing a spec:

1. **Read the spec** — acceptance criteria, component boundaries, edge cases
2. **Check `docs/architecture.md`** — for how modes and shared components work
3. **Check `docs/design-system.md`** — for visual design tokens
4. **Implement** — follow the directory structure above
5. **Test** — `npm run lint && npm run test` before considering it done

### Current Build Order

| Spec | Status | Description |
|---|---|---|
| 01-07 | Done | Game Mode: scaffold, layout, blocks, stage, AI, templates, sharing |
| `08-multi-mode.md` | Next | Mode system, welcome screen redesign, conditional layout |
| `09-web-mode.md` | Next | Web components, AI, templates, sharing |

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

1. **Multi-mode architecture** — Tinker supports multiple creation modes (Game, Web, future others). Each mode has its own store, components, AI prompts, templates, and sharing logic. Shared: Cosmo chat, toolbar, welcome screen, AI HTTP client.
2. **scratch-vm for Game Mode** — We don't build our own block interpreter. Scratch's engine handles execution.
3. **Custom React UI, not scratch-gui** — Full control over look, feel, and AI integration.
4. **Sandboxed iframe for Web Mode** — `srcdoc` attribute for instant preview. No server needed.
5. **AI suggests, kid approves** — Cosmo never auto-executes. Proposes changes, kid clicks Accept.
6. **No user accounts** — Everything client-side. No backend, no database.
7. **Mode selected on welcome screen** — Kid picks what they're building, layout adapts.

---

## Scratch VM Cheat Sheet (Game Mode)

```javascript
// Initialize
const vm = new VirtualMachine();
vm.attachRenderer(renderer);
vm.attachStorage(storage);

// Load / Run
vm.loadProject(sb3ArrayBuffer);
vm.greenFlag();
vm.stopAll();
vm.start();

// Blocks
vm.blockListener(event);  // Blockly-style event objects

// Targets (sprites)
vm.runtime.targets;
vm.editingTarget;
vm.setEditingTarget(targetId);

// Save
vm.saveProjectSb3();  // returns Promise<Blob>

// Events
vm.on('targetsUpdate', callback);
vm.on('workspaceUpdate', callback);
vm.on('PROJECT_RUN_START', callback);
vm.on('PROJECT_RUN_STOP', callback);
```

---

## What Not to Do

- Don't add user accounts, auth, or a backend database
- Don't use Blockly or scratch-blocks (custom React block UI)
- Don't fork scratch-gui
- Don't build a custom block interpreter (scratch-vm handles it)
- Don't build a custom sprite renderer (scratch-render handles it)
- Don't make it feel like a "learning platform" — it's a *creative tool*
- Don't add heavyweight code editors (CodeMirror, Monaco) for Web Mode MVP — a styled textarea is enough
