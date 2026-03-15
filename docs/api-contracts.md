# API Contracts — Tinker

Interfaces between major components. Agents should implement to these contracts so components remain interchangeable.

---

## Block Definitions → Palette & Canvas

The block registry is the single source of truth for what blocks exist.

```typescript
// src/blocks/definitions.ts

type BlockCategory =
  | "motion"
  | "looks"
  | "sound"
  | "events"
  | "control"
  | "sensing"
  | "operators"
  | "variables";

type BlockShape = "stack" | "hat" | "cap" | "reporter" | "boolean";

interface BlockInput {
  name: string;                          // e.g. "STEPS"
  type: "number" | "string" | "dropdown" | "boolean";
  default: any;                          // default value
  options?: string[];                    // for dropdowns
}

interface BlockDefinition {
  id: string;                            // unique ID, e.g. "motion_move"
  category: BlockCategory;
  label: string;                         // display label with placeholders: "move {STEPS} steps"
  color: string;                         // hex
  shape: BlockShape;
  inputs: BlockInput[];
}
```

---

## Block Instances → Project Store

When a block is placed on the canvas, it becomes an instance with concrete argument values.

```typescript
// src/types/index.ts

interface BlockInstance {
  id: string;                            // unique UUID
  definitionId: string;                  // references BlockDefinition.id
  args: Record<string, any>;             // { STEPS: 10 }
  next: string | null;                   // ID of next block in sequence
  parent: string | null;                 // ID of parent block (for nesting)
  branch?: Record<string, string>;       // for control blocks: { "if": "block-id", "else": "block-id" }
}

interface Script {
  id: string;
  hatBlockId: string;                    // the top-level event block
  blocks: Record<string, BlockInstance>; // all blocks in this script, indexed by ID
}
```

---

## Project Store API

```typescript
// src/store/project.ts

interface ProjectStore {
  // State
  project: Project;

  // Sprite CRUD
  addSprite: (sprite: Sprite) => void;
  removeSprite: (id: string) => void;
  setActiveSprite: (id: string) => void;

  // Block operations (on active sprite)
  addBlock: (block: BlockInstance, scriptId?: string) => void;
  removeBlock: (blockId: string) => void;
  moveBlock: (blockId: string, targetScriptId: string, afterBlockId: string | null) => void;
  updateBlockArgs: (blockId: string, args: Record<string, any>) => void;

  // Script operations
  addScript: (hatBlock: BlockInstance) => void;
  removeScript: (scriptId: string) => void;

  // Project operations
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  loadTemplate: (templateId: string) => void;
  resetProject: () => void;
}
```

---

## AI Client Interface

```typescript
// src/ai/client.ts

interface CosmoRequest {
  userMessage: string;                   // what the kid typed
  projectContext: ProjectContext;         // current state of the project
  conversationHistory: ChatMessage[];    // recent messages for context
}

interface ProjectContext {
  sprites: Array<{
    name: string;
    scripts: Script[];
  }>;
  activeSpriteId: string;
  availableBlocks: string[];             // list of block definition IDs
}

interface CosmoResponse {
  explanation: string;                   // Cosmo's plain-English explanation
  proposedBlocks: ProposedBlock[];       // blocks to add/modify
  targetSpriteId: string;               // which sprite to modify
  action: "add_script" | "modify_script" | "add_blocks";
}

interface ProposedBlock {
  definitionId: string;
  args: Record<string, any>;
  position: number;                      // order in the sequence
}

interface ChatMessage {
  role: "user" | "cosmo";
  content: string;
  proposedBlocks?: ProposedBlock[];
  accepted?: boolean;
}

async function askCosmo(request: CosmoRequest): Promise<CosmoResponse>;
```

---

## Block Interpreter Interface

```typescript
// src/blocks/interpreter.ts

interface InterpreterContext {
  sprite: Sprite;
  allSprites: Sprite[];
  stage: StageConfig;
  stopRequested: boolean;
}

interface Interpreter {
  runScript: (script: Script, context: InterpreterContext) => Promise<void>;
  runAllScripts: (trigger: "green_flag" | "key_press" | "sprite_click", key?: string) => void;
  stop: () => void;
  isRunning: () => boolean;
}
```

---

## Sprite Engine Interface

```typescript
// src/sprites/engine.ts

interface Sprite {
  id: string;
  name: string;
  x: number;                             // center x, 0 = stage center
  y: number;                             // center y, 0 = stage center
  direction: number;                     // degrees, 0 = up, clockwise
  size: number;                          // percentage, 100 = normal
  visible: boolean;
  costumes: Costume[];
  currentCostumeIndex: number;
  scripts: Script[];
  rotationStyle: "all_around" | "left_right" | "dont_rotate";
}

interface Costume {
  name: string;
  url: string;                           // path to image asset
  width: number;
  height: number;
  centerX: number;                       // rotation center
  centerY: number;
}

interface StageConfig {
  width: 480;
  height: 360;
  backdrop: string;                      // color or image URL
}
```

---

## Vite Dev Server Proxy (for Claude API)

```typescript
// vite.config.ts — proxy configuration

server: {
  proxy: {
    "/api/ai": {
      target: "https://api.anthropic.com",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/ai/, ""),
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
    },
  },
}
```

The frontend calls `/api/ai/v1/messages` — the proxy rewrites and adds the API key. The key lives in a `.env` file (gitignored).
