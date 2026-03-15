# Spec 01 — Project Scaffold

**Depends on:** Nothing
**Outcome:** A running React + Vite + TypeScript app with tooling configured and an empty shell.

---

## What to Build

Set up the project foundation. After this spec is complete, `npm run dev` should show a blank page with the Tinker title, and all tooling should work.

---

## Tasks

### 1. Initialize the project

```bash
npm create vite@latest . -- --template react-ts
```

Use the current directory (the repo root). Don't create a nested folder.

### 2. Install dependencies

```bash
npm install zustand
npm install -D tailwindcss @tailwindcss/vite postcss autoprefixer
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
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

### 5. Configure TypeScript

In `tsconfig.json`:
- `"strict": true`
- Path aliases: `@/` → `src/`

### 6. Configure Vitest

In `vite.config.ts` or `vitest.config.ts`:
- `environment: "jsdom"`
- `globals: true`
- Setup file for `@testing-library/jest-dom`

### 7. Create the directory structure

Create all the empty directories listed in `AGENTS.md` under "Directory Structure". Add `index.ts` barrel files where noted.

### 8. Create placeholder files

- `src/types/index.ts` — Export all shared types from `docs/api-contracts.md`
- `src/App.tsx` — Render a centered "Tinker" heading (proof of life)
- `src/main.tsx` — Standard React 18 entry point

### 9. Add scripts to package.json

Ensure these all work:
- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run lint`

### 10. Create `.env.example`

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
- [ ] Shared types are exported from `src/types/index.ts`
- [ ] `.env` is gitignored
