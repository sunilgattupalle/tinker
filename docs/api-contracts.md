# API Contracts — Tinker

Interfaces between major components. These define the adapter layer that bridges our React UI with scratch-vm.

---

## scratch-vm Type Declarations (`src/types/scratch.d.ts`)

scratch-vm and scratch-render are JavaScript libraries without TypeScript types. Declare the subset we use:

```typescript
declare module 'scratch-vm' {
  class VirtualMachine {
    constructor();

    runtime: Runtime;
    editingTarget: Target | null;

    start(): void;
    greenFlag(): void;
    stopAll(): void;

    loadProject(input: ArrayBuffer | string): Promise<void>;
    saveProjectSb3(): Promise<Blob>;

    setEditingTarget(targetId: string): void;

    blockListener(event: unknown): void;
    postIOData(device: string, data: unknown): void;

    on(event: string, callback: (...args: unknown[]) => void): void;
    off(event: string, callback: (...args: unknown[]) => void): void;

    attachRenderer(renderer: unknown): void;
    attachStorage(storage: unknown): void;
    attachAudioEngine(audioEngine: unknown): void;
  }

  interface Runtime {
    targets: Target[];
    getBlocksJSON(): object[];
    on(event: string, callback: (...args: unknown[]) => void): void;
  }

  interface Target {
    id: string;
    getName(): string;
    isStage: boolean;
    sprite: {
      name: string;
      costumes: Costume[];
    };
    blocks: Blocks;
    x: number;
    y: number;
    direction: number;
    size: number;
    visible: boolean;
    currentCostume: number;
  }

  interface Blocks {
    _blocks: Record<string, SB3Block>;
    getBlock(blockId: string): SB3Block;
    getScripts(): string[];
    getNextBlock(blockId: string): string | null;
    getBranch(blockId: string, branchNum?: number): string | null;
    getOpcode(block: SB3Block): string;
  }

  interface SB3Block {
    id: string;
    opcode: string;
    next: string | null;
    parent: string | null;
    inputs: Record<string, unknown[]>;
    fields: Record<string, unknown[]>;
    shadow: boolean;
    topLevel: boolean;
    x?: number;
    y?: number;
    mutation?: Record<string, unknown>;
  }

  interface Costume {
    name: string;
    assetId: string;
    md5ext: string;
    dataFormat: string;
    rotationCenterX: number;
    rotationCenterY: number;
  }

  export default VirtualMachine;
}

declare module 'scratch-render' {
  class RenderWebGL {
    constructor(canvas: HTMLCanvasElement);
    draw(): void;
    resize(width: number, height: number): void;
    setLayerGroupOrdering(groups: string[]): void;
  }
  export default RenderWebGL;
}

declare module 'scratch-storage' {
  class ScratchStorage {
    constructor();
    addWebStore(types: unknown[], getAsset: unknown): void;
  }
  export default ScratchStorage;
}

declare module 'scratch-svg-renderer' {
  export class SVGRenderer {}
}
```

These declarations will be refined as we discover more of the API surface we need.

---

## Block Adapter Interface (`src/scratch/blockAdapter.ts`)

The bridge between our block UI and scratch-vm's workspace.

```typescript
interface BlockCreateOptions {
  opcode: string;
  inputs?: Record<string, unknown>;
  fields?: Record<string, unknown>;
  x?: number;
  y?: number;
}

interface UIBlock {
  id: string;
  opcode: string;
  category: string;
  color: string;
  label: string;
  shape: "stack" | "hat" | "cap" | "reporter" | "boolean";
  inputs: Record<string, { value: unknown; type: string }>;
  fields: Record<string, { value: unknown; options?: string[] }>;
  next: string | null;
  parent: string | null;
  topLevel: boolean;
  x?: number;
  y?: number;
  children?: Record<string, string>;
}

interface BlockAdapter {
  createBlock(targetId: string, options: BlockCreateOptions): string;
  connectBlocks(blockId: string, parentId: string, inputName?: string): void;
  disconnectBlock(blockId: string): void;
  deleteBlock(targetId: string, blockId: string): void;
  changeBlockInput(blockId: string, inputName: string, value: unknown): void;
  changeBlockField(blockId: string, fieldName: string, value: unknown): void;
  moveBlock(blockId: string, x: number, y: number): void;
  getBlocksForTarget(targetId: string): UIBlock[];
  getScriptRoots(targetId: string): string[];
}
```

---

## Sprite Adapter Interface (`src/scratch/spriteAdapter.ts`)

