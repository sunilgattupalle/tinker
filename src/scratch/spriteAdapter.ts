export interface UISprite {
  id: string
  name: string
  x: number
  y: number
  direction: number
  size: number
  visible: boolean
  costumeName: string
  costumeUrl?: string
  isStage: boolean
}

export interface SpriteAdapter {
  getTargets: () => UISprite[]
}

export const spriteAdapter: SpriteAdapter = {
  getTargets: () => [],
}
