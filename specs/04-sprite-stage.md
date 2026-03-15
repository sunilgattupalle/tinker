# Spec 04 — Sprite Stage & Block Execution

**Depends on:** 03-block-system
**Outcome:** scratch-render draws sprites on the canvas, blocks execute when the green flag is clicked, and sprites move/change in real time. This is the "it works!" moment.

---

## What to Build

Wire up scratch-render to display sprites and connect the green flag / stop buttons to scratch-vm's execution. After this spec, a kid can drag blocks onto the canvas, click the green flag, and watch a sprite move — powered entirely by Scratch's proven engine.

---

## Tasks

### 1. VM + Renderer setup

Implement `src/scratch/setup.ts`:
- Create a `VirtualMachine` instance
- Create a `RenderWebGL` instance attached to the stage `<canvas>` element
- Create a `ScratchStorage` instance and configure it to load assets (Scratch's default CDN or bundled assets)
- Wire them together:
  ```typescript
  vm.attachRenderer(renderer);
  vm.attachStorage(storage);
  ```
- Call `vm.start()` to begin the tick loop
- Load a default empty project with one cat sprite

Export a `initializeScratchVM(canvas: HTMLCanvasElement)` function that does all of the above and returns the `vm` instance.

### 2. Default project

Create or obtain a minimal `.sb3` project file with:
- One sprite: the Scratch Cat (default costume)
- Positioned at (0, 0), direction 90 (facing right), size 100%
- No scripts
- White backdrop

Store this as `public/assets/default-project.sb3` or generate it programmatically. Load it via `vm.loadProject()` during initialization.

For the cat sprite costume, either:
- Bundle Scratch's default cat SVG in `public/assets/`
- Use scratch-storage to fetch it from Scratch's asset CDN (`assets.scratch.mit.edu`)

### 3. Sprite Stage component (real content)

Update `src/components/SpriteStage/SpriteStage.tsx`:
- Provide the `<canvas>` ref to `initializeScratchVM()` on mount
- The canvas is 480×360 (Scratch standard)
- scratch-render automatically draws sprites on the canvas via the VM's tick loop — no manual draw calls needed
- Forward keyboard events to VM: `vm.postIOData('keyboard', { key, isDown })`
- Forward mouse/click events to VM: `vm.postIOData('mouse', { x, y, isDown, canvasWidth, canvasHeight })`

### 4. Sprite adapter

Implement `src/scratch/spriteAdapter.ts`:
- `getTargets()` — reads `vm.runtime.targets`, filters out the stage, maps to `UISprite` format
- `getActiveTarget()` — returns `vm.editingTarget` mapped to `UISprite`
- `setActiveTarget(targetId)` — calls `vm.setEditingTarget(targetId)`
- `addDefaultSprite()` — adds a new sprite (duplicate the cat or use a different costume)
- `deleteSprite(targetId)` — removes a sprite from the VM

### 5. Sprite selector

Below the stage canvas, render:
- A row of sprite thumbnails (read from `spriteAdapter.getTargets()`)
- Each thumbnail shows the sprite's costume, name, and a selected state
- Click a thumbnail to call `spriteAdapter.setActiveTarget()` — this switches which sprite's blocks are shown in the script canvas
- "Add sprite" button (+) that calls `spriteAdapter.addDefaultSprite()`

### 6. Green flag and stop

Wire up the toolbar buttons:
- **Green flag:** calls `vm.greenFlag()` — scratch-vm finds all `event_whenflagclicked` hat blocks and executes their scripts
- **Stop:** calls `vm.stopAll()` — halts all running scripts
- Subscribe to VM execution events to update `isRunning` state:
  - `vm.on('PROJECT_RUN_START', ...)` → `isRunning = true`
  - `vm.on('PROJECT_RUN_STOP', ...)` → `isRunning = false`
- Green flag button shows a "running" indicator while executing
- Stop button only enabled while running

### 7. Keyboard and mouse event forwarding

The stage must forward user input to the VM so event blocks work:
- **Keyboard:** Listen for `keydown`/`keyup` globally, forward to `vm.postIOData('keyboard', { key, isDown: true/false })`
- **Mouse:** Listen for mouse events on the canvas, convert to Scratch coordinates (center = 0,0, y-up), forward to `vm.postIOData('mouse', { x, y, isDown, canvasWidth, canvasHeight })`
- This enables `event_whenkeypressed`, `sensing_keypressed`, `event_whenthisspriteclicked` blocks to work

### 8. Sprite info display

Below or beside the stage:
- Show the selected sprite's x, y, direction, and size
- These update in real time as the project runs (subscribe to `vm.on('targetsUpdate', ...)`)
- Read values from `vm.editingTarget` properties

---

## Acceptance Criteria

- [ ] The Scratch Cat renders at center stage on load (via scratch-render)
- [ ] Clicking the green flag executes all "when 🟢 clicked" scripts
- [ ] `motion_movesteps` visibly moves the sprite on the canvas
- [ ] `motion_turnright/turnleft` changes the sprite's direction
- [ ] `looks_sayforsecs` shows a speech bubble near the sprite (scratch-render handles this)
- [ ] `looks_hide/show` toggles sprite visibility
- [ ] `control_wait` pauses execution for the specified duration
- [ ] `control_repeat` loops the correct number of times
- [ ] `control_forever` loops until stop is clicked
- [ ] Stop button halts all execution via `vm.stopAll()`
- [ ] Key press events (forwarded to VM) trigger the correct scripts
- [ ] Multiple sprites can exist and run scripts independently
- [ ] Sprite selector below the stage works (click to switch active sprite)
- [ ] Adding a new sprite shows it on the stage
- [ ] Sprite x/y/direction/size display updates in real time during execution
