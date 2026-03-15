# Spec 03 — Block System

**Depends on:** 02-layout
**Outcome:** Blocks render in the palette with category colors (sourced from scratch-vm opcodes), can be dragged onto the script canvas, snap together via the VM's block API, and can be edited and deleted.

---

## What to Build

The block palette and script canvas — powered by scratch-vm under the hood. We build our own React block UI for full styling control, but all block data and operations flow through scratch-vm's block API via the adapter layer.

Key difference from building custom: we don't define blocks or write an interpreter. scratch-vm already has 100+ block opcodes with execution logic. We build the visual layer.

---

## Tasks

### 1. Opcode registry

Create `src/scratch/opcodes.ts`:

Map scratch-vm's block opcodes to UI-friendly metadata. Include at minimum these starter blocks (the full Scratch vocabulary can be added later):

**Motion:**
- `motion_movesteps` — "move {STEPS} steps" (default: 10)
- `motion_turnright` — "turn ↻ {DEGREES} degrees" (default: 15)
- `motion_turnleft` — "turn ↺ {DEGREES} degrees" (default: 15)
- `motion_gotoxy` — "go to x: {X} y: {Y}" (default: 0, 0)
- `motion_setx` — "set x to {X}" (default: 0)
- `motion_sety` — "set y to {Y}" (default: 0)

**Looks:**
- `looks_say` — "say {MESSAGE}" (default: "Hello!")
- `looks_sayforsecs` — "say {MESSAGE} for {SECS} seconds" (default: "Hello!", 2)
- `looks_show` — "show"
- `looks_hide` — "hide"
- `looks_setsizeto` — "set size to {SIZE}%" (default: 100)

**Events (hat blocks):**
- `event_whenflagclicked` — "when 🟢 clicked"
- `event_whenkeypressed` — "when {KEY_OPTION} key pressed" (dropdown)
- `event_whenthisspriteclicked` — "when this sprite clicked"

**Control:**
- `control_wait` — "wait {DURATION} seconds" (default: 1)
- `control_repeat` — "repeat {TIMES}" (default: 10) — has a nested body (SUBSTACK)
- `control_forever` — "forever" — has a nested body (SUBSTACK)
- `control_if` — "if {CONDITION} then" — has a nested body (SUBSTACK)
- `control_stop` — "stop [all v]" (cap block)

**Sensing:**
- `sensing_keypressed` — "key {KEY_OPTION} pressed?" (boolean reporter)

**Operators:**
- `operator_random` — "pick random {FROM} to {TO}" (reporter)
- `operator_add` — "{NUM1} + {NUM2}" (reporter)

Export an `OpcodeRegistry` object implementing the interface from `docs/api-contracts.md`.

### 2. Block adapter

Create `src/scratch/blockAdapter.ts`:

Implement the `BlockAdapter` interface from `docs/api-contracts.md`. This is the critical bridge between our UI and scratch-vm.

**How scratch-vm blocks work internally:**
- Blocks are stored in a flat map indexed by ID within each target's `blocks` object
- Each block has `opcode`, `next`, `parent`, `inputs`, `fields`, `topLevel`
- The VM expects Blockly-style event objects dispatched via `vm.blockListener(event)`
- Event types: `create`, `change`, `move`, `delete`

The adapter must:
- Construct proper event objects for `vm.blockListener()`
- Map between our UIBlock format and scratch-vm's SB3Block format
- Handle connection logic (setting `next`/`parent` pointers)
- Read block data from `vm.editingTarget.blocks._blocks`

### 3. Block component

Create `src/components/ui/Block.tsx` — renders a single block:
- Rounded rectangle with the category color
- Label text with input fields rendered inline
- Correct shape:
  - **hat** = rounded top (events)
  - **stack** = notch top, bump bottom (most blocks)
  - **cap** = notch top, flat bottom (stop)
  - **reporter** = pill/rounded (values)
  - **boolean** = hexagonal (true/false)
