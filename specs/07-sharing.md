# Spec 07 — Project Sharing

**Depends on:** 06-templates (for project persistence)
**Outcome:** Kids can share projects via .sb3 file export, .sb3 file import, and compressed URL links — all with zero backend. Exported projects are compatible with Scratch.

---

## What to Build

Getting projects out of one browser and into another. Since we use scratch-vm, sharing is dramatically simpler: we export/import standard `.sb3` files. The same file can be opened in Tinker *or* in Scratch at scratch.mit.edu.

Three sharing methods:
1. **File export** — download a standard `.sb3` file
2. **File import** — open a `.sb3` file (drag-and-drop or file picker)
3. **Shareable URL** — compressed .sb3 data encoded in the URL fragment

---

## Tasks

### 1. .sb3 file export

Create `src/sharing/export.ts`:
- `exportProject(vm, projectName): void` — calls `vm.saveProjectSb3()`, triggers browser download
- The downloaded file is `{project-name}.sb3`
- File name is sanitized: lowercase, spaces → hyphens, no special characters
- This produces a standard Scratch 3.0 .sb3 file — it opens in real Scratch

### 2. .sb3 file import

Create `src/sharing/import.ts`:
- `importProject(vm, file: File): Promise<void>` — reads the file as ArrayBuffer, calls `vm.loadProject(buffer)`
- Validate the file: check it's a valid ZIP containing `project.json` (basic .sb3 structure check)
- Show a confirmation modal before loading: "Load '{filename}'? This will replace your current project."
- Handle invalid files gracefully: "This doesn't look like a Scratch project file."

### 3. URL sharing

Create `src/sharing/urlShare.ts`:
- `encodeProjectToURL(vm): Promise<string | null>` — save as .sb3, compress with pako (gzip), base64 encode, append as URL fragment `#sb3=...`
- `decodeProjectFromURL(url: string): ArrayBuffer | null` — extract fragment, decode, decompress
- Install `pako` as a dependency for gzip compression
- If the resulting URL exceeds 8000 characters, return `null` (too large — suggest file export)

Note: .sb3 files contain binary asset data (costumes, sounds), so they're larger than plain JSON. URL sharing will only work for simple projects. File export is the reliable fallback.

### 4. Thumbnail generator

Create `src/sharing/thumbnail.ts`:
- `generateThumbnail(renderer: RenderWebGL): string` — ask scratch-render to extract a thumbnail from the stage canvas, scale to 100×75, return as base64 PNG
- scratch-render may have built-in thumbnail support. If not, grab the canvas via `canvas.toDataURL()` and resize.
- Used in the share modal preview

### 5. Share button + modal

Add a "Share" button to the toolbar. On click, open a modal:

```
┌────────────────────────────────────┐
│  Share "My Project"                │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  [Stage Thumbnail Preview]    │  │
│  └──────────────────────────────┘  │
│                                    │
│  ── Download ──                    │
│  [Download .sb3 file ⬇]          │
│  Opens in Tinker and Scratch!      │
│                                    │
│  ── Share via link ──              │
│  [https://tinker.app/#sb3=... 📋] │
│  (Copy to clipboard)               │
│                                    │
│  [Close]                           │
└────────────────────────────────────┘
```

- Download button calls `exportProject()`
- Copy-to-clipboard button with feedback ("Copied!")
- If project is too large for URL: hide the link section, show: "This project is too big for a link. Download the .sb3 file instead."
- Highlight Scratch compatibility: "This file also opens in Scratch!"

### 6. URL import on app load

When the app loads:
- Check if the URL has a `#sb3=...` fragment
- If yes: decode the .sb3 data, show confirmation modal, load via `vm.loadProject()` if confirmed
- After loading, strip the fragment from the URL (so refreshing doesn't re-prompt)
- If decoding fails: "Hmm, this link doesn't seem to work."

### 7. Drop zone for file import

- When a `.sb3` file is dragged over the app window, show a full-screen overlay: "Drop to open project"
- On drop: read the file, validate, show confirmation modal
- Also accept `.sb3` via a file picker (Open button in toolbar or File menu)
- If the file is invalid: "This doesn't look like a Scratch project file."

### 8. Cosmo integration

Cosmo acknowledges shared/imported projects:
- After sharing: "Your project is ready to share! The .sb3 file even opens in Scratch."
- After importing: "Cool, you loaded a project! Want me to explain how it works?"
- On import, Cosmo can offer to explain the project's scripts using the "See Inside" AI feature

---

## Acceptance Criteria

- [ ] "Share" button in toolbar opens the share modal
- [ ] "Download .sb3" produces a valid Scratch 3.0 .sb3 file
- [ ] Downloaded .sb3 can be opened in Scratch at scratch.mit.edu
- [ ] Downloaded .sb3 can be re-imported into Tinker
- [ ] Share modal shows a copyable URL (for small projects)
- [ ] Copied URL, opened in a new tab, loads the project
- [ ] Dragging a `.sb3` file onto the app imports the project
- [ ] File import shows a confirmation before replacing current project
- [ ] Projects too large for URL sharing show a graceful fallback
- [ ] URL fragment stripped after import (no re-prompt on refresh)
- [ ] Invalid files/links show friendly error messages
- [ ] Thumbnail is generated from the stage
- [ ] Round-trip works: export .sb3 → import .sb3 → everything intact
