# Spec 04 — Sprite Stage & Block Execution

**Depends on:** 03-block-system
**Outcome:** Sprites render on a canvas, blocks execute when the green flag is clicked, and sprites move/change in real time.

---

## What to Build

The live preview stage and the block interpreter. After this spec, a kid can drag blocks onto the canvas, click the green flag, and watch a sprite move. This is the "it works!" moment.

---

## Tasks

### 1. Sprite engine

Create `src/sprites/engine.ts`:
- `Sprite` class or object matching the interface in `docs/api-contracts.md`
- Methods: `move(steps)`, `turnRight(degrees)`, `turnLeft(degrees)`, `goTo(x, y)`, `setX(x)`, `setY(y)`, `say(message)`, `show()`, `hide()`, `setSize(percent)`
- Sprites have a coordinate system: center of stage is (0, 0), x goes right, y goes up (Scratch convention)
- Edge bouncing: sprite can't move fully off-stage

### 2. Default sprite

Create a default "Cat" sprite:
- Simple cat SVG (or use a placeholder colored square for MVP)
- Positioned at (0, 0), direction 90 (facing right), size 100%
- Every new project starts with this sprite

Store the default sprite asset in `public/assets/sprites/cat.svg`.

### 3. Canvas renderer

Create `src/sprites/renderer.ts`:
- Draws all sprites onto a `<canvas>` element at 480×360
- Each frame: clear canvas → draw backdrop → draw each visible sprite at its position/size/direction
- Use `requestAnimationFrame` for smooth rendering
- Handle sprite layering (draw order = sprite list order)
- Draw speech bubbles when a sprite is "saying" something

### 4. Sprite Stage component (real content)

Update `src/components/SpriteStage/SpriteStage.tsx`:
- Mount the canvas renderer
- Below the canvas: sprite selector thumbnails
  - Show each sprite as a small thumbnail with its name
  - Click to select the active sprite (which affects the script canvas)
  - "Add sprite" button (creates a new sprite with a default costume)
- Display the selected sprite's x/y position below the stage
- The stage canvas captures click events for "when this sprite clicked" blocks

### 5. Block interpreter

Create `src/blocks/interpreter.ts`:
- Takes a script (tree of block instances) and executes it sequentially
- Each block's execution maps to a sprite engine method
- Async execution: `wait` blocks actually pause, `repeat` loops yield between iterations
- `forever` loops run until `stop()` is called
- Safety: max 10,000 iterations per loop to prevent freezing
- Execution uses `requestAnimationFrame` for timing so the stage updates visibly between steps

### 6. Execution triggers

Wire up the toolbar buttons:
- **Green flag:** Find all `events_flag` hat blocks across all sprites, execute their scripts concurrently
- **Stop:** Cancel all running scripts immediately
- **Key press:** Listen for keyboard events, trigger matching `events_key` scripts
- **Sprite click:** Listen for clicks on the stage canvas, hit-test against sprites, trigger matching scripts

### 7. Execution state

Add to the `project` store or a new `runtime` store:
- `isRunning: boolean`
- `runningScripts: Set<string>` (script IDs currently executing)
- Green flag button is disabled while running (or shows as "restart")
- Stop button only enabled while running

### 8. Visual feedback during execution

- Currently executing block: highlight with a subtle glow/border
- Sprite speech bubbles: render "say" text near the sprite on the canvas
- When execution finishes: brief flash on the green flag button

---

## Acceptance Criteria

- [ ] A cat sprite (or placeholder) renders at center stage on load
- [ ] Clicking the green flag executes all "when 🟢 clicked" scripts
- [ ] `motion_move` visibly moves the sprite on the canvas
- [ ] `motion_turn_right/left` changes the sprite's direction
- [ ] `looks_say` shows a speech bubble near the sprite
- [ ] `looks_hide/show` toggles sprite visibility
- [ ] `control_wait` pauses execution for the specified duration
- [ ] `control_repeat` loops the correct number of times
- [ ] `control_forever` loops until stop is clicked
- [ ] Stop button halts all execution
- [ ] Key press events trigger the correct scripts
- [ ] Multiple sprites can exist and run scripts independently
- [ ] Sprite selector below the stage works (click to switch active sprite)
- [ ] No infinite loop can freeze the browser (safety limits work)
