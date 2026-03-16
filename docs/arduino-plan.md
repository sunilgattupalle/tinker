# Arduino Export from Block UI — Plan & Implementation

## Goal

Kids program using the existing **block UI (Game Mode)**. A **"Generate Arduino code"** action converts the current block project into a downloadable **Arduino project** using an AI model.

The output is not just a bare `.ino` file — it is a structured **Arduino Project** containing the sketch, the target board, required libraries (with install instructions), and wiring notes. This gives the kid everything they need to go from Tinker to a working Arduino.

There is:

* No new programming mode
* No separate Arduino editor
* No server storage

The feature is **export only** — generate, preview, and download.

---

# The Arduino Project Model

A generated Arduino project is a structured object, not just a code string.

```ts
interface ArduinoProject {
  projectName: string
  board: ArduinoBoard
  code: string
  libraries: LibraryDependency[]
  wiring: WiringNote[]
  explanation: string
}

interface ArduinoBoard {
  id: string          // e.g. "uno", "mega", "nano"
  label: string       // e.g. "Arduino Uno"
  fqbn: string        // Fully Qualified Board Name for arduino-cli, e.g. "arduino:avr:uno"
}

interface LibraryDependency {
  name: string        // e.g. "Servo"
  builtIn: boolean    // true = ships with Arduino IDE, no install needed
  installHint: string // e.g. "Sketch → Include Library → Servo" or "Library Manager → search 'Adafruit NeoPixel'"
}

interface WiringNote {
  pin: string         // e.g. "9", "A0", "GND"
  component: string   // e.g. "Servo signal wire", "LED anode (long leg)"
  note?: string       // e.g. "Use a 220Ω resistor in series"
}
```

This model is the backbone. Every downstream piece — AI prompt, parser, UI, download — operates on this shape.

### Why this matters

| Without project model | With project model |
|-----------------------|--------------------|
| Kid downloads `.ino`, opens Arduino IDE, gets "Servo.h not found" | Kid sees "You'll need: Servo library (built-in)" before downloading |
| Kid doesn't know what board to use | Kid picked "Arduino Uno" before generating; code is written for that board |
| Kid has code but no idea what to plug in where | Kid sees "Pin 9 → Servo signal wire, Pin 13 → LED" |
| Download is a single `.ino` file | Download is a `.zip` with sketch + README with full setup instructions |

---

# Supported Boards (Phase 1)

Keep it small. Three boards that cover most kid/beginner use cases:

| Board | `id` | `fqbn` | Notes |
|-------|------|--------|-------|
| Arduino Uno | `uno` | `arduino:avr:uno` | Default. Most common starter board. 14 digital, 6 analog. |
| Arduino Mega | `mega` | `arduino:avr:mega:cpu=atmega2560` | More pins, more memory. Good for larger projects. |
| Arduino Nano | `nano` | `arduino:avr:nano:cpu=atmega328` | Breadboard-friendly, same chip as Uno. |

The board selection is passed to the AI so it generates code appropriate for the pin count and capabilities. Future phases can add ESP32, Micro, etc.

---

# Common Library Scenarios

The AI will encounter Scratch blocks that map to hardware requiring libraries. Here are the most common scenarios for Phase 1:

| Scratch pattern | Hardware intent | Library | Built-in? |
|-----------------|----------------|---------|-----------|
| `motion_movesteps`, `motion_turnright` | Servo or DC motor | `Servo` | Yes |
| `looks_sayforsecs`, `looks_say` | LCD display | `LiquidCrystal` | Yes |
| `sound_play` | Piezo buzzer | None (tone() is built-in) | — |
| `sensing_keypressed` | Button on digital pin | None (digitalRead) | — |
| `pen_pendown`, `pen_setpencolorto` | NeoPixel/LED strip | `Adafruit_NeoPixel` | **No** — needs install |
| Variables | — | None | — |

The AI decides which libraries are needed based on the block summary + board. The system prompt includes guidance for common mappings but does not hardcode every case — the AI can suggest additional libraries when appropriate.

