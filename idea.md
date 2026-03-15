# Tinker — Project Notes

*An AI-powered creation platform for kids (and curious adults)*

---

## The Idea

Build a kid-friendly creation platform where kids bring ideas to life with AI help. Type what you want in plain English — the AI builds it.

**Two creation modes:**
- **Game Mode** — Scratch-style blocks and sprites. "Make the cat jump when I press space." AI assembles blocks.
- **Web Mode** — HTML/CSS websites with live preview. "Make a website about dinosaurs." AI writes the code.

Same AI helper (Cosmo), same encouraging tone, same "it works!" moment — just different canvases.

**The core insight:** Kids want to *make things*. Sometimes that's a game. Sometimes it's a website. The AI makes both accessible.

---

## Name: Tinker

**Why it works:**
- Timeless word — tinkering is what makers, inventors, and curious people do
- Works as both a verb and a noun: "I'm going to Tinker" / "I made this in Tinker"
- Suggests process over perfection — it's okay to mess around and break things
- Appeals to all ages — a 10-year-old and a 40-year-old both feel comfortable with it
- Logo potential: wrench, gear, lightbulb with a spark
- Tagline writes itself: *"Tinker. Build anything."*

**Variations considered:**
- Tinkr (app-style spelling)
- Tinker Studio (positions as a creative workspace)
- Tinker AI (makes AI collaboration explicit)

**Winner: plain Tinker** — clean, confident, no explanation needed.

---

## Names Explored (for fun)

### Fun & whimsical (original brief)
Bleep, Fizz, Glorp, Whizzle, Zappy, Poof!, Squiggle, Boing, Whoosh, Wobbly, Splat, Bonk, Zorp, Bibble, Gummy, Sprinkle, Noodle, Squish, Fizzbot, Whumble, Snorkel, Blobble, Zippling

### Broader appeal (revised brief — older kids + adults)
Tinker, Nudge, Cobble, Riff, Glitch, Spark, Static, Flux, Koda, Wren, Loom, Forge

---

## The User

- **Primary:** 10-year-old who already uses Scratch
- **Benefit of Scratch experience:** Block metaphor is already familiar — no learning curve on the interaction model, just adding an AI layer on top
- **Design implication:** Don't dumb it down. He'll notice if it's babyish.

---

## Product Design Principles

### What makes Scratch great (keep these)
- Blocks = no syntax errors. Kids never stare at a red underline.
- Immediate visual feedback — something runs, something moves
- Low floor, high ceiling — easy to start, room to grow

### What Tinker adds
- Natural language input: "make the cat jump when I press space"
- AI assembles the blocks in response
- AI narrates what it did in plain English
- Kid stays in control — AI suggests, kid approves

### The "it works!" moment
The first time a kid runs their project and it does exactly what they imagined — that UX moment is worth more than any feature. Design for that dopamine hit.

---

## AI Character: Cosmo

A small robot mascot (not a chatbot bubble) who lives in the corner of the screen. Speaks in short, enthusiastic sentences.

**Tone examples:**
- "Nice! I added a move block. That tells your sprite to go 10 steps forward 🚀"
- "Cool idea! Let's make your cat jump when you press Space 🐱"
- "Oops, that didn't work — want to try something different?"

**Key principle:** Encouraging without being condescending. Explains without overwhelming. Doesn't just do everything for the kid (that defeats the learning goal).

---

## App Layout

Three-panel layout with mode-specific content:

**Game Mode (Scratch-based):**
```
[ Block Palette ] [ Script Canvas ] [ Live Sprite Stage ]
                  [    AI Chat Bar (bottom)             ]
```

**Web Mode (HTML/CSS):**
```
[ Element Palette ] [ Code Editor ] [ Live Preview (iframe) ]
                    [    AI Chat Bar (bottom)               ]
```

The toolbar and Cosmo chat bar are shared across modes. The three middle panels change based on what the kid is building.

---

## Progressive Scaffolding