Bridges sprite UI with scratch-vm targets.

```typescript
interface UISprite {
  id: string;
  name: string;
  x: number;
  y: number;
  direction: number;
  size: number;
  visible: boolean;
  costumeName: string;
  costumeUrl?: string;
  isStage: boolean;
}

interface SpriteAdapter {
  getTargets(): UISprite[];
  getActiveTarget(): UISprite | null;
  setActiveTarget(targetId: string): void;
  addDefaultSprite(): Promise<void>;
  deleteSprite(targetId: string): void;
  getSpriteInfo(targetId: string): UISprite | null;
}
```

---

## Opcode Registry Interface (`src/scratch/opcodes.ts`)

Maps scratch-vm opcodes to UI-friendly metadata.

```typescript
interface OpcodeInfo {
  opcode: string;
  category: string;
  label: string;
  color: string;
  shape: "stack" | "hat" | "cap" | "reporter" | "boolean";
  inputs: OpcodeInput[];
  fields: OpcodeField[];
}

interface OpcodeInput {
  name: string;
  type: "number" | "string" | "block";
  defaultValue: unknown;
}

interface OpcodeField {
  name: string;
  options?: string[];
  defaultValue: unknown;
}

interface OpcodeRegistry {
  getAll(): OpcodeInfo[];
  getByCategory(category: string): OpcodeInfo[];
  getByOpcode(opcode: string): OpcodeInfo | undefined;
  getCategories(): string[];
  isValidOpcode(opcode: string): boolean;
}
```

---

## Project Store Interface (`src/store/project.ts`)

Zustand store that wraps scratch-vm state for React reactivity.

```typescript
interface ProjectStore {
  // Reactive state (updated from VM events)
  targets: UISprite[];
  editingTargetId: string | null;
  blocks: UIBlock[];
  isRunning: boolean;
  projectName: string;

  // Actions (delegate to adapters → VM)
  setEditingTarget: (targetId: string) => void;
  addSprite: () => Promise<void>;
  deleteSprite: (targetId: string) => void;
  greenFlag: () => void;
  stopAll: () => void;

  // Project I/O
  saveProject: () => Promise<Blob>;
  loadProject: (data: ArrayBuffer) => Promise<void>;
  loadDefaultProject: () => Promise<void>;
  setProjectName: (name: string) => void;

  // Subscribe to VM (called once during setup)
  initializeVM: (vm: VirtualMachine) => void;
}
```

---

## UI Store Interface (`src/store/ui.ts`)

UI-only state, not stored in scratch-vm.

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "cosmo";
  content: string;
  proposedBlocks?: ProposedBlockSet;
  accepted?: boolean;
  timestamp: number;
}

interface ProposedBlockSet {
  blocks: ProposedBlock[];
  targetSprite: string;
  action: "add_script" | "modify_script" | "add_blocks";
}

interface ProposedBlock {
  opcode: string;
  inputs?: Record<string, unknown>;
  fields?: Record<string, unknown>;
  next?: ProposedBlock;
  children?: Record<string, ProposedBlock>;
}

interface UIStore {
  // Block palette
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;

  // Chat
  chatMessages: ChatMessage[];
  isCosmoThinking: boolean;
  addUserMessage: (content: string) => void;
  addCosmoMessage: (content: string, proposedBlocks?: ProposedBlockSet) => void;
  markAccepted: (messageId: string) => void;
  setCosmoThinking: (thinking: boolean) => void;

  // Modals
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  // Welcome screen
  showWelcome: boolean;
  dismissWelcome: () => void;
}
```

---

## AI Client Interface (`src/ai/client.ts`)

```typescript
interface CosmoRequest {
  userMessage: string;
  projectContext: ProjectContext;
  conversationHistory: ChatMessage[];
}

interface ProjectContext {
  sprites: Array<{
    name: string;
    id: string;
    scripts: ScriptSummary[];
  }>;
  activeSpriteName: string;
  activeSpriteId: string;
}

interface ScriptSummary {
  topBlockOpcode: string;
  blockCount: number;
  description: string;
}

interface CosmoResponse {
  explanation: string;
  proposedBlocks: ProposedBlockSet;
}

async function askCosmo(request: CosmoRequest): Promise<CosmoResponse>;
```

The AI generates blocks using scratch-vm opcodes (e.g., `event_whenflagclicked`, `motion_movesteps`). The parser validates all opcodes against the opcode registry before presenting to the user.

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
