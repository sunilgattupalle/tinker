import VirtualMachine from 'scratch-vm'
import RenderWebGL from 'scratch-render'
import ScratchStorage from 'scratch-storage'
import { setVM } from './blockAdapter'

let vmInstance: VirtualMachine | null = null

const STAGE_LAYER_GROUPS = ['background', 'video', 'pen', 'sprite']

const ASSET_CDN = 'https://assets.scratch.mit.edu/internalapi/asset/'

export function initializeScratchVM(canvas: HTMLCanvasElement): VirtualMachine {
  if (vmInstance) return vmInstance

  vmInstance = new VirtualMachine()

  const renderer = new RenderWebGL(canvas)
  renderer.setLayerGroupOrdering(STAGE_LAYER_GROUPS)

  const storage = new ScratchStorage()
  const assetTypes = Object.values(storage.AssetType) as unknown[]
  storage.addWebStore(
    assetTypes,
    (asset: { assetId: string; dataFormat: string }) =>
      `${ASSET_CDN}${asset.assetId}.${asset.dataFormat}`,
  )

  vmInstance.attachRenderer(renderer)
  vmInstance.attachStorage(storage)
  setVM(vmInstance)

  return vmInstance
}

export async function loadDefaultProject(vm: VirtualMachine): Promise<void> {
  const resp = await fetch(`${import.meta.env.BASE_URL}assets/default-project.sb3`)
  const buffer = await resp.arrayBuffer()
  await vm.loadProject(buffer)
}

export function getVM(): VirtualMachine | null {
  return vmInstance
}