---

# Architecture Alignment

### architecture.md

Arduino export is implemented as a **Game‑Mode‑only option inside the existing ShareModal**.

It follows the same pattern as:

* `.sb3` download
* URL sharing

Data sources:

* `vm` (Scratch Virtual Machine)
* `projectName`

These are already available in the project store.

The AI request uses the **same proxy and client flow used by Cosmo AI**:

```
board selection + block summary
→ system prompt + user message
→ Claude (via proxy)
→ parsed response → ArduinoProject
```

New modules follow the existing directory layout:

```
src/ai/        → summary builder, prompts, parser, pipeline
src/sharing/   → project export (zip)
src/types/     → ArduinoProject types
```

No new backend services are required.

### design-system.md

The UI follows existing ShareModal styling rules.

**Modal** — rounded‑2xl dialog, backdrop overlay.

**Section headings** — Inter, 13px, semibold.

**Primary button** — Tinker Blue `#4C6EF5`, rounded‑xl, full width.

**Board picker** — styled select/dropdown matching the design system (rounded-lg, border, Inter font).

**Cosmo explanation area** — Nunito font, optional Cosmo accent `#06B6D4`.

**Setup info (libraries / wiring)** — card-style sections inside the result area. Library names in monospace. Wiring as a simple pin → component list.

**Code preview** — monospace, background `#F9F7F3`, scrollable, border radius 8px.

**Loading state** — disabled button, text "Generating…", optional spinner.

### community‑architecture.md

Arduino export behaves like **another download path**. It does not modify `.tinker` format or SharedProject schema.

---

# Product Flow

1. Kid builds a project using blocks.

2. Kid clicks **Share**.

3. ShareModal shows an **Arduino** section with a board picker (default: Uno) and a **Generate Arduino code** button.

4. Kid optionally changes the board, then clicks **Generate Arduino code**.

5. App reads the project blocks, builds a text summary, and sends it to the AI along with the selected board.

6. AI returns a structured response:
   * Short explanation
   * Libraries needed (with install hints)
   * Wiring notes (pins → components)
   * Arduino sketch in a ` ```cpp ` block

7. UI shows:
   * Cosmo explanation ("Here's your Arduino project!")
   * **What you'll need** — list of libraries with install hints
   * **Wiring** — pin → component table
   * Code preview (collapsible)
   * **Download project** button (`.zip`)

8. Download contains:
   * `project-name/project-name.ino` — the sketch
   * `project-name/README.md` — board, libraries, wiring, explanation

9. On error: friendly message + **Try again**.

---

# Data Sent to AI

The AI receives a **text summary of the block program** plus the **target board**.

## Message format

```
Target board: Arduino Uno

Project: <projectName>

Sprite: <spriteName>

Script 1
  <opcode>(<input1>, <input2>, ...)
  <opcode>
  ...

Script 2
  ...
```

Per block: opcode plus literal inputs/fields (e.g. `motion_movesteps(10)`, `event_whenkeypressed(space)`). Walk the tree with `getBlock`, `getNextBlock`, `getBranch`. Nest substacks with indentation.

**Example:**

```
Target board: Arduino Uno

Project: Spinning Star

Sprite: Star

Script 1
  event_whenflagclicked
  control_forever
    motion_movesteps(10)
    motion_turnright(15)

Script 2
  event_whenkeypressed(space)
  looks_sayforsecs(Hello!, 2)
```

---

# AI Response Format

The system prompt instructs the AI to return a structured response with three sections:

````
<explanation text — 1-3 kid-friendly sentences>

```json
{
  "board": "Arduino Uno",
  "libraries": [
    { "name": "Servo", "builtIn": true, "installHint": "Already included with Arduino IDE" }
  ],
  "wiring": [
    { "pin": "9", "component": "Servo signal wire" },
    { "pin": "GND", "component": "Servo ground wire" }
  ]
}
```

```cpp
#include <Servo.h>

Servo myServo;

