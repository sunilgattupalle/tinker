# Spec 07 — Project Sharing

**Depends on:** 06-templates (for project serialization & localStorage)
**Outcome:** Kids can share projects via links and files, and import projects from others — all with zero backend.

---

## What to Build

The first step toward community: getting projects out of one browser and into another. This is Phase 1 of the community layer — it works entirely client-side with no backend, no accounts, no database.

Three sharing methods:
1. **Shareable URL** — project data encoded in the URL fragment
2. **File export** — download a `.tinker` file
3. **File import** — open a `.tinker` file from disk

---

## Tasks

### 1. Project serializer

Create `src/community/serializer.ts`:
- `serializeProject(project: Project): SharedProject` — wraps the project with metadata (version, name, timestamp)
- `deserializeProject(data: SharedProject): Project` — validates and extracts
- Include a `version: 1` field for future format compatibility
- Validate the deserialized project: all block definition IDs must exist in the registry, sprites must have valid fields
- Strip any runtime state (execution status, UI selections) — only save the project definition

```typescript
interface SharedProject {
  version: 1;
  name: string;
  author?: string;
  description?: string;
  createdAt: string;
  project: Project;
  thumbnail?: string;          // base64 PNG, max 100×75px
}
```

### 2. URL encoding

Create `src/community/urlShare.ts`:
- `encodeProjectToURL(project: SharedProject): string` — compress JSON with LZ-string, base64 encode, append as URL fragment `#p=...`
- `decodeProjectFromURL(url: string): SharedProject | null` — extract fragment, decode, decompress, validate
- Install `lz-string` as a dependency for compression
- If the resulting URL exceeds 8000 characters, return `null` (too large for URL sharing — suggest file export instead)

### 3. File export

Create export functionality:
- `exportProjectToFile(project: SharedProject): void` — triggers a browser download of `{project-name}.tinker`
- The `.tinker` file is JSON (pretty-printed for readability)
- File name is sanitized: lowercase, spaces → hyphens, no special characters

### 4. File import

Create import functionality:
- `importProjectFromFile(file: File): Promise<SharedProject>` — reads the file, parses JSON, validates
- Support drag-and-drop onto the app (drop zone over the entire window)
- Support a "File → Open" menu item or button
- Validate the file: check `version` field, check that block IDs exist, handle gracefully if blocks are unknown (skip them with a warning)
- Show a confirmation modal before loading: "Load 'Space Adventure' by coolcoder42? This will replace your current project."

### 5. Thumbnail generator

Create `src/community/thumbnail.ts`:
- `generateThumbnail(canvas: HTMLCanvasElement): string` — capture the sprite stage canvas, scale down to 100×75, return as base64 PNG
- Called automatically when sharing (snapshot of the current stage state)
- Used for preview in the share modal and in the gallery (Phase 2)

### 6. Share button + modal

Add a "Share" button to the toolbar. On click, open a modal:

```
┌────────────────────────────────────┐
│  Share "My Project"                │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  [Stage Thumbnail Preview]    │  │
│  └──────────────────────────────┘  │
│                                    │
│  Description (optional):           │
│  ┌──────────────────────────────┐  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                    │
│  ── Share via link ──              │
│  [https://tinker.app/p#ey... 📋]  │
│  (Copy to clipboard)               │
│                                    │
│  ── Or download ──                 │
│  [Download .tinker file ⬇]        │
│                                    │
│  [Close]                           │
└────────────────────────────────────┘
```

- Copy-to-clipboard button with feedback ("Copied!")
- If project is too large for URL: hide the link section, show a note: "This project is too big for a link. Download the file instead."
- Cosmo can suggest a description: "Looks like you made a cat that chases the mouse. How about: 'A cat that follows your cursor around the stage'?"

### 7. URL import on app load

When the app loads:
- Check if the URL has a `#p=...` fragment
- If yes: decode the project, show the confirmation modal, load if confirmed
- After loading, strip the fragment from the URL (so refreshing doesn't re-prompt)
- If decoding fails: show an error ("Hmm, this link doesn't seem to work. The project might be corrupted.")

### 8. Drop zone for file import

- When a `.tinker` file is dragged over the app window, show a full-screen overlay: "Drop to open project"
- On drop: read the file, validate, show confirmation modal
- If the file is invalid: "This doesn't look like a Tinker project file."

### 9. Cosmo integration

Cosmo acknowledges shared/imported projects:
- After sharing: "Your project has a link now! Anyone with it can try your creation."
- After importing: "Cool, you loaded '{name}'! Want me to explain how it works?"
- If import has unknown blocks: "This project uses some blocks I don't recognize. I loaded what I could!"

---

## Acceptance Criteria

- [ ] "Share" button in toolbar opens the share modal
- [ ] Share modal shows a copyable URL with the project encoded
- [ ] Copied URL, when opened in a new browser tab, loads the project
- [ ] "Download .tinker file" produces a valid JSON file
- [ ] Dragging a `.tinker` file onto the app imports the project
- [ ] File import shows a confirmation before replacing the current project
- [ ] Projects that are too large for URL sharing show a graceful fallback
- [ ] URL fragment is stripped after import (no re-prompt on refresh)
- [ ] Invalid files/links show friendly error messages
- [ ] Thumbnail is generated from the current stage state
- [ ] Round-trip works: share → open link → everything intact (blocks, sprites, positions)
