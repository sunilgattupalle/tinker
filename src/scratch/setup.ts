import VirtualMachine from 'scratch-vm'
import * as ScratchRenderModule from 'scratch-render'
import * as ScratchStorageModule from 'scratch-storage'
import { setVM } from './blockAdapter'

/* eslint-disable @typescript-eslint/no-explicit-any */
function resolveConstructor<T>(mod: any, name: string): new (...args: any[]) => T {
  if (typeof mod === 'function') return mod
  if (mod[name] && typeof mod[name] === 'function') return mod[name]
  if (mod.default && typeof mod.default === 'function') return mod.default
  if (mod.default && mod.default[name] && typeof mod.default[name] === 'function') return mod.default[name]
  throw new Error(`Could not resolve constructor "${name}" from module`)
}
/* eslint-enable @typescript-eslint/no-explicit-any */

let vmInstance: VirtualMachine | null = null

const STAGE_LAYER_GROUPS = ['background', 'video', 'pen', 'sprite']
const ASSET_CDN = 'https://assets.scratch.mit.edu/internalapi/asset/'

export function initializeScratchVM(canvas: HTMLCanvasElement): VirtualMachine {
  if (vmInstance) return vmInstance

  vmInstance = new VirtualMachine()

  const RenderWebGL = resolveConstructor<{ draw(): void; resize(w: number, h: number): void; setLayerGroupOrdering(g: string[]): void }>(
    ScratchRenderModule,
    'ScratchRender',
  )
  const renderer = new RenderWebGL(canvas)
  renderer.setLayerGroupOrdering(STAGE_LAYER_GROUPS)

  const ScratchStorage = resolveConstructor<{ AssetType: Record<string, unknown>; addWebStore(t: unknown[], g: unknown): void }>(
    ScratchStorageModule,
    'ScratchStorage',
  )
  const storage = new ScratchStorage()
  const assetTypes = Object.values(storage.AssetType) as unknown[]
  storage.addWebStore(
    assetTypes,
    (asset: { assetId: string; dataFormat: string }) =>
      `${ASSET_CDN}${asset.assetId}.${asset.dataFormat}/get/`,
  )

  vmInstance.attachRenderer(renderer)
  vmInstance.attachStorage(storage)
  setVM(vmInstance)

  return vmInstance
}

const DEFAULT_PROJECT = {
  targets: [
    {
      isStage: true,
      name: 'Stage',
      variables: {},
      lists: {},
      broadcasts: {},
      blocks: {},
      comments: {},
      currentCostume: 0,
      costumes: [
        {
          name: 'backdrop1',
          dataFormat: 'svg',
          assetId: 'cd21514d0531fdffb22204e0ec5ed84a',
          md5ext: 'cd21514d0531fdffb22204e0ec5ed84a.svg',
          rotationCenterX: 240,
          rotationCenterY: 180,
        },
      ],
      sounds: [],
      volume: 100,
      layerOrder: 0,
      tempo: 60,
      videoTransparency: 50,
      videoState: 'off',
    },
    {
      isStage: false,
      name: 'Sprite1',
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
      sounds: [
        {
          name: 'Meow',
          assetId: '83c36d806dc92327b9e7049a565c6bff',
          dataFormat: 'wav',
          md5ext: '83c36d806dc92327b9e7049a565c6bff.wav',
          rate: 22050,
          sampleCount: 18688,
        },
      ],
      volume: 100,
      visible: true,
      x: 0,
      y: 0,
      size: 100,
      direction: 90,
      draggable: false,
      rotationStyle: 'all around',
      layerOrder: 1,
    },
  ],
  monitors: [],
  extensions: [],
  meta: { semver: '3.0.0', vm: '0.2.0', agent: 'tinker' },
}

export async function loadDefaultProject(vm: VirtualMachine): Promise<void> {
  await vm.loadProject(JSON.stringify(DEFAULT_PROJECT))
}

export function getVM(): VirtualMachine | null {
  return vmInstance
}
