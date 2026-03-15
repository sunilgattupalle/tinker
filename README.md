# Tinker

> A Scratch-like AI coding app for kids (and curious adults).

Tinker is a browser-based visual coding environment where kids type what they want in plain English, and an AI character named **Cosmo** assembles Scratch-style blocks in response. Three-panel layout: block palette, script canvas, live sprite stage — all powered by Scratch's open-source engine under the hood.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173/tinker/](http://localhost:5173/tinker/) in your browser.

## Architecture

Tinker is a custom React UI layer on top of [scratch-vm](https://github.com/scratchfoundation/scratch-vm) (block execution) and [scratch-render](https://github.com/scratchfoundation/scratch-render) (sprite rendering). We build the UI, the AI integration, and the sharing system — Scratch's engine handles all block logic, concurrency, and rendering.

```
┌─────────────────────────────────────────────────┐
│              Tinker App (React)                  │
│                                                  │
│  [ Block Palette ] [ Script Canvas ] [ Stage ]   │
│  [            Cosmo AI Chat Bar               ]  │
│                                                  │
│              src/scratch/ adapters               │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │     Scratch Engine      │
        │  scratch-vm (BSD-3)     │
        │  scratch-render (AGPL)  │
        │  scratch-storage        │
        └─────────────────────────┘
```

See [docs/architecture.md](docs/architecture.md) for full details.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite + TypeScript (strict) |
| Styling | Tailwind CSS |
| Block execution | scratch-vm |
| Sprite rendering | scratch-render |
| AI | Claude API (via proxy) |
| State | Zustand |
| Testing | Vitest + React Testing Library |
| Hosting | GitHub Pages |

## Scripts

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Type-check + production build
npm run preview   # Preview production build locally
npm run test      # Run tests (Vitest)
npm run lint      # Lint (ESLint)
```

## Project Structure

```
src/
├── scratch/          # Adapter layer bridging UI ↔ scratch-vm
│   ├── setup.ts      # Initialize VM + Renderer + Storage
│   ├── blockAdapter.ts
│   ├── spriteAdapter.ts
│   └── opcodes.ts    # Opcode → UI metadata mapping
├── components/
│   ├── BlockPalette/ # Left panel: block categories + drag source
│   ├── ScriptCanvas/ # Middle panel: block workspace
│   ├── SpriteStage/  # Right panel: scratch-render canvas
│   ├── CosmoChat/    # Bottom bar: AI chat
│   └── ui/           # Shared primitives (Block, Toolbar)
├── ai/               # Claude API client + prompt + parser
├── store/            # Zustand stores (project + ui)
└── types/            # TypeScript types + scratch-vm declarations
```

## AI Integration

Cosmo, the AI character, translates natural language instructions into scratch-vm block operations:

1. Kid types "make the cat jump when I press space"
2. Claude API generates valid scratch-vm opcodes
3. Parser validates against the opcode registry
4. Kid reviews and clicks Accept
5. Blocks appear on the canvas, ready to run

## License

AGPL-3.0 (due to scratch-render dependency)
