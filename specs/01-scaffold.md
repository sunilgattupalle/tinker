# Spec 01 — Project Scaffold

**Depends on:** Nothing
**Outcome:** A running React + Vite + TypeScript app with Scratch engine dependencies installed, tooling configured, and an empty shell.

---

## What to Build

Set up the project foundation. After this spec is complete, `npm run dev` should show a blank page with the Tinker title, scratch-vm should be importable, and all tooling should work.

---

## Tasks

### 1. Initialize the project

```bash
npm create vite@latest . -- --template react-ts
```

Use the current directory (the repo root). Don't create a nested folder.

### 2. Install dependencies

**Runtime:**
```bash
npm install scratch-vm scratch-render scratch-storage scratch-svg-renderer
npm install zustand
```

**Dev:**
```bash
npm install -D tailwindcss @tailwindcss/vite postcss autoprefixer
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Note: scratch-vm and scratch-render are JavaScript libraries. If npm install fails for any of them, try installing from GitHub directly:
```bash
npm install scratchfoundation/scratch-vm scratchfoundation/scratch-render
```

### 3. Configure Tailwind

Set up `tailwind.config.ts` with the design tokens from `docs/design-system.md`:
- Custom colors for block categories and app chrome
- Custom spacing tokens (block-h, palette-w, stage-w, etc.)
- Font families: Nunito and Inter

Add `@tailwind` directives to the main CSS file.

### 4. Configure Vite

In `vite.config.ts`:
- Set `base: "/tinker/"` for GitHub Pages
- Add the proxy configuration for `/api/ai` (see `docs/api-contracts.md`)
- Add Tailwind plugin
- scratch-vm and scratch-render may need special Vite config (e.g., `optimizeDeps.include` or `build.commonjsOptions`) since they use CommonJS. Handle any import issues.

### 5. Configure TypeScript

In `tsconfig.json`:
- `"strict": true`
- Path aliases: `@/` → `src/`

### 6. Create scratch-vm type declarations

Create `src/types/scratch.d.ts` with the type declarations from `docs/api-contracts.md`. These declare the scratch-vm, scratch-render, scratch-storage, and scratch-svg-renderer modules so TypeScript can work with them.

### 7. Configure Vitest

In `vite.config.ts` or `vitest.config.ts`:
- `environment: "jsdom"`
- `globals: true`
- Setup file for `@testing-library/jest-dom`

### 8. Create the directory structure

Create all directories listed in `AGENTS.md` under "Directory Structure":
```
src/scratch/         ← VM + Renderer integration layer
src/components/BlockPalette/
src/components/ScriptCanvas/
src/components/SpriteStage/
src/components/CosmoChat/
src/components/ui/
src/ai/
src/store/
src/types/
src/utils/
public/assets/
```

Add `index.ts` barrel files where noted.

### 9. Create placeholder files

- `src/types/index.ts` — Export shared UI types from `docs/api-contracts.md` (UIBlock, UISprite, ChatMessage, etc.)
- `src/types/scratch.d.ts` — Type declarations for scratch-vm/render/storage
- `src/scratch/setup.ts` — Placeholder: export a function `initializeScratchVM()` that creates and returns a VM instance (implementation comes in spec 04, but the file should exist)
- `src/App.tsx` — Render a centered "Tinker" heading (proof of life)
- `src/main.tsx` — Standard React 18 entry point

### 10. Verify scratch-vm imports

Create a simple test or add a temporary console.log to verify:
```typescript
import VirtualMachine from 'scratch-vm';
const vm = new VirtualMachine();
console.log('scratch-vm loaded, targets:', vm.runtime.targets.length);
```

If this fails, troubleshoot the Vite/CJS config until scratch-vm loads in the browser.

### 11. Add scripts to package.json

Ensure these all work:
- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run lint`

### 12. Create `.env.example`

```
ANTHROPIC_API_KEY=your-key-here
```

Add `.env` to `.gitignore`.

---

## Acceptance Criteria

- [ ] `npm run dev` starts and shows "Tinker" in the browser
- [ ] `npm run build` completes without errors
- [ ] `npm run test` runs (even if no tests yet)
- [ ] `npm run lint` passes
- [ ] TypeScript strict mode is on, no `any` types
- [ ] Tailwind classes work (verify with a colored heading)
- [ ] All directories from AGENTS.md exist
- [ ] `scratch-vm` can be imported and instantiated without errors in the browser
- [ ] Type declarations exist for scratch-vm, scratch-render, scratch-storage
- [ ] `.env` is gitignored