- Input fields: number inputs are editable, dropdowns show a select menu
- Visual size: 40px height for single-line, taller for nested blocks
- Notch/bump connection points for stack blocks

### 4. Block Palette (real content)

Update `src/components/BlockPalette/BlockPalette.tsx`:
- Read available blocks from the opcode registry
- Render categories as collapsible sections
- Each section lists the blocks for that category using the Block component
- Clicking a category header toggles it open/closed
- The currently selected category is highlighted
- Blocks in the palette are read-only (inputs show default values, not editable)

### 5. Drag and drop

Implement drag-and-drop for blocks:
- **Drag from palette:** Creates a ghost block (50% opacity) following the cursor. The palette block stays.
- **Drop on canvas:** Calls `blockAdapter.createBlock()` to add the block to the VM workspace. If dropped near another block's connection point, calls `blockAdapter.connectBlocks()` to snap them.
- **Drag on canvas:** Calls `blockAdapter.disconnectBlock()` on pickup, then reconnects on drop.
- **Drop off canvas:** Calls `blockAdapter.deleteBlock()`.

Use `@dnd-kit/core` and `@dnd-kit/sortable` for drag-and-drop. Install as dependencies.

### 6. Block snapping

When a block is dropped on the canvas:
- Check proximity to existing block connection points (within 20px)
- If close enough, snap via `blockAdapter.connectBlocks()`
- Visual feedback: highlight the snap target while dragging near it (glow effect)
- Hat blocks can only be at the top of a stack
- Cap blocks can only be at the bottom

### 7. Script canvas (real content)

Update `src/components/ScriptCanvas/ScriptCanvas.tsx`:
- Subscribe to the project store for block data
- Render all scripts for the active sprite using `blockAdapter.getBlocksForTarget()`
- Each script is a vertical stack of connected Block components
- Multiple scripts can exist side by side on the canvas
- The canvas is pannable (drag empty space to scroll)
- Right-click a block: context menu with "Delete block" and "Delete script"

### 8. Nested blocks (control flow)

For `control_repeat`, `control_forever`, and `control_if`:
- Render a C-shaped block that wraps its children (SUBSTACK)
- Children blocks render inside the mouth of the C
- The C-shape grows to fit its children
- Dropping into the mouth area snaps the block as a child via `blockAdapter.connectBlocks(blockId, parentId, 'SUBSTACK')`
- Read nested blocks from the VM using `target.blocks.getBranch(blockId)`

### 9. Block editing

- Clicking a number input in a canvas block: shows an inline editor
- Clicking a dropdown: shows a dropdown menu with options
- Changes call `blockAdapter.changeBlockInput()` or `blockAdapter.changeBlockField()`

### 10. Project store integration

Implement the `project` store (`src/store/project.ts`):
- Initialize with a reference to the scratch-vm instance
- Subscribe to `vm.on('workspaceUpdate', ...)` → re-read blocks for the editing target
- Subscribe to `vm.on('targetsUpdate', ...)` → update target list
- Expose reactive `blocks` and `targets` state to React components
- Actions call adapter functions, which call VM, which emits events, which update the store

---

## Acceptance Criteria

- [ ] Block palette shows all categories with correct Scratch colors
- [ ] Each category lists its blocks with proper labels matching scratch-vm opcodes
- [ ] Blocks can be dragged from the palette to the canvas
- [ ] Dropping a block calls `blockAdapter.createBlock()` and the block appears in the VM
- [ ] Blocks snap together when dropped near a connection point
- [ ] Hat blocks can only be at the top of a stack
- [ ] Nested blocks (repeat, forever, if) render as C-shapes with droppable SUBSTACK interiors
- [ ] Block inputs are editable on the canvas (numbers and dropdowns)
- [ ] Blocks can be deleted (drag off canvas or right-click → delete)
- [ ] Multiple separate scripts can exist on the canvas
- [ ] The project store reactively updates when VM state changes
- [ ] Dragging a block picks up everything below it in the stack
