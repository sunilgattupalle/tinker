# Architecture — Tinker

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Tinker App (React)                   │
│                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Block    │  │   Script     │  │   Sprite Stage    │  │
│  │  Palette  │  │   Canvas     │  │   (Canvas/iframe) │  │
│  │          │──▶│              │──▶│                   │  │
│  │ categories│  │ snap blocks  │  │ live preview      │  │
│  └──────────┘  └──────────────┘  └───────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Cosmo AI Chat Bar                      │  │
│  │  [text input] ──▶ AI Client ──▶ Block Parser       │  │
│  └────────────────────────────────────────────────────┘  │
│                           │                              │
│                           ▼                              │
│                    ┌─────────────┐                       │
│                    │  Zustand     │                       │
│                    │  Store       │                       │
│                    │ (project +   │                       │
│                    │  ui state)   │                       │
│                    └─────────────┘                       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼ (via proxy)
                   ┌─────────────────┐
                   │  Claude API      │
                   │  (claude-sonnet) │
                   └─────────────────┘
```

---

## Component Architecture

### 1. Block Palette (`src/components/BlockPalette/`)

Displays categorized blocks that the user can drag onto the canvas.

**Responsibilities:**
- Render block categories (Motion, Looks, Sound, Events, Control, Sensing, Operators)
- Each category has a distinct color (following Scratch conventions)
- Blocks are draggable — on drag-start, create a ghost block that follows the cursor
- Search/filter blocks (stretch goal)

**Data flow:** Reads block definitions from `src/blocks/definitions.ts`. On drag, dispatches to the project store.

### 2. Script Canvas (`src/components/ScriptCanvas/`)

The workspace where blocks are assembled into scripts.

**Responsibilities:**
- Accept block drops from the palette
- Snap blocks together vertically (top-to-bottom execution order)
- Support nesting for control blocks (if/else, repeat)
- Allow reordering via drag
- Delete blocks by dragging off-canvas
- Visual connection points (notch/bump) between blocks

**Data flow:** Reads and writes to `project` store. The script is a tree of block nodes.

### 3. Sprite Stage (`src/components/SpriteStage/`)

Live preview of the running project.

**Responsibilities:**
- Render a 480×360 canvas (Scratch standard)
- Draw sprites at their current positions with current costumes
- Run the block interpreter when the green flag is clicked
- Handle sprite click events for "when this sprite clicked" blocks
- Show x/y coordinates of selected sprite

**Data flow:** Reads sprite state from `project` store. The interpreter updates sprite positions/state, which triggers re-renders.

### 4. Cosmo Chat Bar (`src/components/CosmoChat/`)

The AI interaction layer.

**Responsibilities:**
- Text input for natural language instructions
- Display Cosmo's responses with personality
- Show proposed block changes as a preview diff
- "Accept" / "Try something else" buttons for proposed changes
- Loading state while AI processes
- Conversation history (scrollable, within session)

**Data flow:** Sends user input to `src/ai/client.ts`, receives block proposals, shows preview, on accept writes to `project` store.

---

## Data Model

### Block Definition

```typescript
interface BlockDefinition {
  id: string;                          // e.g. "motion_move"
  category: BlockCategory;             // "motion" | "looks" | "sound" | etc.
  label: string;                       // "move {STEPS} steps"
  color: string;                       // hex color for the category
  shape: "stack" | "hat" | "cap" | "reporter" | "boolean";
  inputs: BlockInput[];                // parameters (numbers, strings, dropdowns)
  execute: (sprite: Sprite, args: Record<string, any>) => void;
}
```

### Block Instance (in a script)

```typescript
interface BlockInstance {
  id: string;                          // unique instance ID
  definitionId: string;                // references BlockDefinition.id
  args: Record<string, any>;           // current argument values
  next: string | null;                 // next block ID in sequence
  nested?: Record<string, string>;     // for control blocks: branch block IDs
}
```

### Sprite

```typescript
interface Sprite {
  id: string;
  name: string;
  x: number;
  y: number;
  direction: number;                   // degrees, 0 = up
  size: number;                        // percentage, 100 = normal
  visible: boolean;
  costumes: Costume[];
  currentCostumeIndex: number;
  scripts: Script[];                   // block trees attached to this sprite
}
```

### Project

```typescript
interface Project {
  name: string;
  sprites: Sprite[];
  stage: StageConfig;                  // backdrop, size
  activeSpriteId: string;
}
```

---

## AI Integration Flow

```
User types: "make the cat jump when I press space"
                    │
                    ▼
            ┌─────────────┐
            │  AI Client   │  Sends to Claude API via proxy
            │  (client.ts) │  with system prompt (Cosmo personality)
            └──────┬──────┘  and current project context
                    │
                    ▼
            ┌─────────────┐
            │  AI Response │  Structured JSON: proposed blocks
            │  (raw)       │  + Cosmo's explanation text
            └──────┬──────┘
                    │
                    ▼
            ┌─────────────┐
            │  Parser      │  Converts AI block proposals into
            │  (parser.ts) │  BlockInstance objects
            └──────┬──────┘
                    │
                    ▼
            ┌─────────────┐
            │  Cosmo Chat  │  Shows explanation + block preview
            │  (component) │  Kid clicks "Accept" or "Try again"
            └──────┬──────┘
                    │ (on accept)
                    ▼
            ┌─────────────┐
            │  Project     │  Blocks added to active sprite's scripts
            │  Store       │
            └─────────────┘
```

### AI Prompt Strategy

The system prompt for Claude includes:
1. Cosmo's personality (enthusiastic, concise, encouraging)
2. The full block definition registry (so AI knows what blocks exist)
3. The current project state (sprites, existing scripts)
4. Output format spec (JSON with block proposals + explanation)

The AI response must be structured so the parser can deterministically convert it into block instances. Free-form code generation is not acceptable — the AI must work within the block vocabulary.

---

## Execution Model

The block interpreter (`src/blocks/interpreter.ts`) walks the block tree and executes each block's `execute` function on the target sprite.

**Execution triggers:**
- Green flag clicked → execute all "when green flag clicked" hat blocks
- Key pressed → execute matching "when key pressed" hat blocks
- Sprite clicked → execute matching "when this sprite clicked" hat blocks

**Execution is:**
- Sequential within a script (top to bottom)
- Concurrent across scripts (multiple scripts can run simultaneously via `requestAnimationFrame` scheduling)
- Stoppable (red stop button halts all execution)

**Timing:**
- "wait N seconds" blocks pause that script's execution
- "repeat" blocks loop with one iteration per frame
- "forever" blocks run until stopped

---

## State Management

Two Zustand stores:

### `project` store
- Current project (sprites, scripts, stage)
- CRUD operations for sprites and blocks
- Undo/redo stack (stretch goal)
- Save/load to localStorage

### `ui` store
- Selected block category in palette
- Active sprite ID
- Dragging state (what's being dragged, position)
- Cosmo chat history
- Modal/panel visibility

---

## Sandboxing

The sprite stage should be reasonably isolated so that buggy block scripts can't crash the main app. Options:

1. **Canvas in main thread** (MVP) — Simplest. Blocks execute in the main React app. A runaway "forever" loop could freeze the UI, but we add a max-iterations safety valve.
2. **Web Worker** (future) — Move the interpreter to a worker. Communicate sprite state via `postMessage`. Prevents UI freezes.
3. **iframe** (future) — Full isolation. More complex to set up.

**For MVP: Option 1 with safety limits.** Keep the interpreter simple and add a `maxIterations` guard on loops.
