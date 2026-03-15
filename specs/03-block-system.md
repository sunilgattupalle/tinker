# Spec 03 — Block System

**Depends on:** 02-layout
**Outcome:** Blocks render in the palette with category colors, can be dragged onto the script canvas, snap together, and can be edited and deleted.

---

## What to Build

The core block system: definitions, rendering, drag-and-drop, and snapping. This is the heart of Tinker — the visual programming interface. No execution yet (that's spec 04).

---

## Tasks

### 1. Block definitions

Create `src/blocks/definitions.ts`:

Define at least these starter blocks:

**Motion:**
- `motion_move` — "move {STEPS} steps" (default: 10)
- `motion_turn_right` — "turn ↻ {DEGREES} degrees" (default: 15)
- `motion_turn_left` — "turn ↺ {DEGREES} degrees" (default: 15)
- `motion_goto_xy` — "go to x: {X} y: {Y}" (default: 0, 0)
- `motion_set_x` — "set x to {X}" (default: 0)
- `motion_set_y` — "set y to {Y}" (default: 0)

**Looks:**
- `looks_say` — "say {MESSAGE}" (default: "Hello!")
- `looks_say_for` — "say {MESSAGE} for {SECONDS} seconds" (default: "Hello!", 2)
- `looks_show` — "show"
- `looks_hide` — "hide"
- `looks_set_size` — "set size to {PERCENT}%" (default: 100)

**Events (hat blocks):**
- `events_flag` — "when 🟢 clicked"
- `events_key` — "when {KEY} key pressed" (dropdown: space, up, down, left, right, a-z)
- `events_sprite_clicked` — "when this sprite clicked"

**Control:**
- `control_wait` — "wait {SECONDS} seconds" (default: 1)
- `control_repeat` — "repeat {TIMES}" (default: 10) — has a nested body
- `control_forever` — "forever" — has a nested body
- `control_if` — "if {CONDITION} then" — has a nested body
- `control_stop` — "stop all" (cap block)

**Sensing:**
- `sensing_key_pressed` — "key {KEY} pressed?" (boolean reporter)

**Operators:**
- `operators_random` — "pick random {FROM} to {TO}" (reporter)
- `operators_add` — "{A} + {B}" (reporter)

### 2. Block registry

Create `src/blocks/registry.ts`:
- Export a map of all block definitions indexed by ID
- Export helper: `getBlocksByCategory(category)` — returns all blocks in a category
- Export helper: `getBlockDefinition(id)` — returns a single definition

### 3. Block component

Create a `Block` component that renders a single block:
- Rounded rectangle with the category color
- Label text with input fields rendered inline
- Correct shape (hat = rounded top, cap = flat bottom, reporter = pill, boolean = hexagonal)
- Notch at top and bump at bottom for stack blocks
- Input fields: number inputs are editable, dropdowns show a select menu
- Visual size: 40px height for single-line, taller for nested blocks

### 4. Block Palette (real content)

Update `src/components/BlockPalette/BlockPalette.tsx`:
- Render categories as collapsible sections
- Each section lists the blocks for that category using the Block component
- Clicking a category header toggles it open/closed
- The currently selected category is highlighted
- Blocks in the palette are read-only (inputs show default values, not editable)

### 5. Drag and drop

Implement drag-and-drop for blocks:
- **Drag from palette:** Creates a clone. The palette block stays. A ghost block (50% opacity) follows the cursor.
- **Drop on canvas:** The block appears at the drop position. If dropped near another block's connection point, it snaps.
- **Drag on canvas:** Picks up the block and everything below it in the stack.
- **Drop off canvas:** Deletes the block(s).

Use the HTML Drag and Drop API or a lightweight library like `@dnd-kit/core`. Prefer `@dnd-kit` for better React integration.

Add `@dnd-kit/core` and `@dnd-kit/sortable` as dependencies.

### 6. Block snapping

When a block is dropped on the canvas:
- Check proximity to existing block connection points (within 20px)
- If close enough, snap: insert the dropped block into the sequence
- Visual feedback: highlight the snap target while dragging near it (glow effect)
- Hat blocks can only be at the top of a stack
- Cap blocks can only be at the bottom

### 7. Script canvas (real content)

Update `src/components/ScriptCanvas/ScriptCanvas.tsx`:
- Render all scripts for the active sprite
- Each script is a vertical stack of connected blocks
- Multiple scripts can exist side by side on the canvas
- The canvas is pannable (drag empty space to scroll)
- Right-click a block: context menu with "Delete block" and "Delete script"

### 8. Nested blocks (control flow)

For `repeat`, `forever`, and `if` blocks:
- Render a C-shaped block that wraps its children
- Children blocks render inside the mouth of the C
- The C-shape grows to fit its children
- Dragging into the mouth area snaps the block as a child

### 9. Block editing

- Clicking a number input in a canvas block: shows an inline editor (select all, type new value)
- Clicking a dropdown: shows a dropdown menu with options
- Changes update the block instance in the project store

### 10. Zustand store integration

Implement the `project` store (`src/store/project.ts`):
- Holds the current project state (sprites, scripts, blocks)
- Implements `addBlock`, `removeBlock`, `moveBlock`, `updateBlockArgs`
- The palette reads block definitions from the registry
- The canvas reads/writes block instances from/to the store

---

## Acceptance Criteria

- [ ] Block palette shows all categories with correct colors
- [ ] Each category lists its blocks with proper labels
- [ ] Blocks can be dragged from the palette to the canvas
- [ ] Blocks snap together when dropped near a connection point
- [ ] Hat blocks can only be at the top of a stack
- [ ] Nested blocks (repeat, forever, if) render as C-shapes with droppable interiors
- [ ] Block inputs are editable on the canvas (numbers and dropdowns)
- [ ] Blocks can be deleted (drag off canvas or right-click → delete)
- [ ] Multiple separate scripts can exist on the canvas
- [ ] Project store correctly tracks all block state
- [ ] Dragging a block picks up everything below it in the stack
