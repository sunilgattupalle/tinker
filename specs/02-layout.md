# Spec 02 — Three-Panel Layout

**Depends on:** 01-scaffold
**Outcome:** The app renders the full Tinker layout with three panels and the Cosmo chat bar, all properly sized and responsive.

---

## What to Build

The visual shell of the app — the three-panel layout from the idea doc, plus the toolbar and Cosmo chat bar. Panels contain placeholder content for now. The goal is to nail the spatial layout before filling in real components.

---

## Tasks

### 1. Toolbar component

Create `src/components/ui/Toolbar.tsx`:
- Fixed at the top, 48px height
- Left side: Green flag (▶) and Stop (■) buttons
- Center: Editable project name (text input, default "My Project")
- Right side: Cosmo avatar (placeholder circle for now)
- Background: white with bottom border

### 2. Block Palette panel (shell)

Create `src/components/BlockPalette/BlockPalette.tsx`:
- Left panel, 200px fixed width
- Placeholder category list: Motion, Looks, Sound, Events, Control, Sensing, Operators
- Each category shows its color dot and name
- Scrollable if content overflows
- Background: white

### 3. Script Canvas panel (shell)

Create `src/components/ScriptCanvas/ScriptCanvas.tsx`:
- Middle panel, fills remaining horizontal space (`flex-1`)
- Light dot-grid background pattern (subtle, like graph paper)
- Empty state message: "Drag blocks here or ask Cosmo to help!"
- Background: off-white (`#F9F7F3`)

### 4. Sprite Stage panel (shell)

Create `src/components/SpriteStage/SpriteStage.tsx`:
- Right panel, 480px fixed width
- Contains a 480×360 canvas area (white background, thin border)
- Below the canvas: sprite list area (placeholder "Sprite1" thumbnail)
- The canvas should render but stay blank for now

### 5. Cosmo Chat Bar (shell)

Create `src/components/CosmoChat/CosmoChat.tsx`:
- Bottom bar, 120px fixed height, full width
- Left: Cosmo avatar (placeholder teal circle with "C")
- Center: scrollable message area (show one welcome message from Cosmo)
- Right: text input field with send button
- Welcome message: "Hi! I'm Cosmo 🤖 Tell me what you want to build and I'll help you make it!"

### 6. App layout assembly

Update `src/App.tsx`:
- Flexbox layout: toolbar on top, three panels in the middle row, chat bar on bottom
- The middle row takes all remaining vertical space
- Panels separated by 1px `#E2E0DC` borders

### 7. Responsive behavior

- Below 1024px: collapse block palette into a toggle-able overlay
- The chat bar always stays visible at the bottom
- Minimum useful width: 768px

---

## Acceptance Criteria

- [ ] All five areas visible: toolbar, palette, canvas, stage, chat bar
- [ ] Panels are correctly sized per design-system.md specs
- [ ] Layout fills the viewport exactly (no scrollbars on the page itself)
- [ ] Panels scroll internally when content overflows
- [ ] Green flag and stop buttons render in the toolbar
- [ ] Project name is editable in the toolbar
- [ ] Chat input field is focusable and accepts text
- [ ] Cosmo welcome message displays on load
- [ ] Resizing the window adjusts the canvas panel (flex-1 behavior)
- [ ] Below 1024px, palette collapses behind a toggle
