# Spec 09 — Web Mode

**Depends on:** 08-multi-mode
**Outcome:** Kids can build websites by talking to Cosmo. The AI generates HTML/CSS, the kid sees it rendered live, and they can export it as a .html file.

---

## What to Build

The full Web Mode experience: code editor, live preview, element palette, AI integration, templates, and sharing. After this spec, a kid can pick "Build a Website", tell Cosmo "make a website about dinosaurs", and see a real web page appear.

---

## Tasks

### 1. Web Project Store

Create `src/store/webProject.ts`:

```typescript
interface WebProjectStore {
  code: string;
  projectName: string;
  setCode: (code: string) => void;
  applyAICode: (html: string) => void;
  setProjectName: (name: string) => void;
}
```

- `code` is a complete HTML document string (includes `<html>`, `<head>`, `<style>`, `<body>`)
- `applyAICode` replaces the entire code with the AI-generated HTML
- Default `code`: a minimal HTML page with a "Start building!" message

### 2. Code Editor

Create `src/components/web/CodeEditor.tsx`:

- A styled `<textarea>` with monospace font (`font-family: 'Fira Code', 'Consolas', monospace`)
- Fills the middle panel (like ScriptCanvas in Game Mode)
- Reads `code` from `webProject` store, dispatches `setCode` on change
- Tab key inserts 2 spaces (not focus change)
- Line numbers in a left gutter (optional — can be a stretch goal)
- Light background matching the canvas area (`#F9F7F3` or white)
- Font size: 14px, line height: 1.5

### 3. Web Preview

Create `src/components/web/WebPreview.tsx`:

- An `<iframe>` that renders the kid's HTML code
- Uses `srcdoc` attribute: `<iframe sandbox="allow-scripts" srcdoc={code}>`
- Fills the right panel (like SpriteStage in Game Mode)
- Debounce updates: re-render 500ms after code stops changing (avoid flicker during typing)
- Show a subtle "Updating..." indicator during debounce
- Border and shadow matching the sprite stage design
- The iframe sandbox prevents navigation, form submission, and top-level access

### 4. Element Palette

Create `src/components/web/ElementPalette.tsx`:

- Left panel (like BlockPalette in Game Mode)
- Grid of clickable HTML element cards, grouped by category:

**Structure:**
- Heading (`<h1>My Title</h1>`)
- Paragraph (`<p>Some text here...</p>`)
- Link (`<a href="#">Click me</a>`)
- Div (`<div>Container</div>`)

**Lists:**
- Unordered list (`<ul><li>Item 1</li><li>Item 2</li></ul>`)
- Ordered list (`<ol><li>First</li><li>Second</li></ol>`)

**Media:**
- Image (`<img src="https://placekitten.com/200/200" alt="A cute photo">`)
- Video placeholder

**Interactive:**
- Button (`<button>Click me!</button>`)
- Input (`<input type="text" placeholder="Type here...">`)

**Style:**
- Style block (`<style>\n  body { }\n</style>`)

- Clicking a card appends the snippet to the end of `<body>` (before `</body>`)
- Each card shows: element name, a mini preview or icon, the HTML tag name
- Color-coded by category (structure = blue, lists = green, media = purple, etc.)

### 5. Web AI System Prompt

Create `src/ai/webPrompts.ts`:

The system prompt instructs Claude to:
- Respond as Cosmo (same personality: enthusiastic, concise, encouraging)
- Generate a **complete, self-contained HTML document** (including `<!DOCTYPE html>`, `<html>`, `<head>`, `<style>`, `<body>`)
- Use inline `<style>` blocks (no external CSS files)
- Keep it simple — no JavaScript unless the kid asks for interactivity
- Use colorful, kid-friendly styling by default (fun fonts, bright colors, rounded corners)
- Always include:
  1. A plain-English explanation of what was built/changed
  2. The complete HTML document in a markdown code block (` ```html ... ``` `)
- If modifying existing code: return the **full updated document** (not a diff)
- For ambiguous requests, ask a clarifying question

Include the current HTML code in the prompt as context so Cosmo can modify the existing page.

### 6. Web AI Response Parser

Create `src/ai/webParser.ts`:

- `parseWebResponse(raw: string): { explanation: string; html?: string }`
- Extract HTML from the first ` ```html ... ``` ` code block in the response
- If no code block found, treat the entire response as explanation only
- Basic validation: check that the HTML contains `<html` or `<body` or `<!DOCTYPE`
- If validation fails, return explanation only with no html

### 7. Web Templates

Create `src/templates/webProjects.ts` — four HTML string builders:

**Blank Page:**
```html
<!DOCTYPE html>
<html>
<head><title>My Website</title>
<style>
  body { font-family: sans-serif; text-align: center; padding: 40px; }
  h1 { color: #4C6EF5; }
</style>
</head>
<body>
  <h1>My Website</h1>
  <p>Tell Cosmo what to build!</p>
</body>
</html>
```

**About Me:**
- Kid's name placeholder, photo placeholder, hobbies list
- Styled with fun colors, rounded cards, background color

**Fun Facts:**
- 3-4 facts with emoji, displayed as colorful cards in a grid
- Each card has a number, fact text, and emoji

**Photo Gallery:**
- Grid of placeholder images (use placekitten or placeholder.com)
- Each image has a caption below it
- Simple grid layout with CSS Grid

Create `src/templates/webTemplates.ts`:
- `WEB_TEMPLATES: TemplateConfig[]` with id, name, description, icon, color, buildProject
- `loadWebTemplate(id, setCode)` function

### 8. Web Export

Create `src/sharing/webExport.ts`:
- `downloadHtml(code: string, projectName: string): void`
- Creates a `Blob` with `text/html` mime type
- Triggers browser download as `{project-name}.html`
- Sanitize filename: lowercase, spaces → hyphens

### 9. Web URL Sharing

Update `src/sharing/urlShare.ts` (or create a web variant):
- `encodeWebToURL(code: string): string | null` — gzip + base64, fragment prefix `#html=`
- `decodeWebFromURL(): string | null` — reverse
- Same 8000 char limit as .sb3 sharing
- HTML is text-only (no binary assets), so compression is more effective

---

## Acceptance Criteria

- [ ] Web Mode three-panel layout renders: ElementPalette + CodeEditor + WebPreview
- [ ] Code editor shows HTML code, editable, changes reflect in preview
- [ ] Preview iframe renders the HTML in real time (debounced)
- [ ] Element palette shows categorized HTML snippets
- [ ] Clicking a snippet inserts it into the code
- [ ] Cosmo generates HTML/CSS in response to natural language ("make a website about space")
- [ ] AI-generated HTML appears in the code editor and preview on Accept
- [ ] Four web templates load correctly from the welcome screen
- [ ] "Blank Page" starts with minimal HTML and a Cosmo-friendly message
- [ ] .html export downloads a working HTML file
- [ ] Exported .html opens correctly in Chrome/Safari/Firefox
- [ ] URL sharing works with `#html=` prefix
- [ ] No regressions in Game Mode