void setup() {
  Serial.begin(9600);
  myServo.attach(9);
}

void loop() {
  myServo.write(90);
  delay(500);
}
```
````

**Rules:**

* Explanation comes first (plain text).
* Then a ` ```json ` block with project metadata.
* Then a single ` ```cpp ` block with the complete sketch.
* Sketch must include `void setup()` and `void loop()`.
* If a Scratch block has no Arduino equivalent, add a comment in the sketch.
* Libraries array lists every `#include` the sketch uses. `builtIn` = ships with Arduino IDE.
* Wiring array describes what to connect and where.

---

# Block → Arduino Mapping

| Scratch Concept          | Arduino Equivalent    |
| ------------------------ | --------------------- |
| when green flag clicked  | `setup()` + `loop()`  |
| forever                  | `loop()`              |
| repeat N                 | `for` loop            |
| if / else                | `if`                  |
| say / think              | `Serial.println()`    |
| key pressed              | button on digital pin |
| variables                | C++ variables         |
| motion blocks            | Servo or motor (with library) |
| pen / color blocks       | NeoPixel LED (with library) |

## Supported vs unsupported blocks

* **Control, events, variables, operators:** map directly.
* **Motion:** AI maps to Servo/motor where plausible; adds the library and wiring. If no sensible mapping, adds a comment.
* **Looks (say/think):** Serial.println or LCD (with LiquidCrystal library and wiring).
* **Sound:** `tone()` on a piezo pin.
* **Pen / color:** NeoPixel LED strip if plausible; adds Adafruit_NeoPixel library.
* **Unknown opcodes:** included in summary as-is; AI adds a comment.

We do **not** fail or hide the feature when unsupported blocks exist.

---

# Scope Exclusions (Phase 1)

* Browser compilation
* Code upload to device
* Serial monitor
* Arduino editor
* Visual wiring diagrams (we show a text pin list, not a circuit image)
* Boards beyond Uno / Mega / Nano

---

# Error Handling & Edge Cases

| Case | Behavior |
|------|----------|
| API timeout / network error | "Something went wrong. Try again." Button stays clickable. |
| AI returns no ` ```cpp ` block | Parser returns `code: undefined`; UI shows "No code was generated. Try again." |
| AI returns no ` ```json ` block | Parser returns empty libraries/wiring arrays; UI skips those sections. Not a failure. |
| AI returns invalid sketch (no setup/loop) | Parser validation → treat as no code. Show Try again. |
| AI returns library with `builtIn: false` | UI shows install instructions prominently (Library Manager step-by-step). |
| Empty project (no scripts) | Summary says "(no scripts)". Prompt tells AI to return minimal setup/loop with a comment. |
| Very large project | Cap summary at ~4000 chars to stay within token budget. Truncate with a note. |
| Double-click Generate | Button disabled while in flight ("Generating…"). |

---

# Implementation Plan — Phased

Split into **four sub-phases** for incremental implementation and testing.

---

## Phase 1a — Types, Summary Builder, Parser, Export Utility

**Goal:** Implement and unit-test the data layer in isolation. No AI calls, no UI.

### New files

| File | Purpose |
|------|---------|
| `src/types/arduino.ts` | `ArduinoProject`, `ArduinoBoard`, `LibraryDependency`, `WiringNote` types |
| `src/ai/buildBlocksSummary.ts` | Build AI input summary from VM |
| `src/ai/arduinoParser.ts` | Parse AI response → `ArduinoProject` |
| `src/sharing/arduinoExport.ts` | Download `.zip` (sketch + README) |

### Task 1a.1 — Types

**File:** `src/types/arduino.ts`

Define and export: `ArduinoBoard`, `LibraryDependency`, `WiringNote`, `ArduinoProject`.

Also export a `SUPPORTED_BOARDS` constant array:

