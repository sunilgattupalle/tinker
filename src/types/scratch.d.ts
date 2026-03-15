declare module 'scratch-vm' {
  class VirtualMachine {
    constructor()

    runtime: Runtime
    editingTarget: Target | null

    start(): void
    greenFlag(): void
    stopAll(): void

    loadProject(input: ArrayBuffer | string): Promise<void>
    saveProjectSb3(): Promise<Blob>

    setEditingTarget(targetId: string): void

    blockListener(event: unknown): void
    postIOData(device: string, data: unknown): void

    on(event: string, callback: (...args: unknown[]) => void): void
    off(event: string, callback: (...args: unknown[]) => void): void

    attachRenderer(renderer: unknown): void
    attachStorage(storage: unknown): void
    attachAudioEngine(audioEngine: unknown): void

    addSprite(input: string | ArrayBuffer): Promise<void>
    deleteSprite(targetId: string): void
    duplicateSprite(targetId: string): Promise<void>
    renameSprite(targetId: string, newName: string): void
  }

  interface Runtime {
    targets: Target[]
    getBlocksJSON(): object[]
    on(event: string, callback: (...args: unknown[]) => void): void
    attachRenderer(renderer: unknown): void
    attachStorage(storage: unknown): void
  }

  interface Target {
    id: string
    getName(): string
    isStage: boolean
    sprite: {
      name: string
      costumes: Costume[]
    }
    blocks: Blocks
    x: number
    y: number
    direction: number
    size: number
    visible: boolean
    currentCostume: number
  }

  interface Blocks {
    _blocks: Record<string, SB3Block>
    getBlock(blockId: string): SB3Block
    getScripts(): string[]
    getNextBlock(blockId: string): string | null
    getBranch(blockId: string, branchNum?: number): string | null
    getOpcode(block: SB3Block): string
  }

  interface SB3Block {
    id: string
    opcode: string
    next: string | null
    parent: string | null
    inputs: Record<string, unknown[]>
    fields: Record<string, unknown[]>
    shadow: boolean
    topLevel: boolean
    x?: number
    y?: number
    mutation?: Record<string, unknown>
  }

  interface Costume {
    name: string
    assetId: string
    md5ext: string
    dataFormat: string
    rotationCenterX: number
    rotationCenterY: number
  }

  export default VirtualMachine
}

declare module 'scratch-render' {
  class RenderWebGL {
    constructor(canvas: HTMLCanvasElement)
    draw(): void
    resize(width: number, height: number): void
    setLayerGroupOrdering(groups: string[]): void
  }
  export default RenderWebGL
}

declare module 'scratch-storage' {
  class ScratchStorage {
    constructor()
    addWebStore(types: unknown[], getAsset: unknown): void
    AssetType: Record<string, unknown>
  }
  export default ScratchStorage
}

declare module 'scratch-svg-renderer' {
  export class SVGRenderer {}
}
