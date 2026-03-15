# Spec 08 — Multi-Mode System

**Depends on:** Specs 01-07 (all completed)
**Outcome:** Tinker supports multiple creation modes. The welcome screen lets kids choose "Build a Game" or "Build a Website". The app layout adapts based on the selected mode. Shared components (toolbar, chat bar) are mode-aware.

---

## What to Build

The mode system that makes Tinker a multi-creation platform instead of a Scratch-only app. This spec covers the infrastructure — the actual Web Mode components come in spec 09.

---

## Tasks

### 1. Add mode to UI store

Update `src/store/ui.ts`:
- Add `mode: 'scratch' | 'web' | null` (default `null` — no mode until welcome screen)
- Add `setMode(mode: 'scratch' | 'web')` action
- Add `TinkerMode` type to `src/types/index.ts`

### 2. Add `proposedHtml` to chat message type

Update `src/types/index.ts`:
- Add `proposedHtml?: string` to the `ChatMessage` interface (alongside existing `proposedBlocks`)
- This allows the same chat message type to carry either Scratch block proposals or HTML proposals

### 3. Revamp Welcome Screen

Update `src/components/ui/WelcomeScreen.tsx`:
- Two sections: "Build a Game" and "Build a Website"
- Each section shows its templates as cards
- Game templates come from `src/templates/templates.ts` (existing)
- Web templates come from `src/templates/webTemplates.ts` (spec 09)
- Clicking a game template: `setMode('scratch')` + load scratch template (existing flow)
- Clicking a web template: `setMode('web')` + load web template into webProject store
- Visual: each section has a distinct color/icon. Game = controller icon. Web = browser icon.

### 4. Conditional layout in App.tsx

Update `src/App.tsx`:
- Read `mode` from UI store
- When `mode === null`: only show WelcomeScreen
- When `mode === 'scratch'`: render existing Game Mode layout (BlockPalette + ScriptCanvas + SpriteStage)
- When `mode === 'web'`: render Web Mode layout (ElementPalette + CodeEditor + WebPreview)
- CosmoChat always renders (adapts internally based on mode)
- Toolbar always renders (adapts buttons based on mode)
- DndContext only wraps the scratch mode panels

### 5. Mode-aware Toolbar

Update `src/components/ui/Toolbar.tsx`:
- Game Mode: green flag + stop buttons (existing)
- Web Mode: no green flag/stop. Optionally show a "Refresh preview" button.
- Share button works in both modes (delegates to mode-specific export)
- Project name input works in both modes

### 6. Mode-aware ShareModal

Update `src/components/ui/ShareModal.tsx`:
- Game Mode: .sb3 download + URL sharing (existing)
- Web Mode: .html download + URL sharing
- Read `mode` from UI store to decide which export path to use

### 7. Mode-aware CosmoChat

Update `src/components/CosmoChat/CosmoChat.tsx`:
- Read `mode` from UI store
- `handleSend`:
  - Game Mode: `buildProjectContext(vm)` + `buildSystemPrompt()` + `parseCosmoResponse()` (existing)
  - Web Mode: `buildWebContext(code)` + `buildWebSystemPrompt()` + `parseWebResponse()` (from spec 09)
- Message rendering:
  - Game Mode: `BlockPreview` for `proposedBlocks` (existing)
  - Web Mode: HTML code snippet or mini preview for `proposedHtml`
- `handleAccept`:
  - Game Mode: `applyProposal()` (existing)
  - Web Mode: `webProject.applyAICode(html)`
- Welcome message adapts: Game Mode mentions sprites/blocks, Web Mode mentions HTML/websites

---

## Acceptance Criteria

- [ ] UI store has `mode` field, default `null`
- [ ] Welcome screen shows two sections: Game and Website
- [ ] Clicking a game template enters Game Mode with full existing functionality
- [ ] Clicking a web template enters Web Mode (placeholder panels OK for this spec)
- [ ] App.tsx only renders the panels for the active mode
- [ ] Toolbar adapts: green flag/stop in Game Mode, no run controls in Web Mode
- [ ] ShareModal adapts export format based on mode
- [ ] CosmoChat sends to correct AI prompts based on mode
- [ ] No regressions in existing Game Mode functionality
