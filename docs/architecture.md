# Architecture — Tinker

## System Overview

Tinker is a custom React UI layer on top of Scratch's open-source engine. The engine (scratch-vm + scratch-render) handles all block execution and sprite rendering. We build the UI, the AI integration, and the sharing system.

```
┌────────────────────────────────────────────────────────────┐
│                    Tinker App (React)                        │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  Block    │  │   Script     │  │   Sprite Stage     │    │
│  │  Palette  │  │   Canvas     │  │  ┌──────────────┐  │    │
│  │           │  │              │  │  │scratch-render │  │    │
│  │ reads VM  │  │ writes VM    │  │  │   canvas      │  │    │
│  │ block defs│  │ blocks via   │  │  └──────────────┘  │    │
│  │           │  │ adapter      │  │                    │    │
│  └──────────┘  └──────────────┘  └────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Cosmo AI Chat Bar                        │   │
│  │  [text input] → AI Client → Parser → VM blocks       │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│         ┌─────────────────┼──────────────────┐              │
│         │          src/scratch/ adapters       │              │
│         │    setup.ts | blockAdapter.ts |      │              │
│         │    spriteAdapter.ts | opcodes.ts     │              │
│         └─────────────────┼──────────────────┘              │
└───────────────────────────┼──────────────────────────────────┘
                            │
              ┌─────────────┼─────────────────┐
              │       Scratch Engine           │
              │                                │
              │  scratch-vm (BSD-3)            │
              │    Block execution, events,    │
              │    timing, concurrency,        │
              │    sprite state management     │
              │              │                 │
              │              ▼                 │
              │  scratch-render (AGPL-3)       │
              │    WebGL sprite rendering,     │
              │    costumes, layering,         │
              │    speech bubbles, effects     │
              │              │                 │
              │  scratch-storage               │
              │    Asset loading (SVGs, PNGs)  │
              └────────────────────────────────┘
                            │
                            ▼ (via proxy)
                   ┌─────────────────┐
                   │  Claude API      │
                   │  (claude-sonnet) │
                   └─────────────────┘
```

---

## Scratch VM Integration

### Initialization (`src/scratch/setup.ts`)

On app startup:

1. Create a `VirtualMachine` instance
2. Create a `RenderWebGL` instance, attached to a `<canvas>` DOM element
3. Create a `ScratchStorage` instance for loading sprite assets
4. Wire them together:
   ```
   vm.attachRenderer(renderer)
   vm.attachStorage(storage)
   ```
5. Start the VM tick loop: `vm.start()`
6. Load a default project (empty project with one cat sprite)

The VM instance is a singleton, created once and shared across the app via a React context or direct import.

### VM Lifecycle

```
App starts
    │
    ▼
setup.ts creates VM + Renderer + Storage
    │
    ▼
vm.start()  ← begins the tick loop (requestAnimationFrame)
    │
    ▼
vm.loadProject(defaultProject)  ← loads empty .sb3 with cat sprite
    │
    ▼
VM emits 'targetsUpdate' → store updates → React re-renders
    │
    ▼
User interacts (drag blocks, click green flag, type in Cosmo)
    │
    ▼
Adapter functions translate UI actions → VM API calls
    │
    ▼
VM executes blocks → updates sprite state → renderer draws
```

---

## Adapter Layer (`src/scratch/`)

The adapter layer bridges our React UI and the scratch-vm API. Components never call scratch-vm directly — they go through adapters and the Zustand store.

### blockAdapter.ts

Translates UI block operations into scratch-vm's block event format.

**Key functions:**
- `createBlock(targetId, opcode, inputs, position)` — Creates a new block on a target's workspace
- `connectBlocks(blockId, parentId, inputName?)` — Snaps a block under another or into an input
- `disconnectBlock(blockId)` — Detaches a block from its parent
- `deleteBlock(blockId)` — Removes a block and its children
- `changeBlockInput(blockId, inputName, value)` — Updates an input value
- `changeBlockField(blockId, fieldName, value)` — Updates a field value (dropdowns)
- `getBlocksForTarget(targetId)` — Returns all blocks for a sprite, structured for rendering

scratch-vm uses Blockly-style event objects internally. The adapter constructs these events and dispatches them to `vm.blockListener()`.

### spriteAdapter.ts

Bridges sprite UI with scratch-vm's target system.

**Key functions:**
- `getTargets()` — Returns all sprite targets (excluding stage), formatted for UI
- `getActiveTarget()` — Returns the editing target
- `setActiveTarget(targetId)` — Switches which sprite's blocks are shown
- `addSprite(options)` — Creates a new sprite via VM
- `deleteSprite(targetId)` — Removes a sprite
- `getSpritePosition(targetId)` — Returns x, y, direction, size for display

### opcodes.ts

Maps scratch-vm opcodes to UI-friendly metadata for the block palette.

```typescript
interface OpcodeInfo {
  opcode: string;          // e.g. "motion_movesteps"
  category: string;        // e.g. "motion"
  label: string;           // e.g. "move {STEPS} steps"
  color: string;           // hex color for the category
  shape: "stack" | "hat" | "cap" | "reporter" | "boolean";
}
```