```ts
export const SUPPORTED_BOARDS: ArduinoBoard[] = [
  { id: 'uno',  label: 'Arduino Uno',  fqbn: 'arduino:avr:uno' },
  { id: 'mega', label: 'Arduino Mega', fqbn: 'arduino:avr:mega:cpu=atmega2560' },
  { id: 'nano', label: 'Arduino Nano', fqbn: 'arduino:avr:nano:cpu=atmega328' },
]
```

### Task 1a.2 — Block summary builder

**File:** `src/ai/buildBlocksSummary.ts`

**Export:** `buildBlocksSummaryForArduino(vm: VirtualMachine, board: ArduinoBoard): string`

**Responsibilities:**

* Header line: `Target board: <board.label>`.
* Project name line.
* Iterate over targets (exclude stage). Include stage variables if any exist.
* For each sprite, get script roots via `blocks.getScripts()`.
* For each script, walk the block tree:
  * `blocks.getBlock(id)` — get the block.
  * `blocks.getNextBlock(id)` — follow the chain.
  * `blocks.getBranch(id, 1)` / `getBranch(id, 2)` — walk substacks (if/else branches, forever/repeat bodies).
  * For each block: emit `opcode(input1, input2, ...)` with literal values from `block.inputs` (shadow values) and `block.fields`.
* Indent nested substacks.
* Cap output at ~4000 characters; truncate with `... (truncated, project has N more blocks)`.

**Tests (unit, mock VM):**

* Empty project → contains board and project name, "(no scripts)".
* One sprite, one script (flag → move 10 → turn 15) → correct opcodes and values.
* Nested substacks (forever → if → move) → indentation.
* Multiple sprites → all present.
* Large project → truncation kicks in.

### Task 1a.3 — Response parser

**File:** `src/ai/arduinoParser.ts`

**Export:** `parseArduinoResponse(responseText: string, projectName: string, board: ArduinoBoard): ArduinoProject`

**Parsing rules:**

1. **Explanation:** Everything before the first fenced code block, trimmed.
2. **JSON metadata:** Find the first ` ```json ` block. Parse it. Extract `libraries` (array of `LibraryDependency`) and `wiring` (array of `WiringNote`). If the block is missing or JSON is malformed, default to empty arrays — this is not a fatal error.
3. **Code:** Find the first ` ```cpp `, ` ```c `, or ` ```arduino ` block. Extract content as `code`.
4. **Validation:** If `code` exists, check for `void setup()` and `void loop()`. If missing, set `code` to `undefined`.
5. Return an `ArduinoProject` with all fields populated (or defaults for missing metadata).

**Tests:**

* Full valid response (explanation + json + cpp) → all fields populated.
* Response with ` ```arduino ` instead of ` ```cpp ` → code extracted.
* Missing json block → empty libraries/wiring, code still extracted.
* Missing cpp block → `code` undefined.
* Malformed JSON (syntax error) → empty libraries/wiring, no crash.
* Invalid sketch (no setup/loop) → `code` undefined.
* Multiple code blocks → first matching block used.

### Task 1a.4 — Project export (zip download)

**File:** `src/sharing/arduinoExport.ts`

**Exports:**

* `downloadArduinoProject(project: ArduinoProject): void` — builds and downloads a `.zip`.
* `generateReadme(project: ArduinoProject): string` — builds the README content (exported for testing).

**Implementation:**

* **Filename sanitization:** Reuse pattern from `src/sharing/export.ts` — lowercase, strip non-alphanumeric (keep hyphens), collapse spaces, max 60 chars, fallback `'my-project'`.
* **Zip structure:** Use a lightweight zip library (e.g. `fflate` — 8KB gzipped, zero dependencies, MIT license, already works in browsers). Contents:
  * `{name}/{name}.ino` — the sketch
  * `{name}/README.md` — auto-generated from the project model
* **README template:**

```markdown
# {projectName}

Generated by Tinker — Arduino Export

## Board

{board.label}

## Libraries

{for each library:}
- **{name}** — {installHint}

## Wiring

| Pin | Connect to |
|-----|-----------|
{for each wiring note:}
| {pin} | {component} {note?} |

## About

{explanation}
```