| Level | What the kid does | What the AI does |
|---|---|---|
| Beginner | Types in plain English | Does everything, explains simply |
| Intermediate | Reads and approves changes | Highlights the relevant block and explains it |
| Advanced | Edits code alongside AI | Pair programmer mode |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite (TypeScript, strict mode) |
| Styling | Tailwind CSS |
| Game Mode engine | scratch-vm + scratch-render (Scratch open source) |
| Web Mode preview | Sandboxed iframe with `srcdoc` |
| AI backend | Claude API (claude-sonnet) |
| State management | Zustand |
| API proxy | Vite dev server proxy (local) / Cloudflare Worker (prod) |
| Hosting | GitHub Pages (free, simple) |

---

## Hosting Setup

**Recommended: GitHub Pages + Vite**

```bash
npm create vite@latest tinker -- --template react
npm install gh-pages
# Add base path to vite.config.js
npm run deploy
# → live at your-username.github.io/tinker
```

**Free forever. No server costs.**

### Handling the API Key (important)

The Claude API key can't live in the frontend (it'd be public). Options:

| Option | Complexity | Best for |
|---|---|---|
| `npm run dev` locally | Zero | Home computer, family use |
| Cloudflare Worker proxy | Low | Hosting publicly |
| Vercel serverless function | Low | Hosting publicly |
| Local Express server | Low | Home network only |

**For a personal project on the family computer:** just run `npm run dev`. No hosting needed.

---

## GitHub Repo

**Decision: Not needed right now.**

The value of Tinker is the *experience*, not the code — so open sourcing isn't critical the way it would be for infrastructure (like Blockly). 

**Recommended path:**
1. Start private (or just local)
2. Build MVP, get real feedback from one very honest 10-year-old critic
3. Open source later if there's interest

---

## Comparable Products to Study

| Product | What to learn from it |
|---|---|
| **Scratch** (MIT) | Gold standard for kid-friendly coding UX, block interaction model |
| **Blockly** (Google) | Block-to-code abstraction, open source infrastructure |
| **Replit** | AI-assisted coding, less kid-focused but good reference |
| **Code.org** | Curriculum-driven scaffolding model |
| **Khanmigo** | AI tutor tone calibration — encouraging without being condescending |

---

## Sharing

Kids should be able to show what they made. No accounts needed — just export, import, and links.

- **Game Mode:** Export/import as `.sb3` files (compatible with Scratch). URL sharing with compression.
- **Web Mode:** Export as `.html` files (open in any browser). URL sharing with compression.
- **Drag and drop** — drag a file onto the app to import it.

---

## Future: Community & Marketplace

> *Parked for later. Full specs and architecture are in `specs/future/` and `docs/future/`.*

The community layer (gallery, remixing, profiles) is the long-term vision. The Scratch community is what makes Scratch sticky — Tinker will need this eventually. But the core playground with AI comes first.

---

## What's Built (Game Mode — Specs 01-07)

- [x] React + Vite + TypeScript scaffold with scratch-vm integration
- [x] Three-panel layout (palette, canvas, stage) with responsive design
- [x] Block system (palette, canvas, drag-and-drop, snapping) using scratch-vm
- [x] Sprite stage with scratch-render, green flag / stop, keyboard/mouse forwarding
- [x] Cosmo AI character with Claude API (prompts, parser, block proposals)
- [x] Starter templates (pet simulator, quiz game, story with choices)
- [x] Project sharing (export/import .sb3, shareable URLs with pako compression)

## Next Steps (Multi-Mode — Specs 08-09)

- [ ] Add mode system: "Build a Game" vs "Build a Website" on welcome screen
- [ ] Build Web Mode: code editor, live preview iframe, element palette
- [ ] Web Mode AI: HTML/CSS generation prompts, response parser, code application
- [ ] Web templates: blank page, about me, fun facts, photo gallery
- [ ] Web sharing: .html export, URL sharing
- [ ] Test with the actual user (the 10-year-old)
- [ ] Iterate based on one very honest critic

---

*Built for one kid. That's the best reason to build anything.*
