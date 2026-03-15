# Architecture — Tinker

## System Overview

Tinker is a multi-mode creation platform. The UI shell (toolbar, chat bar, welcome screen) is shared. The three middle panels change based on which mode the kid selected.

```
┌──────────────────────────────────────────────────────────────────┐
│  Toolbar (shared)                                                │
│  [Run/Stop or Refresh]  [Project Name]  [Share]                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   MODE = 'scratch' (Game Mode)                                   │
│   ┌──────────┐  ┌──────────────┐  ┌────────────────────┐       │
│   │  Block    │  │   Script     │  │   Sprite Stage     │       │
│   │  Palette  │  │   Canvas     │  │  (scratch-render)  │       │
│   └──────────┘  └──────────────┘  └────────────────────┘       │
│                                                                  │
│   MODE = 'web' (Web Mode)                                        │
│   ┌──────────┐  ┌──────────────┐  ┌────────────────────┐       │
│   │  Element  │  │   Code       │  │   Live Preview     │       │
│   │  Palette  │  │   Editor     │  │  (sandboxed iframe) │       │
│   └──────────┘  └──────────────┘  └────────────────────┘       │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  Cosmo Chat Bar (shared — mode-aware prompts)                    │
│  [Cosmo avatar] [chat messages] [input field]                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Mode System

The `mode` field lives in the UI store (`src/store/ui.ts`). It is set when the kid picks a template on the Welcome Screen and persists for the session.

```
Welcome Screen
    │
    ├── "Build a Game" templates → mode = 'scratch'
    │       └── loads sb3 JSON into scratch-vm via project store
    │
    └── "Build a Website" templates → mode = 'web'
            └── loads HTML string into webProject store
```

`App.tsx` reads `mode` and conditionally renders the appropriate panels. The toolbar and chat bar adapt their behavior based on mode.

---

## Game Mode (scratch-vm)

### Engine

- `scratch-vm` (BSD-3): block execution, events, timing, concurrency, sprite state
- `scratch-render` (AGPL-3): WebGL sprite rendering, costumes, layering, effects
- `scratch-storage` (BSD-3): asset loading from Scratch CDN

### Adapter Layer (`src/scratch/`)

Components never call scratch-vm directly. They go through adapters:

- **`setup.ts`** — creates VM, renderer, storage. Wires them together. Exports `initializeScratchVM(canvas)`.
- **`blockAdapter.ts`** — creates, connects, disconnects, deletes blocks via `vm.blockListener()`.
- **`spriteAdapter.ts`** — manages targets (sprites). Add, delete, select.
- **`opcodes.ts`** — maps scratch-vm opcodes to UI-friendly metadata (label, color, category, shape).

### State (`src/store/project.ts`)

Zustand store wrapping scratch-vm. Subscribes to VM events (`targetsUpdate`, `workspaceUpdate`) and exposes reactive state to React: `targets`, `blocks`, `isRunning`, `editingTargetId`.

### AI Flow

```
Kid types: "make the cat jump when I press space"
    │
    ▼
ai/client.ts → POST /api/ai/v1/messages (Claude API via proxy)
    │            with system prompt from ai/prompts.ts
    │            + project context from ai/context.ts
    ▼
ai/parser.ts → validates opcodes against opcodeRegistry
    │            extracts ProposedBlockSet
    ▼
CosmoChat → shows explanation + BlockPreview
    │          kid clicks Accept
    ▼
ai/proposalToBlocks.ts → blockAdapter.createBlock() + connectBlocks()
    │
    ▼
scratch-vm executes blocks on green flag
```

### Project Format

Standard `.sb3` (Scratch 3.0 ZIP). Projects are compatible with scratch.mit.edu.

---

## Web Mode (HTML/CSS)

### Engine

No external engine. The kid's HTML code is rendered in a sandboxed `<iframe>` using the `srcdoc` attribute. Updates are instant — change the code, the preview refreshes.

### Components (`src/components/web/`)

- **`CodeEditor.tsx`** — styled `<textarea>` with monospace font. Receives `code` from `webProject` store, dispatches `setCode` on change.
- **`WebPreview.tsx`** — `<iframe sandbox="allow-scripts" srcdoc={code}>`. Re-renders when code changes (debounced).
- **`ElementPalette.tsx`** — grid of clickable HTML snippets (headings, paragraphs, images, buttons, lists). Clicking inserts the snippet into the code.

### State (`src/store/webProject.ts`)

Simple Zustand store:
- `code: string` — the full HTML document (includes inline `<style>`)
- `projectName: string`
- `setCode(code)` — manual editing
- `applyAICode(html)` — replace code from AI suggestion

### AI Flow

```
Kid types: "make a website about dinosaurs with a big title"
    │
    ▼
ai/client.ts → POST /api/ai/v1/messages (Claude API via proxy)
    │            with system prompt from ai/webPrompts.ts
    │            + current HTML from webProject store
    ▼
ai/webParser.ts → extracts HTML from markdown code block in response
    │               returns { explanation, html }
    ▼
CosmoChat → shows explanation + HTML preview (mini iframe or code snippet)
    │          kid clicks Accept
    ▼
webProject.applyAICode(html) → code updates → preview refreshes
```

### Project Format

A single `.html` file containing the full document (HTML + inline CSS). No build step, no bundling. The file opens in any browser.

---

## Shared Components

### Toolbar (`src/components/ui/Toolbar.tsx`)

- Game Mode: green flag + stop buttons, project name, share
- Web Mode: refresh button (or auto-refreshes), project name, share

### CosmoChat (`src/components/CosmoChat/CosmoChat.tsx`)

Mode-aware chat bar:
- Reads `mode` from UI store
- Game Mode: uses `prompts.ts`, `parser.ts`, shows `BlockPreview`, accept calls `applyProposal`
- Web Mode: uses `webPrompts.ts`, `webParser.ts`, shows HTML preview, accept calls `applyAICode`

### WelcomeScreen (`src/components/ui/WelcomeScreen.tsx`)

Shows on first load. Two sections:
- "Build a Game" — game templates (blank, pet sim, quiz, story)
- "Build a Website" — web templates (blank page, about me, fun facts, photo gallery)

Selecting a template sets `mode` and loads the project.

### ShareModal (`src/components/ui/ShareModal.tsx`)

- Game Mode: .sb3 download + URL sharing
- Web Mode: .html download + URL sharing

---

## State Architecture

```
┌─────────────────────────────────────────────┐
│  UI Store (shared)                          │
│  mode, chatMessages, activeModal,           │
│  showWelcome, isCosmoThinking               │
├─────────────────────┬───────────────────────┤
│  Project Store      │  WebProject Store     │
│  (Game Mode)        │  (Web Mode)           │
│  vm, targets,       │  code, projectName    │
│  blocks, isRunning  │                       │
│  projectName        │                       │
└─────────────────────┴───────────────────────┘
```

Only one mode-specific store is active at a time, determined by `ui.mode`.

---

## License Notes

- **scratch-vm:** BSD-3-Clause (permissive)
- **scratch-render:** AGPL-3.0 (copyleft — source must be available if hosted publicly)
- **scratch-storage:** BSD-3-Clause
- **scratch-svg-renderer:** BSD-3-Clause

AGPL-3.0 is appropriate for educational open-source software.