* Trigger download via `URL.createObjectURL` + temporary `<a download>`.

**New dependency:** `fflate` (add to `package.json`).

**Tests:**

* `generateReadme`: check that board, libraries, and wiring appear in output.
* `downloadArduinoProject`: verify zip contains two entries with correct paths (mock URL.createObjectURL).
* Filename sanitization edge cases.

**Exit criterion for Phase 1a:** All unit tests pass. No AI calls, no UI changes.

---

## Phase 1b — Prompts and Generation Pipeline

**Goal:** Wire the AI. Call the same proxy as Cosmo. Return an `ArduinoProject`.

### New files

| File | Purpose |
|------|---------|
| `src/ai/arduinoPrompts.ts` | System prompt for Arduino generation |
| `src/ai/arduinoGenerate.ts` | Pipeline: summary → API → parse → ArduinoProject |

### Task 1b.1 — System prompt

**File:** `src/ai/arduinoPrompts.ts`

**Export:** `buildArduinoSystemPrompt(): string`

**Prompt content (key sections):**

1. **Persona:** You are Cosmo, a friendly AI assistant helping a kid turn their Scratch block project into an Arduino project.
2. **Task:** Given a block summary and target board, generate:
   * A 1-3 sentence kid-friendly explanation of what the Arduino project will do.
   * A JSON metadata block with `libraries` and `wiring` arrays.
   * A complete Arduino sketch in a ` ```cpp ` block.
3. **Output format:** Explanation, then ` ```json ` block, then ` ```cpp ` block. (Exact format documented with an example.)
4. **Board awareness:** Generate code appropriate for the specified board. Use correct pin numbers. Don't exceed the board's pin count.
5. **Library rules:**
   * Only `#include` libraries that the sketch actually uses.
   * For each library, include it in the `libraries` JSON array.
   * Set `builtIn: true` if the library ships with Arduino IDE (Servo, LiquidCrystal, SPI, Wire, etc.).
   * Set `builtIn: false` for third-party libraries and provide a clear `installHint` (e.g. "Open Library Manager → search 'Adafruit NeoPixel' → Install").
6. **Wiring rules:** For every hardware pin used in the sketch, add a wiring entry. Include GND and VCC connections. Keep notes short (e.g. "use 220Ω resistor").
7. **Block mapping guidance:** (Same table as in plan — green flag → setup/loop, forever → loop, etc.)
8. **Unsupported blocks:** Add a comment in the sketch. Don't invent hardware.
9. **Sketch requirements:** Must include `void setup()` and `void loop()`. Must compile for the target board. Include `Serial.begin(9600)` in setup if Serial is used.

### Task 1b.2 — Generation pipeline

**File:** `src/ai/arduinoGenerate.ts`

**Export:** `generateArduinoProject(vm: VirtualMachine, projectName: string, board: ArduinoBoard): Promise<ArduinoProject>`

**Steps:**

1. Build summary: `buildBlocksSummaryForArduino(vm, board)`.
2. Build user message: `"Convert this block program to an Arduino project:\n\n" + summary`.
3. Call the same proxy as Cosmo: `fetch('/api/ai/v1/messages', ...)` with system prompt from `buildArduinoSystemPrompt()` and user message. 30s timeout via AbortController.
4. Extract the assistant's text content from the response.
5. Parse: `parseArduinoResponse(text, projectName, board)`.
6. Return the `ArduinoProject`.

**Tests (mocked fetch):**

* Success: mock returns full response → pipeline returns populated `ArduinoProject`.
* No code block in response → `code` undefined in result.
* No JSON block → empty libraries/wiring but code present.
* Network error → promise rejects.
* Timeout → promise rejects (AbortController fires).

**Exit criterion for Phase 1b:** Pipeline returns correct `ArduinoProject` shape; all tests use mocked fetch.

---

## Phase 1c — ShareModal Integration (Basic)

**Goal:** Kid can select a board, generate, see the result, and download. Errors are handled.

