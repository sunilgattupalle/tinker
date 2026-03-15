import type VirtualMachine from 'scratch-vm'

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

let vm: VirtualMachine | null = null

export function setSpriteVM(vmInstance: VirtualMachine) {
  vm = vmInstance
}

function getVMOrThrow(): VirtualMachine {
  if (!vm) throw new Error('VM not initialized. Call setSpriteVM() first.')
  return vm
}

export function getTargets(): UISprite[] {
  const v = getVMOrThrow()
  return v.runtime.targets
    .filter((t) => !t.isStage)
    .map(mapTarget)
}

export function getActiveTarget(): UISprite | null {
  const v = getVMOrThrow()
  const target = v.editingTarget
  if (!target || target.isStage) return null
  return mapTarget(target)
}

export function setActiveTarget(targetId: string): void {
  const v = getVMOrThrow()
  v.setEditingTarget(targetId)
}

export async function addDefaultSprite(): Promise<void> {
  const v = getVMOrThrow()
  const existingCount = v.runtime.targets.filter((t) => !t.isStage).length

  const spriteJson = {
    isStage: false,
    name: `Sprite${existingCount + 1}`,
    variables: {},
    lists: {},
    broadcasts: {},
    blocks: {},
    comments: {},
    currentCostume: 0,
    costumes: [
      {
        name: 'costume1',
        bitmapResolution: 1,
        dataFormat: 'svg',
        assetId: 'bcf454acf82e4504149f7ffe07081dbc',
        md5ext: 'bcf454acf82e4504149f7ffe07081dbc.svg',
        rotationCenterX: 48,
        rotationCenterY: 50,
      },
    ],
    sounds: [],
    volume: 100,
    visible: true,
    x: Math.round(Math.random() * 100 - 50),
    y: Math.round(Math.random() * 100 - 50),
    size: 100,
    direction: 90,
    draggable: false,
    rotationStyle: 'all around',
  }

  const payload = JSON.stringify({
    targets: [spriteJson],
    monitors: [],
    extensions: [],
    meta: { semver: '3.0.0', vm: '0.2.0', agent: 'tinker' },
  })
  await v.addSprite(payload)
}

export function deleteSprite(targetId: string): void {
  const v = getVMOrThrow()
  v.deleteSprite(targetId)
}

export function getSpriteInfo(targetId: string): UISprite | null {
  const v = getVMOrThrow()
  const target = v.runtime.targets.find((t) => t.id === targetId)
  if (!target) return null
  return mapTarget(target)
}

function mapTarget(t: { id: string; isStage: boolean; sprite: { name: string; costumes: Array<{ name: string }> }; x: number; y: number; direction: number; size: number; visible: boolean; currentCostume: number }): UISprite {
  return {
    id: t.id,
    name: t.sprite.name,
    x: Math.round(t.x),
    y: Math.round(t.y),
    direction: Math.round(t.direction),
    size: Math.round(t.size),
    visible: t.visible,
    costumeName: t.sprite.costumes[t.currentCostume]?.name ?? '',
    isStage: t.isStage,
  }
}

export const spriteAdapter = {
  getTargets,
  getActiveTarget,
  setActiveTarget,
  addDefaultSprite,
  deleteSprite,
  getSpriteInfo,
}
