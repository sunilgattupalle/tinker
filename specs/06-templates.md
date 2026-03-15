# Spec 06 — Starter Templates

**Depends on:** 03-block-system, 04-sprite-stage, 05-cosmo-ai
**Outcome:** Kids can choose from pre-built starter projects (standard .sb3 files) that give them a running start and invite tinkering.

---

## What to Build

Three starter templates as `.sb3` files that load into scratch-vm. These are real Scratch projects — they could even be opened in Scratch itself. The kid can run them immediately, then modify them with Cosmo's help.

---

## Tasks

### 1. Template system

Create `src/templates/`:
- Each template is an `.sb3` file stored in `public/assets/templates/`
- Template metadata (name, description, icon) stored in a `templates.ts` config file
- Template loader function: `loadTemplate(id: string)` → fetches the .sb3 file and calls `vm.loadProject(buffer)`
- Template selector UI: shown on the welcome screen and accessible from a "New Project" menu

```typescript
interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  sb3Path: string;
}
```

### 2. Creating .sb3 template files

Templates can be created by either:
1. **Building them in Scratch** — go to scratch.mit.edu, build the project, download as .sb3
2. **Building them in Tinker** — once specs 03-04 are working, build the project and save via `vm.saveProjectSb3()`
3. **Constructing the JSON** — manually write the `project.json` with the correct block opcodes and package as .sb3 (ZIP)

Option 1 is easiest and guarantees the .sb3 is valid.

### 3. Template: Pet Simulator

File: `public/assets/templates/pet-sim.sb3`

**What it does:** A cat sprite that responds to keyboard input.
- Arrow keys move the cat around the stage
- Pressing "s" makes the cat say "Meow!"
- Pressing "h" hides the cat, pressing "s" shows it again

**Scratch blocks used:** `event_whenkeypressed`, `motion_movesteps`, `motion_changeyby`, `looks_sayforsecs`, `looks_hide`, `looks_show`

**Teaching focus:** Events and motion

### 4. Template: Quiz Game

File: `public/assets/templates/quiz-game.sb3`

**What it does:** A sprite asks a question and responds based on input.
- When green flag clicked: sprite says "What's 2 + 2?"
- When "4" key is pressed: sprite says "Correct! 🎉"
- When any other number key: sprite says "Try again!"

**Scratch blocks used:** `event_whenflagclicked`, `event_whenkeypressed`, `looks_sayforsecs`, `control_wait`

**Teaching focus:** Events and sequencing

### 5. Template: Story with Choices

File: `public/assets/templates/story-choices.sb3`

**What it does:** A simple interactive story.
- When green flag clicked: sprite says "You find a mysterious door..."
- After 3 seconds: sprite says "Press 'o' to open it, or 'r' to run away"
- Press "o": sprite says "Inside you find a treasure! 💎" and grows bigger
- Press "r": sprite says "You ran home safely!" and moves to the edge

**Scratch blocks used:** `event_whenflagclicked`, `event_whenkeypressed`, `looks_sayforsecs`, `control_wait`, `looks_setsizeto`, `motion_gotoxy`

**Teaching focus:** Sequencing and storytelling

### 6. Welcome screen

Create a welcome/landing state for when the app first loads:
- Show before the main editor
- "What do you want to make?" heading
- Three template cards with:
  - Template name
  - One-line description
  - A small preview image (static screenshot or icon)
  - "Start" button
- "Blank project" option (loads the default cat-only project)
- Option to continue a saved project (if one exists in localStorage)

### 7. Template preview

When hovering over a template card:
- Show a tooltip or expanded view with more detail
- Optionally: show a static screenshot of the template running

### 8. Project persistence with .sb3

Implement project save/load using scratch-vm's built-in serialization:
- **Save:** `vm.saveProjectSb3()` returns a Blob. Store it in localStorage (as base64) or IndexedDB (as ArrayBuffer).
- **Load:** `vm.loadProject(arrayBuffer)` restores the full project state.
- Auto-save the current project every 30 seconds and on significant changes
- On app load: check for a saved project, offer to continue it
- "Save" button in the toolbar (manual save with confirmation)
- "New Project" in the toolbar → shows the template selector

Note: `.sb3` files can be large (they include costume/sound assets as binary). For localStorage, consider using IndexedDB for the binary data and localStorage only for metadata (project name, last saved timestamp).

---

## Acceptance Criteria

- [ ] Welcome screen shows on first load with template options
- [ ] Each template loads correctly via `vm.loadProject()` and runs when green flag is clicked
- [ ] Pet Simulator: arrow keys move the cat, "s" makes it speak
- [ ] Quiz Game: asks a question, responds correctly to "4", handles wrong answers
- [ ] Story with Choices: plays through the story with branching based on key presses
- [ ] "Blank project" starts with just the default cat sprite
- [ ] Templates can be modified after loading (add/remove blocks on the script canvas)
- [ ] Projects auto-save (using vm.saveProjectSb3)
- [ ] Saved projects can be resumed on next visit
- [ ] Cosmo greets the kid appropriately when a template loads ("Nice pick! This is a pet simulator...")