### Modified file

* `src/components/ui/ShareModal.tsx`

### Task 1c.1 — Board picker and generate button

* New section: **Arduino Export** (below existing Download and Share sections).
* Board dropdown: `<select>` populated from `SUPPORTED_BOARDS`. Default: Uno. Stored in local state.
* **Generate Arduino code** button. Disabled + "Generating…" while in flight.

### Task 1c.2 — Generation and result display

* On click: call `generateArduinoProject(vm, projectName, selectedBoard)`.
* State: `arduinoGenerating`, `arduinoResult: ArduinoProject | null`, `arduinoError: string | null`.
* On success, show:
  * **Cosmo explanation** (Nunito, Cosmo accent).
  * **What you'll need** section — list libraries. For each: name (monospace), built-in badge or install hint. Non-built-in libraries shown with prominent install instructions.
  * **Wiring** section — simple pin → component table.
  * **Download project (.zip)** button → calls `downloadArduinoProject(result)`.
  * Collapsible **Code preview** (monospace, `#F9F7F3` bg, scrollable).

### Task 1c.3 — Error and retry

* On failure: show "Something went wrong. Try again." Keep Generate button clickable.
* If result has no `code`: show explanation (if any) + "No code was generated. Try again."

### Task 1c.4 — Modal lifecycle

* Clear Arduino state when modal opens (fresh start each time).
* Board selection persists across re-opens within the same session (optional nicety).

**Tests:**

* Arduino section and board picker visible in Game Mode.
* Board dropdown has three options; Uno is default.
* Generate button disabled during generation.
* On success: explanation, libraries, wiring, and download button appear.
* Non-built-in library shows install instructions.
* On error: message visible, button clickable.
* Download button triggers zip download (spy on `downloadArduinoProject`).

**Exit criterion for Phase 1c:** Full flow works in browser. Download contains sketch + README with correct board, libraries, and wiring.

---

## Phase 1d — Polish and Edge Cases

**Goal:** Harden the experience. Handle the awkward cases.

### Task 1d.1 — Empty and minimal projects

* If the block summary is effectively empty, the AI should still return a valid minimal sketch (`setup` + `loop` with a comment). Test this end-to-end.
* UI: if `code` is undefined after generation, show a helpful message: "Try adding some blocks to your project first!"

### Task 1d.2 — Large projects and truncation

* Verify the 4000-char cap in the summary builder works correctly and the truncation note is included.
* Test that the AI still generates reasonable output from a truncated summary.

### Task 1d.3 — Library install UX

* For non-built-in libraries, the "What you'll need" section should include step-by-step install instructions, not just a name. Example:

```
Adafruit NeoPixel (install required)
  1. Open Arduino IDE
  2. Go to Sketch → Include Library → Manage Libraries…
  3. Search "Adafruit NeoPixel"
  4. Click Install
```

### Task 1d.4 — Regenerate with different board

* Kid can change the board dropdown after seeing a result and click Generate again.
* Previous result is cleared; new generation starts.

### Task 1d.5 — Accessibility

* Board picker has a label.
* Code preview is keyboard-scrollable.
* Download button has descriptive aria-label.

**Exit criterion for Phase 1d:** Edge cases handled, library install UX is clear, accessibility basics in place.

---

# File Summary

| File | Phase | Purpose |
|------|-------|---------|
| `src/types/arduino.ts` | 1a | ArduinoProject, ArduinoBoard, LibraryDependency, WiringNote types + SUPPORTED_BOARDS |
| `src/ai/buildBlocksSummary.ts` | 1a | Build AI input summary from VM state |
| `src/ai/arduinoParser.ts` | 1a | Parse AI response → ArduinoProject |
| `src/sharing/arduinoExport.ts` | 1a | Build zip (sketch + README) and trigger download |
| `src/ai/arduinoPrompts.ts` | 1b | System prompt with board/library/wiring awareness |
| `src/ai/arduinoGenerate.ts` | 1b | Pipeline: summary → API → parse → ArduinoProject |
| `src/components/ui/ShareModal.tsx` | 1c | UI: board picker, generate, result display, download |