This mapping drives the block palette UI. Categories and colors follow Scratch conventions (see `docs/design-system.md`).

---

## Component Architecture

### 1. Block Palette (`src/components/BlockPalette/`)

Displays categorized blocks that the user can drag onto the canvas.

**Data source:** `src/scratch/opcodes.ts` provides the full list of available blocks grouped by category with labels and colors.

**Interaction:** When a block is dragged from the palette, the drop handler calls `blockAdapter.createBlock()` to add it to the VM's workspace for the active target.

### 2. Script Canvas (`src/components/ScriptCanvas/`)

Renders and allows editing of blocks for the active sprite.

**Data source:** Subscribes to VM `workspaceUpdate` events via the project store. Reads block data through `blockAdapter.getBlocksForTarget()`.

**Interaction:** Drag-and-drop, snapping, input editing, and deletion all go through `blockAdapter` functions which dispatch events to `vm.blockListener()`.

### 3. Sprite Stage (`src/components/SpriteStage/`)

Hosts the scratch-render canvas.

**Setup:** During initialization, `setup.ts` creates the renderer with a `<canvas>` element. The SpriteStage component provides this canvas element via a ref. The renderer draws automatically via the VM's tick loop.

**Interaction:**
- Green flag → `vm.greenFlag()`
- Stop → `vm.stopAll()`
- Key events → forwarded to `vm.postIOData('keyboard', ...)`
- Mouse/click events → forwarded to `vm.postIOData('mouse', ...)`

Below the canvas: sprite selector reads from `spriteAdapter.getTargets()`.

### 4. Cosmo Chat Bar (`src/components/CosmoChat/`)

The AI interaction layer.

**Flow:**
1. Kid types instruction → sent to Claude API via `src/ai/client.ts`
2. Claude responds with sb3-format block JSON + explanation
3. `src/ai/parser.ts` validates the response against known opcodes
4. Preview shown in chat → kid clicks Accept
5. On accept → `blockAdapter.createBlock()` / `blockAdapter.connectBlocks()` add blocks to VM
6. Kid clicks green flag → blocks execute via scratch-vm

---

## AI Integration Flow

```
User types: "make the cat jump when I press space"
                    │
                    ▼
            ┌─────────────┐
            │  AI Client   │  Sends to Claude API via proxy
            │  (client.ts) │  with system prompt + project context
            └──────┬──────┘
                    │
                    ▼
            ┌─────────────┐
            │  AI Response │  Structured JSON using scratch-vm opcodes:
            │  (raw)       │  event_whenflagclicked, motion_movesteps, etc.
            └──────┬──────┘
                    │
                    ▼
            ┌─────────────┐
            │  Parser      │  Validates opcodes exist in scratch-vm
            │  (parser.ts) │  Validates input/field names
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
            │  Block       │  Calls vm.blockListener() to create
            │  Adapter     │  blocks in the VM workspace
            └─────────────┘
```

### AI Prompt Strategy

The system prompt for Claude includes:
1. Cosmo's personality (enthusiastic, concise, encouraging)
2. The scratch-vm opcode vocabulary (100+ opcodes with their inputs/fields)
3. The current project state (serialized from VM: sprites, existing scripts)
4. Output format spec (sb3-compatible block JSON + explanation)

The AI must generate blocks using valid scratch-vm opcodes. The parser validates every opcode and input name before accepting.

---

## State Management

### scratch-vm is the source of truth

The VM holds all project state: sprites, blocks, costumes, sounds, variables. Our Zustand stores are reactive wrappers — they subscribe to VM events and expose derived state to React components.

### `project` store (`src/store/project.ts`)

Wraps scratch-vm state for React:
- Subscribes to `vm.on('targetsUpdate', ...)` → updates sprite list
- Subscribes to `vm.on('workspaceUpdate', ...)` → updates block data
- Exposes: `targets`, `editingTargetId`, `blocks`, `isRunning`
- Actions delegate to adapter functions → adapter calls VM API
- Save/load: `vm.saveProjectSb3()` / `vm.loadProject(buffer)`

### `ui` store (`src/store/ui.ts`)

UI-only state (not in the VM):
- Selected block category in palette
- Cosmo chat history
- Modal/panel visibility
- Dragging state

---

## Project Format

Projects use the standard Scratch `.sb3` format — a ZIP archive containing:
- `project.json` — JSON with targets, blocks, costumes, sounds
- Asset files — SVGs, PNGs, WAVs referenced by MD5 hash

scratch-vm handles serialization/deserialization:
- **Save:** `vm.saveProjectSb3()` → `ArrayBuffer` (the .sb3 ZIP)
- **Load:** `vm.loadProject(arrayBuffer)` → populates VM state

This means Tinker projects are fully compatible with Scratch. A kid can export from Tinker and open the file on scratch.mit.edu.

---

## License Notes

- **scratch-vm:** BSD-3-Clause (permissive)
- **scratch-render:** AGPL-3.0 (copyleft — source must be available if hosted publicly)
- **scratch-storage:** BSD-3-Clause
- **scratch-svg-renderer:** BSD-3-Clause

For a family project this is fine. If open-sourced, AGPL-3.0 is appropriate for educational software.
