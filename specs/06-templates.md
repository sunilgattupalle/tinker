# Spec 06 — Starter Templates

**Depends on:** 03-block-system, 04-sprite-stage, 05-cosmo-ai
**Outcome:** Kids can choose from pre-built starter projects that give them a running start and invite tinkering.

---

## What to Build

Three starter templates that demonstrate what Tinker can do. These are pre-built projects with sprites and scripts already in place. The kid can run them immediately, then modify them with Cosmo's help. Each template should teach different block categories.

---

## Tasks

### 1. Template system

Create `src/templates/`:
- Each template is a JSON file matching the `Project` type
- Template loader function: `loadTemplate(id: string): Project`
- Template selector UI: shown on the welcome screen and accessible from a "New Project" menu

### 2. Template: Pet Simulator

File: `src/templates/pet-sim.json`

**What it does:** A cat sprite that responds to keyboard input.
- Arrow keys move the cat around the stage
- Pressing "s" makes the cat say "Meow!"
- Pressing "h" hides the cat, pressing "s" shows it again

**Blocks used:** events_key, motion_move, motion_set_x, motion_set_y, looks_say_for, looks_hide, looks_show

**Teaching focus:** Events and motion

**Sprites:** Cat (default)

### 3. Template: Quiz Game

File: `src/templates/quiz-game.json`

**What it does:** A sprite asks a question and responds based on input.
- When green flag clicked: sprite says "What's 2 + 2?"
- When "4" key is pressed: sprite says "Correct! 🎉"
- When any other key: sprite says "Try again!"

**Blocks used:** events_flag, events_key, looks_say_for, control_wait, control_if, sensing_key_pressed

**Teaching focus:** Control flow and conditionals

**Sprites:** A "quiz host" character (can be the cat with a different starting message)

### 4. Template: Story with Choices

File: `src/templates/story-choices.json`

**What it does:** A simple interactive story.
- When green flag clicked: sprite says "You find a mysterious door..."
- After 3 seconds: sprite says "Press 'o' to open it, or 'r' to run away"
- Press "o": sprite says "Inside you find a treasure! 💎" and grows bigger
- Press "r": sprite says "You ran home safely!" and moves to the edge

**Blocks used:** events_flag, events_key, looks_say_for, control_wait, looks_set_size, motion_goto_xy

**Teaching focus:** Sequencing and storytelling

**Sprites:** A "character" sprite

### 5. Welcome screen

Create a welcome/landing state for when the app first loads:
- Show before the main editor
- "What do you want to make?" heading
- Three template cards with:
  - Template name
  - One-line description
  - A small preview image (static screenshot or icon)
  - "Start" button
- "Blank project" option (starts with just the default cat sprite)
- Option to continue a saved project (if one exists in localStorage)

### 6. Template preview

When hovering over a template card:
- Show a tooltip or expanded view with more detail
- Optionally: auto-play a short demo of the template running

### 7. localStorage save/load

Implement project persistence:
- Auto-save the current project to localStorage every 30 seconds and on significant changes
- On app load: check for a saved project, offer to continue it
- "Save" button in the toolbar (manual save with confirmation)
- "New Project" in the toolbar → shows the template selector

---

## Acceptance Criteria

- [ ] Welcome screen shows on first load with template options
- [ ] Each template loads correctly and runs when the green flag is clicked
- [ ] Pet Simulator: arrow keys move the cat, "s" makes it speak
- [ ] Quiz Game: asks a question, responds correctly to "4", handles wrong answers
- [ ] Story with Choices: plays through the story with branching based on key presses
- [ ] "Blank project" starts with just the default cat sprite
- [ ] Templates can be modified after loading (add/remove blocks)
- [ ] Projects auto-save to localStorage
- [ ] Saved projects can be resumed on next visit
- [ ] Cosmo greets the kid appropriately when a template loads ("Nice pick! This is a pet simulator...")
