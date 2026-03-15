# Design System — Tinker

## Design Philosophy

- **Playful but not babyish** — A 10-year-old should feel like this is *their* tool, not a toy for younger kids
- **Scratch-familiar** — Anyone who's used Scratch should feel at home immediately
- **Clear affordances** — Blocks look draggable. Snap points look snappable. Buttons look clickable.
- **Celebrate creation** — When something works, make it feel great (subtle animations, Cosmo's reactions)

---

## Color Palette

### Block Categories (following Scratch conventions)

| Category | Color | Hex |
|---|---|---|
| Motion | Blue | `#4C97FF` |
| Looks | Purple | `#9966FF` |
| Sound | Magenta | `#CF63CF` |
| Events | Yellow | `#FFBF00` |
| Control | Orange | `#FFAB19` |
| Sensing | Cyan | `#5CB1D6` |
| Operators | Green | `#59C059` |
| Variables | Red-Orange | `#FF8C1A` |

### App Chrome

| Element | Color | Hex |
|---|---|---|
| Background | Warm off-white | `#F9F7F3` |
| Panel backgrounds | White | `#FFFFFF` |
| Panel borders | Light gray | `#E2E0DC` |
| Primary accent | Tinker Blue | `#4C6EF5` |
| Text primary | Dark charcoal | `#2D2D2D` |
| Text secondary | Medium gray | `#6B7280` |
| Success/run | Green | `#22C55E` |
| Stop | Red | `#EF4444` |
| Cosmo accent | Soft teal | `#06B6D4` |

---

## Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Block labels | `"Nunito", sans-serif` | 14px | 600 |
| UI labels | `"Inter", sans-serif` | 13px | 500 |
| Cosmo speech | `"Nunito", sans-serif` | 14px | 400 |
| Panel headers | `"Inter", sans-serif` | 12px uppercase | 700 |
| Chat input | `"Inter", sans-serif` | 14px | 400 |

**Nunito** for anything playful (blocks, Cosmo). **Inter** for anything structural (UI chrome, labels).

---

## Layout Specs

### Overall Layout

```
┌──────────────────────────────────────────────────────┐
│  Toolbar (48px height)                                │
│  [🟢 Run] [🔴 Stop] [Project Name]    [Cosmo avatar] │
├────────────┬─────────────────┬───────────────────────┤
│            │                 │                        │
│  Block     │  Script         │  Sprite Stage          │
│  Palette   │  Canvas         │  (480×360 canvas)      │
│            │                 │                        │
│  200px     │  flex-1         │  480px (fixed)         │
│  width     │  (fills space)  │  width + sprite list   │
│            │                 │                        │
├────────────┴─────────────────┴───────────────────────┤
│  Cosmo Chat Bar (120px height)                        │
│  [Cosmo avatar] [chat messages...] [input field]      │
└──────────────────────────────────────────────────────┘
```

- **Minimum window:** 1024×700
- **Panels:** separated by 1px borders, no gaps
- **Block palette:** scrollable vertically, categories as collapsible sections
- **Script canvas:** infinite scroll (pannable), grid background for alignment
- **Sprite stage:** fixed 480×360 canvas with sprite list below it

---

## Block Visual Design

Each block is a rounded rectangle with:
- **Height:** 40px (single-line), expandable for nested blocks
- **Border radius:** 8px
- **Notch:** top-center indentation (for stacking)
- **Bump:** bottom-center protrusion (connects to next block's notch)
- **Shadow:** subtle `0 2px 4px rgba(0,0,0,0.1)` for depth
- **Color:** filled with category color, slightly darker border

### Block Shapes

| Shape | Used for | Visual |
|---|---|---|
| **Stack** | Most blocks | Flat top with notch + bump at bottom |
| **Hat** | Event triggers ("when...") | Rounded top (no notch), bump at bottom |
| **Cap** | Terminal blocks ("stop all") | Notch at top, flat bottom (no bump) |
| **Reporter** | Values (x position) | Rounded pill shape, no notch/bump |
| **Boolean** | True/false | Hexagonal/diamond ends |

### Input Fields in Blocks

- **Number inputs:** white rounded rectangle inside the block, editable on click
- **String inputs:** white rounded rectangle, wider
- **Dropdowns:** white rounded rectangle with chevron, opens menu on click

---

## Cosmo Character

### Visual
- Small robot avatar (48×48px in chat bar, 32×32px in toolbar)
- Simple, round-ish design — think Wall-E meets a lightbulb
- Expressive eyes (happy, thinking, surprised, encouraging)
- Sits in the left side of the chat bar

### States

| State | Eyes | Animation |
|---|---|---|
| Idle | Neutral, slight blink | Gentle hover/bob |
| Listening | Wide, attentive | Leans forward slightly |
| Thinking | Squinting, looking up | Spinning gear icon nearby |
| Excited | Wide, sparkly | Bounces, small particles |
| Encouraging | Soft smile | Nods |

For MVP, Cosmo can be a static SVG with state-based swaps. Animation is a stretch goal.

---

## Interaction Patterns

### Drag and Drop
- **Drag from palette:** Creates a copy (palette block stays). Ghost block follows cursor at 50% opacity.
- **Drop on canvas:** Block snaps to nearest valid connection point with a satisfying snap animation (spring ease).
- **Drag on canvas:** Picks up the block and all blocks below it in the stack.
- **Drop off canvas:** Deletes the block (with a poof/dissolve animation).

### Cosmo Interaction
- Kid types in chat input, presses Enter
- Cosmo shows a "thinking" state (1-3 seconds)
- Response appears as a chat bubble with:
  - Cosmo's explanation text
  - A preview of proposed blocks (highlighted, slightly glowing)
  - [Accept ✓] and [Try something else ↻] buttons
- On accept: blocks animate from the chat bar into the script canvas

### Green Flag / Stop
- Green flag button pulses gently to invite clicking
- On click: all "when green flag clicked" scripts execute
- Stop button appears prominently while running
- On stop: all execution halts, sprites freeze in place

---

## Spacing & Sizing Tokens

Define these in `tailwind.config.ts`:

```
spacing:
  block-h: 40px          (standard block height)
  block-gap: 4px         (gap between snapped blocks)
  palette-w: 200px       (block palette width)
  stage-w: 480px         (sprite stage width)
  stage-h: 360px         (sprite stage height)
  toolbar-h: 48px        (top toolbar height)
  chatbar-h: 120px       (cosmo chat bar height)

borderRadius:
  block: 8px
  panel: 0px             (panels are flush)
  button: 6px
  input: 6px
  reporter: 999px        (pill shape)
```

---

## Responsive Behavior

This is primarily a desktop app (family computer). On smaller screens:
- Below 1024px: hide the block palette behind a toggle button
- Below 768px: stack panels vertically (palette → canvas → stage)
- The chat bar stays at the bottom always

Mobile is not a priority for MVP. Design for 1280×800+ as the sweet spot.