**New dependency:** `fflate` (lightweight zip library, ~8KB gzipped, MIT, browser-native).

---

# Testing Summary

| Phase | What to test |
|-------|-------------|
| 1a | Types compile. Summary: empty, single script, nested, multi-sprite, truncation. Parser: full response, missing json, missing cpp, malformed json, invalid sketch, multiple blocks. Export: README content, zip structure, filename sanitization. |
| 1b | Pipeline with mocked fetch: success (full project), missing code, missing metadata, network error, timeout. |
| 1c | ShareModal: Arduino section visible, board picker works, loading state, result shows explanation + libraries + wiring + download, error shows message + retry. |
| 1d | Empty project UX, truncation behavior, library install instructions quality, board change + regenerate, accessibility. |

---

# Acceptance Criteria

The feature is complete when:

* Share modal shows **Arduino Export** section in Game Mode.
* Kid can select a board (Uno / Mega / Nano).
* Clicking **Generate Arduino code** shows "Generating…" and disables the button.
* On success:
  * Explanation appears.
  * Required libraries are listed with install hints. Non-built-in libraries have step-by-step install instructions.
  * Wiring notes show pin → component.
  * **Download project** downloads a `.zip` containing `{name}.ino` and `README.md`.
  * Sketch compiles in Arduino IDE for the selected board (manual check).
* On error: friendly message + **Try again**.
* The block editor remains the only programming UI.

---

# Future Phases (Post–Phase 1)

## Phase 2 — Compile and Simulate

* Backend compile service: receives `.ino` + `fqbn` (from `ArduinoBoard`) + library list, returns `.hex`.
* Backend uses `arduino-cli compile` in a sandboxed container (short-lived, non-root, CPU/memory/time limits, no outbound network, approved boards + libraries only).
* The `ArduinoProject.libraries` list tells the backend which libraries to install before compiling (`arduino-cli lib install "Servo"`).
* Browser: "Simulate" runs `.hex` in AVR8js or similar.
* Optional: "Open in Wokwi" link, serial monitor.

Candidate tech: AVR8js (MIT), @wokwi/elements (MIT).

## Phase 3 — Upload to Device

* After compile, backend returns `.hex`.
* Browser uses **Web Serial** to upload to the kid's Arduino.
* `ArduinoBoard.fqbn` tells the upload tool the correct protocol.
* The `wiring` data could power a simple visual wiring guide (stretch goal).

## Phase 4 — Richer Project Features

* **Component blocks:** Dedicated Scratch extension blocks for common components (servo, LED, sensor) that map deterministically to Arduino code — no AI guessing needed for those blocks (similar to [Blockly@rduino](https://projecthub.arduino.cc/scanet/blocklyrduino-create-code-with-blocks-5756fb)).
* **Project gallery:** Share Arduino projects in the community gallery (`.tinker-arduino` format containing the ArduinoProject JSON).
* **Multiple sketch files:** For larger projects, generate `.h` / `.cpp` helper files alongside the main `.ino`.
* **Board auto-detection:** Use Web Serial to detect the connected board and pre-select it.

---

# Summary

The key insight: an Arduino export is a **project**, not just a code string. The `ArduinoProject` model captures board, libraries, wiring, and code — giving the kid everything they need.

Phase 1 is split into:

* **1a:** Types + block summary + parser + zip export (testable without AI or UI).
* **1b:** System prompt (board/library/wiring-aware) + pipeline (testable with mocked API).
* **1c:** ShareModal with board picker + result display + download.
* **1d:** Polish — empty projects, truncation, library install UX, accessibility.

Future phases build on the same `ArduinoProject` model:

* Phase 2: backend compile uses `fqbn` + `libraries` list.
* Phase 3: upload uses `fqbn` for protocol selection.
* Phase 4: dedicated component blocks, gallery, multi-file projects.
